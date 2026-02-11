import { createServiceClient } from "@/lib/supabase-server";
import {
  fetchLinkedInJobs,
  scrapeJobDescription,
  extractSalaryFromDescription,
  normalizeJob,
  generateSourceHash,
  NormalizedJob,
  type ScrapedDescription,
} from "@/lib/linkedin-jobs";
import { normalizeLocation, getQueriesForBatch } from "@/lib/queries";
import { logger } from "@/lib/logger";

const log = logger.child({ module: "ingest" });

// ─── Types ───

interface IngestResult {
  query: string;
  fetched: number;
  inserted: number;
  duplicates: number;
  errors: number;
  errorDetails: string | null;
  durationMs: number;
}

export interface BatchResult {
  batch: number;
  results: IngestResult[];
  totalFetched: number;
  totalInserted: number;
  totalDuplicates: number;
  totalErrors: number;
  durationMs: number;
}

// ─── Run a single batch ───

export async function runIngestionBatch(batch: number): Promise<BatchResult> {
  const batchStart = Date.now();
  const queries = getQueriesForBatch(batch);
  const results: IngestResult[] = [];
  const supabase = createServiceClient();

  for (const query of queries) {
    const queryStart = Date.now();
    const result: IngestResult = {
      query,
      fetched: 0,
      inserted: 0,
      duplicates: 0,
      errors: 0,
      errorDetails: null,
      durationMs: 0,
    };

    try {
      // 1. Fetch from LinkedIn guest API
      const rawJobs = await fetchLinkedInJobs(query);
      result.fetched = rawJobs.length;

      if (rawJobs.length === 0) {
        result.durationMs = Date.now() - queryStart;
        results.push(result);
        continue;
      }

      // 2. Early dedup — check DB before scraping/normalizing
      const earlyHashes = rawJobs.map((r) => {
        const loc = normalizeLocation(r.location);
        return { raw: r, hash: generateSourceHash(r.company, r.position, loc.city) };
      });
      const hashList = earlyHashes.map((h) => h.hash);
      const { data: existingByHash } = await supabase
        .from("jobs")
        .select("source_hash")
        .in("source_hash", hashList);

      const existingHashes = new Set(
        (existingByHash || []).map(
          (r: { source_hash: string }) => r.source_hash
        )
      );

      const newJobs = earlyHashes.filter((h) => !existingHashes.has(h.hash));
      result.duplicates += rawJobs.length - newJobs.length;

      if (newJobs.length === 0) {
        result.durationMs = Date.now() - queryStart;
        results.push(result);
        continue;
      }

      // 3. Scrape descriptions only for new jobs (fast: ~500ms each)
      const scraped: { raw: typeof rawJobs[0]; desc: ScrapedDescription }[] = [];
      for (const { raw } of newJobs) {
        try {
          const desc = await scrapeJobDescription(raw.jobUrl);
          scraped.push({ raw, desc });
          await sleep(500);
        } catch {
          result.errors++;
        }
      }

      // 4. Sort by salary presence — jobs with salary info first
      scraped.sort((a, b) => {
        const aHasSalary = hasSalarySignal(a.raw.salary, a.desc.plain);
        const bHasSalary = hasSalarySignal(b.raw.salary, b.desc.plain);
        if (aHasSalary && !bHasSalary) return -1;
        if (!aHasSalary && bHasSalary) return 1;
        return 0;
      });

      // 5. Normalize (LLM extraction) — salary jobs processed first
      const normalized: NormalizedJob[] = [];
      for (const { raw, desc } of scraped) {
        try {
          normalized.push(await normalizeJob(raw, desc));
          // Throttle Groq calls to avoid 429s
          await sleep(3000);
        } catch {
          result.errors++;
        }
      }

      const toInsert = normalized;

      if (toInsert.length === 0) {
        result.durationMs = Date.now() - queryStart;
        results.push(result);
        continue;
      }

      // 7. Upsert — ON CONFLICT (source, source_id) handles exact dupes
      const { data: inserted, error } = await supabase
        .from("jobs")
        .upsert(toInsert, {
          onConflict: "source,source_id",
          ignoreDuplicates: true,
        })
        .select("id");

      if (error) {
        result.errors++;
        result.errorDetails = error.message;
      } else {
        result.inserted = inserted?.length || 0;
        result.duplicates += toInsert.length - result.inserted;
        // Embeddings are generated asynchronously by the backfill-embeddings cron
      }
    } catch (err) {
      result.errors++;
      result.errorDetails = err instanceof Error ? err.message : String(err);
    }

    result.durationMs = Date.now() - queryStart;
    results.push(result);

    // Log this query's result
    await supabase.from("ingestion_logs").insert({
      source: "linkedin",
      batch,
      query: result.query,
      fetched: result.fetched,
      inserted: result.inserted,
      duplicates: result.duplicates,
      errors: result.errors,
      error_details: result.errorDetails,
      duration_ms: result.durationMs,
    });

    // Rate limit: be respectful to LinkedIn's guest API
    await sleep(2000);
  }

  return {
    batch,
    results,
    totalFetched: results.reduce((s, r) => s + r.fetched, 0),
    totalInserted: results.reduce((s, r) => s + r.inserted, 0),
    totalDuplicates: results.reduce((s, r) => s + r.duplicates, 0),
    totalErrors: results.reduce((s, r) => s + r.errors, 0),
    durationMs: Date.now() - batchStart,
  };
}

// ─── Cleanup expired jobs ───

export async function cleanupExpiredJobs(): Promise<{ deactivated: number }> {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("jobs")
    .update({ is_active: false })
    .eq("is_active", true)
    .lt("expires_at", new Date().toISOString())
    .select("id");

  if (error) {
    throw new Error(`Cleanup error: ${error.message}`);
  }

  return { deactivated: data?.length || 0 };
}

// ─── Helpers ───

/** Quick check: does this job have any salary signal (API field or description regex)? */
function hasSalarySignal(apiSalary: string, plainText: string): boolean {
  if (apiSalary && apiSalary.trim() !== "") return true;
  if (!plainText) return false;
  const descSalary = extractSalaryFromDescription(plainText);
  return descSalary.min !== null || descSalary.max !== null;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
