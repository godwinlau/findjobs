import crypto from "crypto";
import { normalizeLocation, SEARCH_QUERIES } from "@/lib/queries";
import { extractSkillsWithStructured } from "@/lib/skills/groq-extraction";
import type { SkillStructuredEntry } from "@/lib/skills/groq-extraction";
import { extractSalaryFromDescription } from "@/lib/linkedin-jobs";
import { createServiceClient } from "@/lib/supabase-server";
import { logger } from "@/lib/logger";

const log = logger.child({ module: "jsearch" });

// ─── Constants ───

const JSEARCH_HOST = "jsearch.p.rapidapi.com";
const JSEARCH_BASE = `https://${JSEARCH_HOST}`;

// Free tier: 200 req/month → ~6 per day
const DAILY_REQUEST_BUDGET = 6;

// PHP conversion rates (same as linkedin-jobs.ts)
const PHP_USD_RATE = 56;
const PHP_GBP_RATE = 72;
const PHP_EUR_RATE = 62;

// ─── JSearch API response types ───

interface JSearchJob {
  job_id: string;
  job_title: string;
  employer_name: string;
  employer_logo: string | null;
  employer_website: string | null;
  job_employment_type: string;
  job_description: string;
  job_is_remote: boolean;
  job_apply_link: string;
  job_city: string | null;
  job_state: string | null;
  job_country: string;
  job_min_salary: number | null;
  job_max_salary: number | null;
  job_salary_currency: string | null;
  job_salary_period: string | null;
  job_required_skills: string[] | null;
  job_required_experience: {
    no_experience_required: boolean;
    required_experience_in_months: number | null;
    experience_mentioned: boolean;
    experience_preferred: boolean;
  } | null;
  job_highlights: {
    Qualifications?: string[];
    Responsibilities?: string[];
  } | null;
  job_posted_at_timestamp: number;
  job_posted_at_datetime_utc: string;
}

interface JSearchResponse {
  status: string;
  request_id: string;
  data: JSearchJob[];
}

// ─── Public result type ───

export interface JSearchIngestionResult {
  queries: string[];
  requestsUsed: number;
  totalFetched: number;
  totalInserted: number;
  totalDuplicates: number;
  totalErrors: number;
  durationMs: number;
}

// ─── Fetch jobs from JSearch API ───

async function fetchJSearchJobs(
  query: string,
  apiKey: string
): Promise<JSearchJob[]> {
  const params = new URLSearchParams({
    query: `${query} in Philippines`,
    country: "ph",
    date_posted: "week",
    num_pages: "1",
  });

  const res = await fetch(`${JSEARCH_BASE}/search?${params}`, {
    headers: {
      "X-RapidAPI-Key": apiKey,
      "X-RapidAPI-Host": JSEARCH_HOST,
    },
  });

  if (!res.ok) {
    throw new Error(`JSearch API ${res.status}: ${res.statusText}`);
  }

  const json: JSearchResponse = await res.json();
  return json.data || [];
}

// ─── Normalize a JSearch job into our DB schema ───

