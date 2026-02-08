import { createServiceClient } from "@/lib/supabase-server";
import {
  fetchLinkedInJobs,
  scrapeJobDescription,
  normalizeJob,
  NormalizedJob,
} from "@/lib/linkedin-jobs";
import { getQueriesForBatch } from "@/lib/queries";
import { embedAndStoreJobs } from "@/lib/embeddings";

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

      // 2. Scrape descriptions and normalize all jobs
      const normalized: NormalizedJob[] = [];
      for (const raw of rawJobs) {
        try {
          const desc = await scrapeJobDescription(raw.jobUrl);
          normalized.push(normalizeJob(raw, desc));
          // Small delay between description scrapes
          await sleep(500);
        } catch {
          result.errors++;
        }
      }

      // 3. Check for cross-source duplicates by hash
      const hashes = normalized.map((j) => j.source_hash);
      const { data: existingByHash } = await supabase
        .from("jobs")
        .select("source_hash")
        .in("source_hash", hashes);

      const existingHashes = new Set(
        (existingByHash || []).map(
          (r: { source_hash: string }) => r.source_hash
        )
      );

      // 4. Filter out cross-source dupes
      const toInsert = normalized.filter(
        (j) => !existingHashes.has(j.source_hash)
      );
      const crossDupes = normalized.length - toInsert.length;
      result.duplicates += crossDupes;

      if (toInsert.length === 0) {
        result.durationMs = Date.now() - queryStart;
        results.push(result);
        continue;
      }

      // 5. Upsert — ON CONFLICT (source, source_id) handles exact dupes
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

        // Generate embeddings for newly inserted jobs (non-fatal)
        if (inserted && inserted.length > 0) {
          try {
            // Re-fetch the inserted jobs to get full data for embedding
            const insertedIds = (inserted as { id: string }[]).map((r) => r.id);
            const { data: embeddingRows } = await supabase
              .from("jobs")
              .select("id, title, skills_required, experience_level, work_setup, description_plain")
              .in("id", insertedIds);

            if (embeddingRows && embeddingRows.length > 0) {
              await embedAndStoreJobs(
                embeddingRows as { id: string; title: string; skills_required: string[]; experience_level: string | null; work_setup: string | null; description_plain: string }[],
                supabase,
              );
            }
          } catch {
            // Non-fatal: embedding failures don't block ingestion
          }
        }
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

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
