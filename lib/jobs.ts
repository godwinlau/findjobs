import { createServiceClient } from "@/lib/supabase-server";
import { extractSalaryFromDescription } from "@/lib/linkedin-jobs";
import { extractEducation, getEducationLabel } from "@/lib/queries";
import { Job, PaginatedJobs, Profile } from "@/lib/types";
import {
  computeMatchScore,
  isProfileSufficient,
  computeQualityScore,
  formatHighlight,
  MATCH_SCORE_THRESHOLD,
} from "@/lib/matching";

// ─── Search helpers ───

/** Strip characters that are unsafe in PostgREST filter values */
function sanitizeSearchQuery(raw: string): string {
  return raw.replace(/[\\%_(),:!]/g, "").trim();
}

/**
 * Build the `.or()` filter string for a search query.
 * - >= 3 chars → FTS on search_vector (GIN index) + ILIKE on location cols
 * - < 3 chars  → ILIKE on title, company_name, location_city, location_area only
 *                (skips description_plain to avoid full sequential scan)
 */
function buildSearchFilter(query: string): string {
  const sanitized = sanitizeSearchQuery(query);
  if (!sanitized) return "";

  if (sanitized.length >= 3) {
    // wfts = websearch_to_tsquery: handles natural language ("react developer" → 'react' & 'developer')
    return `search_vector.wfts(english).${sanitized},location_city.ilike.%${sanitized}%,location_area.ilike.%${sanitized}%`;
  }

  // Short queries: ILIKE on short columns only (no description_plain)
  const pattern = `%${sanitized}%`;
  return `title.ilike.${pattern},company_name.ilike.${pattern},location_city.ilike.${pattern},location_area.ilike.${pattern}`;
}

// ─── DB row type ───

interface JobRow {
  id: string;
  source: string;
  title: string;
  company_name: string;
  company_verified: boolean;
  company_logo_url: string | null;
  description: string;
  description_plain: string;
  salary_min: number | null;
  salary_max: number | null;
  salary_is_estimate: boolean;
  location_city: string | null;
  location_area: string | null;
  work_setup: string | null;
  job_type: string | null;
  experience_level: string | null;
  skills_required: string[];
  apply_url: string;
  posted_at: string;
  expires_at: string | null;
  is_active: boolean;
  applicant_count: number;
  view_count: number;
}

// ─── Job detail (full fields for /jobs/[id] page) ───

export interface JobDetail extends Job {
  descriptionFull: string;
  skills: string[];
  experienceLevel: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryIsEstimate: boolean;
  postedAt: string;
  expiresAt: string | null;
  viewCount: number;
}

// ─── Fetch active jobs from Supabase ───

interface GetActiveJobsParams {
  query?: string;
  page?: number;
  pageSize?: number;
  profile?: Profile | null;
}

// Columns needed for the feed display (Phase 2 / fallback path)
const FEED_COLUMNS = [
  "id", "source", "title", "company_name", "company_verified",
  "company_logo_url", "description_plain",
  "salary_min", "salary_max", "salary_is_estimate",
  "location_city", "location_area", "work_setup", "job_type",
  "experience_level", "skills_required", "apply_url",
  "posted_at", "expires_at", "is_active", "applicant_count",
].join(",");

// Lightweight columns for scoring only (Phase 1) — no text-heavy fields.
// ~200 bytes/row vs ~5KB/row with description_plain.
const SCORING_COLUMNS = [
  "id", "title", "skills_required",
  "salary_min", "salary_max",
  "location_city", "work_setup", "job_type", "experience_level",
  "posted_at",
].join(",");

export async function getActiveJobs({
  query,
  page = 1,
  pageSize = 20,
  profile,
}: GetActiveJobsParams = {}): Promise<PaginatedJobs> {
  const supabase = createServiceClient();

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const useMatchScoring = isProfileSufficient(profile ?? null);

  if (useMatchScoring) {
    return getActiveJobsMatchScored(supabase, { query, page, pageSize, from, to, profile: profile! });
  }

  // ── Sparse profile fallback: DB-level pagination, posted_at sort ──

  let builder = supabase
    .from("jobs")
    .select(FEED_COLUMNS, { count: "exact" })
    .eq("is_active", true)
    .order("posted_at", { ascending: false });

  if (query) {
    const filter = buildSearchFilter(query);
    if (filter) builder = builder.or(filter);
  }

  const { data, error, count } = await builder.range(from, to);

  if (error) {
    console.error("Failed to fetch jobs:", error.message);
    return { jobs: [], total: 0, page, pageSize, totalPages: 0, isMatchFiltered: false };
  }

  const total = count ?? 0;
  if (!data || data.length === 0) {
    return { jobs: [], total, page, pageSize, totalPages: Math.ceil(total / pageSize), isMatchFiltered: false };
  }

  const rows = data as unknown as JobRow[];
  backfillSalaryIfNeeded(rows, supabase);

  const isFirstPageNoSearch = page === 1 && !query;
  const jobs: Job[] = rows.map((row, i) => {
    const result = computeMatchScore(row, profile ?? null);
    return mapRowToJob(row, result, isFirstPageNoSearch && i === 0);
  });

  return { jobs, total, page, pageSize, totalPages: Math.ceil(total / pageSize), isMatchFiltered: false };
}