async function normalizeJSearchJob(raw: JSearchJob) {
  const location = normalizeLocation(raw.job_city);
  const plainText = stripHtml(raw.job_description || "");

  // ── LLM extraction (skills + experience + salary) ──
  const extraction = plainText
    ? await extractSkillsWithStructured(plainText)
    : { skills_required: [], skills_structured: [], experience_level: null, salary_min: null, salary_max: null, salary_is_estimate: false };

  // ── Skills: prefer JSearch API structured list, fall back to LLM ──
  let skills: string[];
  let skills_structured: SkillStructuredEntry[];
  if (raw.job_required_skills && raw.job_required_skills.length > 0) {
    skills = raw.job_required_skills.map((s) => s.toLowerCase());
    // Still use LLM structured entries for ontology-normalized data if available
    skills_structured = extraction.skills_structured.length > 0
      ? extraction.skills_structured
      : skills.map((s) => ({
          skillId: s.toLowerCase().replace(/\s+/g, "_"),
          label: s,
          importance: "important" as const,
          confidence: 0.95,
          domain: "other",
          tier: "important" as const,
        }));
  } else {
    skills = extraction.skills_required;
    skills_structured = extraction.skills_structured;
  }

  // ── Experience: JSearch API structured data → title inference → LLM fallback ──
  const apiExperience = inferExperienceLevel(raw);
  const experienceLevel = apiExperience ?? extraction.experience_level;

  // ── Salary: Tier 1 (API) → Tier 2 (regex) → Tier 3 (LLM) ──
  let salary = convertSalary(raw);
  let salaryIsEstimate = false;
  if (salary.min === null && salary.max === null && plainText) {
    const descSalary = extractSalaryFromDescription(plainText);
    if (descSalary.min !== null || descSalary.max !== null) {
      salary = descSalary;
      salaryIsEstimate = true;
    }
  }
  // Tier 3: LLM extraction fallback
  if (salary.min === null && salary.max === null) {
    if (extraction.salary_min !== null || extraction.salary_max !== null) {
      salary = { min: extraction.salary_min, max: extraction.salary_max };
      salaryIsEstimate = true;
    }
  }

  return {
    source: "jsearch" as const,
    source_id: raw.job_id,
    source_hash: generateSourceHash(
      raw.employer_name,
      raw.job_title,
      location.city
    ),
    title: raw.job_title,
    company_name: raw.employer_name,
    company_logo_url: raw.employer_logo || null,
    description: raw.job_description || "",
    description_plain: plainText,
    salary_min: salary.min,
    salary_max: salary.max,
    salary_is_estimate: salaryIsEstimate,
    location_city: location.city,
    location_area: location.area,
    work_setup: raw.job_is_remote
      ? ("remote" as const)
      : inferWorkSetup(raw.job_title, raw.job_city || "", plainText),
    job_type: mapEmploymentType(raw.job_employment_type || ""),
    experience_level: experienceLevel,
    skills_required: skills,
    skills_structured,
    apply_url: raw.job_apply_link,
    posted_at: raw.job_posted_at_datetime_utc || new Date().toISOString(),
    expires_at: null,
    fetched_at: new Date().toISOString(),
    is_active: true,
  };
}

// ─── Salary conversion ───
// JSearch provides structured salary with currency and period.
// Convert everything to monthly PHP.

function convertSalary(
  job: JSearchJob
): { min: number | null; max: number | null } {
  if (job.job_min_salary == null && job.job_max_salary == null) {
    return { min: null, max: null };
  }

  let currencyMultiplier = 1;
  const currency = (job.job_salary_currency || "").toUpperCase();
  if (currency === "USD") currencyMultiplier = PHP_USD_RATE;
  else if (currency === "GBP") currencyMultiplier = PHP_GBP_RATE;
  else if (currency === "EUR") currencyMultiplier = PHP_EUR_RATE;

  let periodMultiplier = 1;
  const period = (job.job_salary_period || "").toUpperCase();
  if (period === "YEAR") periodMultiplier = 1 / 12;
  else if (period === "HOUR") periodMultiplier = 160;
  else if (period === "WEEK") periodMultiplier = 4;

  const toMonthlyPhp = (n: number | null) =>
    n !== null ? Math.round(n * currencyMultiplier * periodMultiplier) : null;

  return {
    min: toMonthlyPhp(job.job_min_salary),
    max: toMonthlyPhp(job.job_max_salary),
  };
}

// ─── Employment type mapping ───

function mapEmploymentType(
  type: string
): "full_time" | "part_time" | "contract" | "freelance" | "internship" | null {
  const upper = (type || "").toUpperCase();
  if (upper === "FULLTIME") return "full_time";
  if (upper === "PARTTIME") return "part_time";
  if (upper === "CONTRACTOR") return "contract";
  if (upper === "INTERN") return "internship";
  return null;
}

// ─── Experience level inference ───
// Uses JSearch's structured experience data when available

function inferExperienceLevel(
  job: JSearchJob
): "entry" | "junior" | "mid" | "senior" | null {
  const exp = job.job_required_experience;
  if (exp) {
    if (exp.no_experience_required) return "entry";
    const months = exp.required_experience_in_months;
    if (months !== null) {
      if (months <= 12) return "entry";
      if (months <= 36) return "junior";
      if (months <= 72) return "mid";
      return "senior";
    }
  }

  // Fall back to title-based inference
  const lower = job.job_title.toLowerCase();
  if (
    lower.includes("senior") ||
    lower.includes("lead") ||
    lower.includes("manager") ||
    lower.includes("director")
  )
    return "senior";
  if (lower.includes("junior") || lower.includes("jr")) return "junior";
  if (
    lower.includes("intern") ||
    lower.includes("entry") ||
    lower.includes("fresh")
  )
    return "entry";
  return null;
}

// ─── Work setup inference ───

function inferWorkSetup(
  title: string,
  location: string,
  description: string
): "onsite" | "hybrid" | "remote" | null {
  const combined = `${title} ${location} ${description}`.toLowerCase();
  if (
    combined.includes("remote") ||
    combined.includes("wfh") ||
    combined.includes("work from home")
  )
    return "remote";
  if (combined.includes("hybrid")) return "hybrid";
  return "onsite";
}

// ─── Helpers ───

function generateSourceHash(
  company: string,
  title: string,
  city: string | null
): string {
  const normalized = [
    company.toLowerCase().trim(),
    title.toLowerCase().trim(),
    (city || "").toLowerCase().trim(),
  ].join("|");
  return crypto.createHash("md5").update(normalized).digest("hex");
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(?:p|div|h[1-6]|li|tr)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// ─── Query rotation ───
// Rotates through SEARCH_QUERIES daily so all 35 queries
// get covered over a ~6 day cycle (35 / 6 ≈ 6 days)

function getJSearchQueriesForToday(): string[] {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor(
    (now.getTime() - startOfYear.getTime()) / 86_400_000
  );
  const startIdx =
    (dayOfYear * DAILY_REQUEST_BUDGET) % SEARCH_QUERIES.length;

  const queries: string[] = [];
  for (let i = 0; i < DAILY_REQUEST_BUDGET; i++) {
    queries.push(SEARCH_QUERIES[(startIdx + i) % SEARCH_QUERIES.length]);
  }
  return queries;
}

// ─── Main ingestion function ───
// Called by the daily cron alongside LinkedIn ingestion.
// Gracefully skips if RAPIDAPI_KEY is not set.

export async function runJSearchIngestion(
  options?: { allQueries?: boolean }
): Promise<JSearchIngestionResult> {
  const start = Date.now();
  const apiKey = process.env.RAPIDAPI_KEY;

  // No API key → skip silently (not all environments need JSearch)
  if (!apiKey) {
    return {
      queries: [],
      requestsUsed: 0,
      totalFetched: 0,
      totalInserted: 0,
      totalDuplicates: 0,
      totalErrors: 0,
      durationMs: Date.now() - start,
    };
  }

  const supabase = createServiceClient();
  const queries = options?.allQueries
    ? [...SEARCH_QUERIES]
    : getJSearchQueriesForToday();
  let requestsUsed = 0;
  let totalFetched = 0;
  let totalInserted = 0;
  let totalDuplicates = 0;
  let totalErrors = 0;

  for (const query of queries) {
    const queryStart = Date.now();
    let qFetched = 0;
    let qInserted = 0;
    let qDuplicates = 0;
    let qErrors = 0;
    let qErrorDetails: string | null = null;

    try {
      const rawJobs = await fetchJSearchJobs(query, apiKey);
      requestsUsed++;
      qFetched = rawJobs.length;

      if (rawJobs.length > 0) {
        // Normalize jobs sequentially (LLM extraction needs rate limiting)
        const normalized = [];
        for (const job of rawJobs) {
          normalized.push(await normalizeJSearchJob(job));
        }

        // Cross-source dedup by hash
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

        const toInsert = normalized.filter(
          (j) => !existingHashes.has(j.source_hash)
        );
        qDuplicates += normalized.length - toInsert.length;

        if (toInsert.length > 0) {
          const { data: inserted, error } = await supabase
            .from("jobs")
            .upsert(toInsert, {
              onConflict: "source,source_id",
              ignoreDuplicates: true,
            })
            .select("id");

          if (error) {
            qErrors++;
            qErrorDetails = error.message;
          } else {
            qInserted = inserted?.length || 0;
            qDuplicates += toInsert.length - qInserted;
            // Embeddings are generated asynchronously by the backfill-embeddings cron
          }
        }
      }
    } catch (err) {
      qErrors++;
      qErrorDetails = err instanceof Error ? err.message : String(err);
    }

    const qDurationMs = Date.now() - queryStart;

    // Log to ingestion_logs (same table as LinkedIn)
    await supabase.from("ingestion_logs").insert({
      source: "jsearch",
      batch: 0,
      query,
      fetched: qFetched,
      inserted: qInserted,
      duplicates: qDuplicates,
      errors: qErrors,
      error_details: qErrorDetails,
      duration_ms: qDurationMs,
    });

    totalFetched += qFetched;
    totalInserted += qInserted;
    totalDuplicates += qDuplicates;
    totalErrors += qErrors;

    // Rate limit between requests
    await new Promise((r) => setTimeout(r, 1000));
  }

  return {
    queries,
    requestsUsed,
    totalFetched,
    totalInserted,
    totalDuplicates,
    totalErrors,
    durationMs: Date.now() - start,
  };
}