// ── Two-phase match-scored fetch ──
// Phase 1: Lightweight query (structured columns only) → score + sort all jobs
// Phase 2: Full query for the page slice IDs → build Job objects
// This avoids transferring description_plain (~5KB/row) for every active job.

async function getActiveJobsMatchScored(
  supabase: ReturnType<typeof createServiceClient>,
  opts: { query?: string; page: number; pageSize: number; from: number; to: number; profile: Profile },
): Promise<PaginatedJobs> {
  const { query, page, pageSize, from, to, profile } = opts;

  // Phase 1 — lightweight scoring query
  let scoringBuilder = supabase
    .from("jobs")
    .select(SCORING_COLUMNS, { count: "exact" })
    .eq("is_active", true)
    .order("posted_at", { ascending: false });

  if (query) {
    const filter = buildSearchFilter(query);
    if (filter) scoringBuilder = scoringBuilder.or(filter);
  }

  const { data: scoringData, error, count } = await scoringBuilder;

  if (error) {
    console.error("Failed to fetch jobs for scoring:", error.message);
    return { jobs: [], total: 0, page, pageSize, totalPages: 0, isMatchFiltered: !query };
  }

  const total = count ?? 0;
  if (!scoringData || scoringData.length === 0) {
    return { jobs: [], total, page, pageSize, totalPages: Math.ceil(total / pageSize), isMatchFiltered: !query };
  }

  const scoringRows = scoringData as unknown as ScoringRow[];

  // Score and sort
  const scored = scoringRows.map((row) => ({
    id: row.id,
    postedAt: row.posted_at,
    result: computeMatchScore(row, profile),
  }));

  scored.sort((a, b) => {
    if (b.result.score !== a.result.score) return b.result.score - a.result.score;
    return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
  });

  // Hard-filter low-match jobs from the feed (only when not searching)
  const filtered = query
    ? scored
    : scored.filter((s) => s.result.score >= MATCH_SCORE_THRESHOLD);
  const filteredTotal = filtered.length;

  const pageSlice = filtered.slice(from, to + 1);
  if (pageSlice.length === 0) {
    return { jobs: [], total: filteredTotal, page, pageSize, totalPages: Math.ceil(filteredTotal / pageSize), isMatchFiltered: !query };
  }

  // Phase 2 — full detail fetch for page IDs only
  const pageIds = pageSlice.map((s) => s.id);

  const { data: fullData } = await supabase
    .from("jobs")
    .select(FEED_COLUMNS)
    .in("id", pageIds);

  if (!fullData || fullData.length === 0) {
    return { jobs: [], total: filteredTotal, page, pageSize, totalPages: Math.ceil(filteredTotal / pageSize), isMatchFiltered: !query };
  }

  const fullRows = fullData as unknown as JobRow[];
  backfillSalaryIfNeeded(fullRows, supabase);

  // Build a map to maintain score-sorted order
  const rowMap = new Map(fullRows.map((r) => [r.id, r]));
  const isFirstPageNoSearch = page === 1 && !query;

  const jobs: Job[] = pageSlice
    .map(({ id, result }, i) => {
      const row = rowMap.get(id);
      if (!row) return null;
      return mapRowToJob(row, result, isFirstPageNoSearch && i === 0);
    })
    .filter((j): j is Job => j !== null);

  return { jobs, total: filteredTotal, page, pageSize, totalPages: Math.ceil(filteredTotal / pageSize), isMatchFiltered: !query };
}

// ── Shared row → Job mapper ──

interface ScoringRow {
  id: string;
  title: string;
  skills_required: string[];
  salary_min: number | null;
  salary_max: number | null;
  location_city: string | null;
  work_setup: string | null;
  job_type: string | null;
  experience_level: string | null;
  posted_at: string;
}

function mapRowToJob(row: JobRow, result: { score: number; scoreRange?: [number, number]; highlight: string | null; matchedSkills?: string[] }, isTop: boolean): Job {
  return {
    id: row.id,
    company: row.company_name ?? "",
    verified: row.company_verified ?? false,
    logo: (row.company_name ?? "?").charAt(0).toUpperCase(),
    logoUrl: row.company_logo_url || null,
    logoBg: getLogoBg(row.company_name ?? ""),
    logoColor: "#fff",
    role: row.title,
    salary: formatSalary(row.salary_min, row.salary_max, row.salary_is_estimate ?? false),
    location: formatLocation(row.location_city, row.location_area ?? null),
    type: formatJobType(row.job_type, row.work_setup),
    match: result.score,
    matchRange: result.scoreRange,
    posted: formatRelativeTime(row.posted_at),
    applicants: row.applicant_count ?? 0,
    closing: formatClosing(row.expires_at ?? null),
    responseTime: null,
    highlight: result.highlight,
    matchedSkills: result.matchedSkills,
    isTop,
    desc: (() => { const d = stripDescriptionHeading(row.description_plain ?? ""); return d.slice(0, 300) + (d.length > 300 ? "..." : ""); })(),
    applyUrl: row.apply_url ?? "",
    source: row.source ?? "",
    education: getEducationLabel(extractEducation(row.description_plain ?? "")),
  };
}

// ─── Top matched jobs (lightweight, for Home dashboard) ───

export async function getTopMatchedJobs({
  profile,
  limit = 5,
}: {
  profile: Profile | null;
  limit?: number;
}): Promise<{ jobs: Job[]; totalMatches: number }> {
  const supabase = createServiceClient();

  const useMatchScoring = isProfileSufficient(profile);

  if (!useMatchScoring) {
    // Sparse profile: return most recent jobs, no match count
    const { data } = await supabase
      .from("jobs")
      .select(FEED_COLUMNS)
      .eq("is_active", true)
      .order("posted_at", { ascending: false })
      .range(0, limit - 1);

    if (!data || data.length === 0) {
      return { jobs: [], totalMatches: 0 };
    }

    const rows = data as unknown as JobRow[];
    backfillSalaryIfNeeded(rows, supabase);

    const jobs: Job[] = rows.map((row, i) => {
      const result = computeMatchScore(row, profile);
      return mapRowToJob(row, result, i === 0);
    });

    return { jobs, totalMatches: 0 };
  }

  // Phase 1 — lightweight scoring of all active jobs
  const { data: scoringData } = await supabase
    .from("jobs")
    .select(SCORING_COLUMNS)
    .eq("is_active", true)
    .order("posted_at", { ascending: false });

  if (!scoringData || scoringData.length === 0) {
    return { jobs: [], totalMatches: 0 };
  }

  const scoringRows = scoringData as unknown as ScoringRow[];

  const scored = scoringRows.map((row) => ({
    id: row.id,
    postedAt: row.posted_at,
    result: computeMatchScore(row, profile!),
  }));

  scored.sort((a, b) => {
    if (b.result.score !== a.result.score) return b.result.score - a.result.score;
    return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
  });

  const aboveThreshold = scored.filter((s) => s.result.score >= MATCH_SCORE_THRESHOLD);
  const totalMatches = aboveThreshold.length;
  const topSlice = aboveThreshold.slice(0, limit);

  if (topSlice.length === 0) {
    return { jobs: [], totalMatches: 0 };
  }

  // Phase 2 — full detail fetch for top IDs only
  const topIds = topSlice.map((s) => s.id);
  const { data: fullData } = await supabase
    .from("jobs")
    .select(FEED_COLUMNS)
    .in("id", topIds);

  if (!fullData || fullData.length === 0) {
    return { jobs: [], totalMatches };
  }

  const fullRows = fullData as unknown as JobRow[];
  backfillSalaryIfNeeded(fullRows, supabase);

  const rowMap = new Map(fullRows.map((r) => [r.id, r]));

  const jobs: Job[] = topSlice
    .map(({ id, result }, i) => {
      const row = rowMap.get(id);
      if (!row) return null;
      return mapRowToJob(row, result, i === 0);
    })
    .filter((j): j is Job => j !== null);

  return { jobs, totalMatches };
}

// ─── Fetch a single job by ID ───
// Split into fetch (DB call) + build (pure computation) so callers
// can run the fetch in parallel with other async work.

export async function fetchJobRow(id: string): Promise<JobRow | null> {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .single();

  if (error || !data) {
    console.error("Failed to fetch job:", error?.message);
    return null;
  }

  const row = data as JobRow;
  backfillSalaryIfNeeded([row], supabase);
  return row;
}

export function buildJobDetail(row: JobRow, profile?: Profile | null): JobDetail {
  const matchResult = computeMatchScore(row, profile ?? null);

  return {
    id: row.id,
    company: row.company_name ?? "",
    verified: row.company_verified ?? false,
    logo: (row.company_name ?? "?").charAt(0).toUpperCase(),
    logoUrl: row.company_logo_url || null,
    logoBg: getLogoBg(row.company_name ?? ""),
    logoColor: "#fff",
    role: row.title,
    salary: formatSalary(row.salary_min, row.salary_max, row.salary_is_estimate ?? false),
    location: formatLocation(row.location_city, row.location_area ?? null),
    type: formatJobType(row.job_type, row.work_setup),
    match: matchResult.score,
    posted: formatRelativeTime(row.posted_at),
    applicants: row.applicant_count ?? 0,
    closing: formatClosing(row.expires_at ?? null),
    responseTime: null,
    highlight: matchResult.highlight,
    isTop: false,
    desc: (() => { const d = stripDescriptionHeading(row.description_plain ?? ""); return d.slice(0, 300) + (d.length > 300 ? "..." : ""); })(),
    applyUrl: row.apply_url ?? "",
    source: row.source ?? "",
    education: getEducationLabel(extractEducation(row.description_plain ?? "")),
    descriptionFull: formatDescriptionHtml(row.description ?? "", row.description_plain ?? ""),
    skills: row.skills_required,
    experienceLevel: row.experience_level,
    salaryMin: row.salary_min,
    salaryMax: row.salary_max,
    salaryIsEstimate: row.salary_is_estimate ?? false,
    postedAt: row.posted_at,
    expiresAt: row.expires_at ?? null,
    viewCount: row.view_count ?? 0,
  };
}

// Convenience wrapper for simple callers
export async function getJobById(id: string, profile?: Profile | null): Promise<JobDetail | null> {
  const row = await fetchJobRow(id);
  if (!row) return null;
  return buildJobDetail(row, profile);
}

// ─── Lazy salary backfill ───
// Re-parse salary from description for jobs with null salary.
// Updates the DB row in-place and mutates the row object so callers see the result.

// Threshold: ₱150K+/month without explicit monthly indicator is likely annual
const PHP_MONTHLY_SANITY_THRESHOLD = 150_000;

async function backfillSalaryIfNeeded(
  rows: JobRow[],
  supabase: ReturnType<typeof createServiceClient>
): Promise<void> {
  for (const row of rows) {
    // Case 1: No salary at all — try extracting from description
    if (row.salary_min === null && row.salary_max === null && row.description_plain) {
      const salary = extractSalaryFromDescription(row.description_plain);
      if (salary.min === null && salary.max === null) continue;

      row.salary_min = salary.min;
      row.salary_max = salary.max;
      row.salary_is_estimate = true;

      supabase
        .from("jobs")
        .update({
          salary_min: salary.min,
          salary_max: salary.max,
          salary_is_estimate: true,
        })
        .eq("id", row.id)
        .then(({ error }) => {
          if (error) console.error(`Salary backfill failed for job ${row.id}:`, error.message);
        });
      continue;
    }

    // Case 2: Salary is unrealistically high — likely annual, fix to monthly
    // Skip estimated salaries — extractSalaryFromDescription already normalizes periods
    if (row.salary_is_estimate) continue;

    const hasHighSalary =
      (row.salary_min !== null && row.salary_min >= PHP_MONTHLY_SANITY_THRESHOLD) ||
      (row.salary_max !== null && row.salary_max >= PHP_MONTHLY_SANITY_THRESHOLD);

    if (hasHighSalary) {
      const fixedMin = row.salary_min !== null ? Math.round(row.salary_min / 12) : null;
      const fixedMax = row.salary_max !== null ? Math.round(row.salary_max / 12) : null;

      row.salary_min = fixedMin;
      row.salary_max = fixedMax;

      supabase
        .from("jobs")
        .update({
          salary_min: fixedMin,
          salary_max: fixedMax,
        })
        .eq("id", row.id)
        .then(({ error }) => {
          if (error) console.error(`Salary fix failed for job ${row.id}:`, error.message);
        });
    }
  }
}

// ─── Description heading cleanup ───
// Strip redundant heading prefixes that add no value to the reader

const DESC_HEADING_RE = /^[\s\n]*(?:(?:Job|Role|Position)\s*(?:Description|Summary|Overview)|About\s*(?:the\s*(?:Role|Position|Job|Company|Opportunity))?|Summary|Description|Overview|The\s*(?:Role|Opportunity|Company|Position)|Who\s*We\s*Are|Company\s*(?:Overview|Profile|Background))\s*:?\s*/i;

// Handles cases where a heading got concatenated with body text that starts the same way
// e.g. "Our ClientOur client is a..." → "Our client is a..."
const DUPLICATE_PREFIX_RE = /^(Our\s*Client|The\s*Company|Who\s*We\s*Are)\s*:?\s*(?=\1)/i;

// Fix missing spaces from HTML-to-text extraction
// "CompanyDescription" → "Company Description", "tasks:Manage" → "tasks: Manage"
function fixConcatenatedWords(text: string): string {
  return text
    .replace(/([a-z])([A-Z])/g, "$1 $2")        // camelCase boundary
    .replace(/([a-z]):([A-Z])/g, "$1: $2")       // colon without space
    .replace(/([.!?])([A-Z])/g, "$1 $2")         // sentence end without space
    .replace(/([a-z])\(([A-Z])/g, "$1 ($2")      // word(Word → word (Word
    .replace(/([)])([A-Z])/g, "$1 $2");           // )Word → ) Word
}

function stripDescriptionHeading(text: string): string {
  return fixConcatenatedWords(
    text.replace(DESC_HEADING_RE, "").replace(DUPLICATE_PREFIX_RE, "")
  ).trim();
}

// ─── Description formatting ───
// Converts plain text descriptions into structured HTML with
// section headers, bullet lists, and paragraph spacing.

function formatDescriptionHtml(html: string, plain: string): string {
  // If the HTML has real structure (lists, paragraphs, headers), use it directly
  if (html && /<(?:ul|ol|li|p|h[1-4]|br)\b/i.test(html)) {
    // Strip redundant heading tags from HTML
    const DESC_TAG = `(?:(?:Job|Role|Position)\\s*(?:Description|Summary|Overview)|About\\s*(?:the\\s*(?:Role|Position|Job|Company|Opportunity))?|Summary|Description|Overview|The\\s*(?:Role|Opportunity|Company|Position)|Who\\s*We\\s*Are|Company\\s*(?:Overview|Profile|Background))`;
    return html
      .replace(new RegExp(`<(h[1-4]|p|div|span|strong|b)[^>]*>\\s*${DESC_TAG}\\s*:?\\s*<\\/\\1>`, "gi"), "")
      .replace(DESC_HEADING_RE, "")
      .trim();
  }

  // Otherwise, convert plain text to structured HTML
  let text = plain || html;
  if (!text) return "";

  text = stripDescriptionHeading(text);

  // Split into blocks separated by blank lines
  const blocks: string[][] = [];
  let current: string[] = [];

  for (const raw of text.split(/\n/)) {
    const trimmed = raw.trim();
    if (trimmed === "") {
      if (current.length > 0) {
        blocks.push(current);
        current = [];
      }
    } else {
      current.push(trimmed);
    }
  }
  if (current.length > 0) blocks.push(current);

  const result: string[] = [];

  for (const block of blocks) {
    if (block.length === 1) {
      const line = block[0];
      // Single-line block: could be a disclaimer, bullet, header, or paragraph

      // Disclaimer/notice line (check first — takes priority over bullets)
      if (isDisclaimer(line)) {
        result.push(`<p><strong>${escapeHtml(line)}</strong></p>`);
        continue;
      }

      // Explicit bullet line (•, ▸, ►, ●, ‣, -, *)
      const bulletMatch = line.match(/^[\u2022\u25B8\u25BA\u25CF\u2023\-\*]\s+(.+)/);
      if (bulletMatch) {
        result.push(`<ul><li>${escapeHtml(bulletMatch[1])}</li></ul>`);
        continue;
      }

      // Section header: short, no "Key: Value" pattern, starts with uppercase
      if (isSectionHeader(line)) {
        const label = line.endsWith(":") ? line.slice(0, -1) : line;
        result.push(`<h3>${escapeHtml(label)}</h3>`);
        continue;
      }

      // Regular line: key-value or paragraph
      result.push(formatLine(line));
      continue;
    }

    // Multi-line block: check if it's a list or paragraph(s)

    // Check if first line is a header with content following it
    let startIdx = 0;
    if (isSectionHeader(block[0])) {
      const label = block[0].endsWith(":") ? block[0].slice(0, -1) : block[0];
      result.push(`<h3>${escapeHtml(label)}</h3>`);
      startIdx = 1;
    }

    const remaining = block.slice(startIdx);
    if (remaining.length === 0) continue;

    // Check if all remaining lines are disclaimers (e.g. block of → lines)
    const allDisclaimers = remaining.every((l) => isDisclaimer(l));
    if (allDisclaimers) {
      for (const line of remaining) {
        result.push(`<p><strong>${escapeHtml(line)}</strong></p>`);
      }
      continue;
    }

    // Check if remaining lines look like a list:
    // - All lines start with explicit bullets, OR
    // - 3+ lines, each < 150 chars (looks like consecutive items)
    const hasBullets = remaining.every((l) =>
      /^[\u2022\u25B8\u25BA\u25CF\u2023\-\*]\s+/.test(l)
    );

    const looksLikeList =
      remaining.length >= 3 &&
      remaining.every((l) => l.length < 150) &&
      !remaining.some((l) => /^(We |The |This |Our |A |An |It |To |In )/.test(l) && l.endsWith("."));

    if (hasBullets) {
      result.push("<ul>");
      for (const line of remaining) {
        const m = line.match(/^[\u2022\u25B8\u25BA\u25CF\u2023\-\*]\s+(.+)/);
        result.push(`<li>${escapeHtml(m ? m[1] : line)}</li>`);
      }
      result.push("</ul>");
    } else if (looksLikeList) {
      result.push("<ul>");
      for (const line of remaining) {
        result.push(`<li>${escapeHtml(line)}</li>`);
      }
      result.push("</ul>");
    } else {
      // Regular paragraphs
      for (const line of remaining) {
        result.push(formatLine(line));
      }
    }
  }

  return result.join("\n");
}

function isSectionHeader(line: string): boolean {
  if (line.length > 60) return false;
  if (!(/^[A-Z]/.test(line))) return false;

  // "Key Responsibilities:" — label with trailing colon, nothing after
  if (line.endsWith(":") && !/:\s+\S/.test(line)) return true;

  // Short title-like line: no colon-value pattern, doesn't end with period
  if (
    !line.endsWith(".") &&
    !line.endsWith(",") &&
    !/:\s+\S/.test(line) && // exclude "Key: Value" pairs
    line.split(" ").length <= 8
  ) {
    return true;
  }

  return false;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Detect disclaimer/notice lines and wrap in <strong>
const DISCLAIMER_RE =
  /^(?:note\s*:|please\s+note|important\s*:|disclaimer\s*:|n\.?b\.?\s*:|→\s|►\s|⚠)/i;

function isDisclaimer(line: string): boolean {
  return DISCLAIMER_RE.test(line);
}

function formatLine(line: string): string {
  if (isDisclaimer(line)) {
    return `<p><strong>${escapeHtml(line)}</strong></p>`;
  }

  const kvMatch = line.match(/^([A-Z][A-Za-z\s&\/]+):\s+(.+)/);
  if (kvMatch && kvMatch[1].length <= 40) {
    return `<p><strong>${escapeHtml(kvMatch[1])}:</strong> ${escapeHtml(kvMatch[2])}</p>`;
  }

  return `<p>${escapeHtml(line)}</p>`;
}

// ─── Formatters ───

function formatSalary(min: number | null, max: number | null, isEstimate: boolean = false): string {
  if (!min && !max) return "Salary not disclosed";
  const fmt = (n: number) => (n >= 1000 ? `₱${Math.round(n / 1000)}K` : `₱${n}`);
  let result: string;
  if (min && max) result = `${fmt(min)} – ${fmt(max)}`;
  else if (min) result = `From ${fmt(min)}`;
  else result = `Up to ${fmt(max!)}`;
  return isEstimate ? `${result} (est.)` : result;
}

function formatLocation(city: string | null, area: string | null): string {
  // Use the most specific part only (area or city), not the full address
  const raw = area || city || "Philippines";
  // Take the first segment before any comma
  return raw.split(",")[0].trim();
}

function formatJobType(jobType: string | null, workSetup: string | null): string {
  const types: Record<string, string> = {
    full_time: "Full-time",
    part_time: "Part-time",
    contract: "Contract",
    freelance: "Freelance",
    internship: "Internship",
  };

  const setups: Record<string, string> = {
    onsite: "Onsite",
    hybrid: "Hybrid",
    remote: "Remote",
  };

  const t = jobType ? types[jobType] || "Full-time" : "Full-time";
  const s = workSetup ? setups[workSetup] || "" : "";

  return s ? `${t} · ${s}` : t;
}

function formatRelativeTime(isoDate: string): string {
  const now = Date.now();
  const then = new Date(isoDate).getTime();
  const diffMs = now - then;

  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins}m ago`;

  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days === 1) return "1d ago";
  if (days < 7) return `${days}d ago`;

  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}

function formatClosing(expiresAt: string | null): string | null {
  if (!expiresAt) return null;

  const now = Date.now();
  const expires = new Date(expiresAt).getTime();
  const daysLeft = Math.ceil((expires - now) / (1000 * 60 * 60 * 24));

  if (daysLeft <= 0) return "Closed";
  if (daysLeft === 1) return "Closes tomorrow";
  if (daysLeft <= 7) return `Closes in ${daysLeft} days`;
  return null;
}

// computeQualityScore and formatHighlight moved to lib/matching.ts

// ─── Deterministic logo color from company name ───

const LOGO_COLORS = [
  "#7C3AED", "#0EA5E9", "#F59E0B", "#10B981",
  "#EF4444", "#8B5CF6", "#06B6D4", "#F97316",
  "#14B8A6", "#EC4899", "#6366F1", "#84CC16",
];

function getLogoBg(companyName: string): string {
  let hash = 0;
  for (let i = 0; i < companyName.length; i++) {
    hash = companyName.charCodeAt(i) + ((hash << 5) - hash);
  }
  return LOGO_COLORS[Math.abs(hash) % LOGO_COLORS.length];
}

// ─── Explore page: all active jobs with manual filters ───

export type ExploreSort = "recency" | "match" | "salary_desc" | "salary_asc";

interface GetExploreJobsParams {
  query?: string;
  workSetup?: string;
  jobType?: string;
  experienceLevel?: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  datePosted?: string; // "24h" | "3d" | "7d" | "14d" | "30d"
  verifiedOnly?: boolean;
  sort?: ExploreSort;
  page?: number;
  pageSize?: number;
  profile?: Profile | null;
}

function getDateCutoff(datePosted: string): string | null {
  const hours: Record<string, number> = {
    "24h": 24,
    "3d": 72,
    "7d": 168,
    "14d": 336,
    "30d": 720,
  };
  const h = hours[datePosted];
  if (!h) return null;
  return new Date(Date.now() - h * 3600000).toISOString();
}

export async function getExploreJobs({
  query,
  workSetup,
  jobType,
  experienceLevel,
  location,
  salaryMin,
  salaryMax,
  datePosted,
  verifiedOnly,
  sort = "recency",
  page = 1,
  pageSize = 20,
  profile,
}: GetExploreJobsParams = {}): Promise<PaginatedJobs> {
  const supabase = createServiceClient();

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // For match sort, use two-phase scoring (no threshold)
  if (sort === "match") {
    return getExploreJobsMatchSorted(supabase, {
      query, workSetup, jobType, experienceLevel, location,
      salaryMin, salaryMax, datePosted, verifiedOnly,
      page, pageSize, from, to, profile: profile ?? null,
    });
  }

  // DB-sorted paths: recency, salary_desc, salary_asc
  const columns = FEED_COLUMNS;
  let builder = supabase
    .from("jobs")
    .select(columns, { count: "exact" })
    .eq("is_active", true);

  // Apply filters
  builder = applyExploreFilters(builder, {
    query, workSetup, jobType, experienceLevel, location,
    salaryMin, salaryMax, datePosted, verifiedOnly,
  });

  // Apply sort
  if (sort === "salary_desc") {
    builder = builder.order("salary_max", { ascending: false, nullsFirst: false });
  } else if (sort === "salary_asc") {
    builder = builder.order("salary_min", { ascending: true, nullsFirst: false });
  } else {
    builder = builder.order("posted_at", { ascending: false });
  }

  const { data, error, count } = await builder.range(from, to);

  if (error) {
    console.error("Failed to fetch explore jobs:", error.message);
    return { jobs: [], total: 0, page, pageSize, totalPages: 0, isMatchFiltered: false };
  }

  const total = count ?? 0;
  if (!data || data.length === 0) {
    return { jobs: [], total, page, pageSize, totalPages: Math.ceil(total / pageSize), isMatchFiltered: false };
  }

  const rows = data as unknown as JobRow[];
  backfillSalaryIfNeeded(rows, supabase);

  const jobs: Job[] = rows.map((row) => {
    const result = computeMatchScore(row, profile ?? null);
    return mapRowToJob(row, result, false);
  });

  return { jobs, total, page, pageSize, totalPages: Math.ceil(total / pageSize), isMatchFiltered: false };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyExploreFilters(builder: any, filters: {
  query?: string;
  workSetup?: string;
  jobType?: string;
  experienceLevel?: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  datePosted?: string;
  verifiedOnly?: boolean;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
}): any {
  const { query, workSetup, jobType, experienceLevel, location, salaryMin, salaryMax, datePosted, verifiedOnly } = filters;

  if (query) {
    const filter = buildSearchFilter(query);
    if (filter) builder = builder.or(filter);
  }
  if (workSetup) builder = builder.eq("work_setup", workSetup);
  if (jobType) builder = builder.eq("job_type", jobType);
  if (experienceLevel) {
    // "fresh_graduate" is a profile enum value — map it to "entry" for the jobs table
    const jobLevel = experienceLevel === "fresh_graduate" ? "entry" : experienceLevel;
    builder = builder.eq("experience_level", jobLevel);
  }
  if (location) builder = builder.ilike("location_city", `%${location}%`);
  if (salaryMin) builder = builder.gte("salary_max", salaryMin);
  if (salaryMax) builder = builder.lte("salary_min", salaryMax);
  if (datePosted) {
    const cutoff = getDateCutoff(datePosted);
    if (cutoff) builder = builder.gte("posted_at", cutoff);
  }
  if (verifiedOnly) builder = builder.eq("company_verified", true);

  return builder;
}

async function getExploreJobsMatchSorted(
  supabase: ReturnType<typeof createServiceClient>,
  opts: {
    query?: string; workSetup?: string; jobType?: string;
    experienceLevel?: string; location?: string;
    salaryMin?: number; salaryMax?: number;
    datePosted?: string; verifiedOnly?: boolean;
    page: number; pageSize: number; from: number; to: number;
    profile: Profile | null;
  },
): Promise<PaginatedJobs> {
  const { page, pageSize, from, to, profile } = opts;

  // If profile is insufficient for scoring, fall back to recency
  if (!isProfileSufficient(profile)) {
    return getExploreJobs({ ...opts, sort: "recency", profile });
  }

  // Phase 1 — lightweight scoring query
  let scoringBuilder = supabase
    .from("jobs")
    .select(SCORING_COLUMNS, { count: "exact" })
    .eq("is_active", true)
    .order("posted_at", { ascending: false });

  scoringBuilder = applyExploreFilters(scoringBuilder, opts);

  const { data: scoringData, error, count } = await scoringBuilder;

  if (error) {
    console.error("Failed to fetch explore jobs for scoring:", error.message);
    return { jobs: [], total: 0, page, pageSize, totalPages: 0, isMatchFiltered: false };
  }

  if (!scoringData || scoringData.length === 0) {
    const total = count ?? 0;
    return { jobs: [], total, page, pageSize, totalPages: Math.ceil(total / pageSize), isMatchFiltered: false };
  }

  const scoringRows = scoringData as unknown as ScoringRow[];

  // Score and sort — NO threshold filtering
  const scored = scoringRows.map((row) => ({
    id: row.id,
    postedAt: row.posted_at,
    result: computeMatchScore(row, profile),
  }));

  scored.sort((a, b) => {
    if (b.result.score !== a.result.score) return b.result.score - a.result.score;
    return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
  });

  const total = scored.length;
  const pageSlice = scored.slice(from, to + 1);

  if (pageSlice.length === 0) {
    return { jobs: [], total, page, pageSize, totalPages: Math.ceil(total / pageSize), isMatchFiltered: false };
  }

  // Phase 2 — full detail fetch for page IDs only
  const pageIds = pageSlice.map((s) => s.id);
  const { data: fullData } = await supabase
    .from("jobs")
    .select(FEED_COLUMNS)
    .in("id", pageIds);

  if (!fullData || fullData.length === 0) {
    return { jobs: [], total, page, pageSize, totalPages: Math.ceil(total / pageSize), isMatchFiltered: false };
  }

  const fullRows = fullData as unknown as JobRow[];
  backfillSalaryIfNeeded(fullRows, supabase);

  const rowMap = new Map(fullRows.map((r) => [r.id, r]));
  const jobs: Job[] = pageSlice
    .map(({ id, result }) => {
      const row = rowMap.get(id);
      if (!row) return null;
      return mapRowToJob(row, result, false);
    })
    .filter((j): j is Job => j !== null);

  return { jobs, total, page, pageSize, totalPages: Math.ceil(total / pageSize), isMatchFiltered: false };
}

// ─── Job freshness indicator ───

export async function getJobsLastUpdated(): Promise<{ lastUpdated: string | null; totalActiveJobs: number }> {
  const supabase = createServiceClient();

  const { data, error, count } = await supabase
    .from("jobs")
    .select("posted_at", { count: "exact" })
    .eq("is_active", true)
    .order("posted_at", { ascending: false })
    .limit(1);

  if (error || !data || data.length === 0) {
    return { lastUpdated: null, totalActiveJobs: 0 };
  }

  return {
    lastUpdated: (data[0] as { posted_at: string }).posted_at,
    totalActiveJobs: count ?? 0,
  };
}

// ─── Distinct locations for filter dropdown (cached) ───

let _locationCache: { data: string[]; ts: number } | null = null;
const LOCATION_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getDistinctLocations(): Promise<string[]> {
  const now = Date.now();
  if (_locationCache && now - _locationCache.ts < LOCATION_CACHE_TTL) {
    return _locationCache.data;
  }

  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("jobs")
    .select("location_city")
    .eq("is_active", true)
    .not("location_city", "is", null)
    .order("location_city", { ascending: true });

  if (error || !data) {
    console.error("Failed to fetch locations:", error?.message);
    // Return stale cache if available
    return _locationCache?.data ?? [];
  }

  const unique = [...new Set(
    (data as { location_city: string }[])
      .map((r) => r.location_city)
      .filter(Boolean)
  )];

  const sorted = unique.sort();
  _locationCache = { data: sorted, ts: now };
  return sorted;
}
