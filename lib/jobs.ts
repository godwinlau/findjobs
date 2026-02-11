import { createServiceClient } from "@/lib/supabase-server";
import { extractEducation, getEducationLabel } from "@/lib/queries";
import { Job, PaginatedJobs, CursorPaginatedJobs, Profile } from "@/lib/types";
import type { SkillStructuredEntry } from "@/lib/skills/groq-extraction";
import {
  computeMatchScore,
  isProfileSufficient,
  computeQualityScore,
  formatHighlight,
  MATCH_SCORE_THRESHOLD,
  ScoringOptions,
} from "@/lib/matching";
import { buildProfileEmbeddingText, generateEmbeddingSafe } from "@/lib/embeddings";
import { filterByRoleCategory } from "@/lib/role-gates";
import { readMatchCache } from "@/lib/match-cache";
import { unstable_cache } from "next/cache";
import { logger } from "@/lib/logger";

const log = logger.child({ module: "jobs" });

// ─── Search helpers ───

/** Strip characters that are unsafe in PostgREST filter values */
function sanitizeSearchQuery(raw: string): string {
  return raw
    .replace(/[\-–—]/g, " ")        // Replace dashes with space (avoid FTS negation operator)
    .replace(/[\\%_(),:!]/g, "")     // Strip unsafe chars
    .replace(/\s+/g, " ")           // Collapse multiple spaces
    .trim();
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

// ─── Title relevance scoring (for search-ranked results) ───

const TITLE_STOP_WORDS = new Set(["a", "an", "the", "and", "or", "of", "for", "in", "at", "to", "with"]);

/**
 * Score how well a job title matches the search query (0-100).
 * Used to rank search results so title matches appear before description-only matches.
 */
function computeTitleRelevance(title: string, query: string): number {
  const normalize = (s: string) =>
    s.toLowerCase().replace(/[\-–—\/\\|,()]/g, " ").replace(/\s+/g, " ").trim();

  const titleNorm = normalize(title);
  const queryNorm = normalize(query);

  // Exact match
  if (titleNorm === queryNorm) return 100;

  // Title contains the full query string
  if (titleNorm.includes(queryNorm)) return 80;

  // Query contains the full title (query is more specific than title)
  if (queryNorm.includes(titleNorm)) return 75;

  // Word-level matching
  const queryWords = queryNorm.split(/\s+/).filter((w) => w.length > 1 && !TITLE_STOP_WORDS.has(w));
  const titleWords = titleNorm.split(/\s+/).filter((w) => w.length > 1 && !TITLE_STOP_WORDS.has(w));

  if (queryWords.length === 0) return 0;

  let matchCount = 0;
  for (const qw of queryWords) {
    if (titleWords.some((tw) => tw === qw || tw.startsWith(qw) || qw.startsWith(tw))) {
      matchCount++;
    }
  }

  return Math.round((matchCount / queryWords.length) * 60);
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
  skills_structured?: SkillStructuredEntry[];
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
export const FEED_COLUMNS = [
  "id", "source", "title", "company_name", "company_verified",
  "company_logo_url", "description_plain",
  "salary_min", "salary_max", "salary_is_estimate",
  "location_city", "location_area", "work_setup", "job_type",
  "experience_level", "skills_required", "apply_url",
  "posted_at", "expires_at", "is_active", "applicant_count",
].join(",");

// Lightweight columns for scoring only (Phase 1).
// Includes description_plain for education scoring + title-only detection.
export const SCORING_COLUMNS = [
  "id", "title", "skills_required", "skills_structured",
  "salary_min", "salary_max",
  "location_city", "work_setup", "job_type", "experience_level",
  "posted_at", "description_plain",
].join(",");

// ─── Paginated fetch (bypasses Supabase 1000-row default limit) ───
// Supabase returns max 1000 rows per select(). This helper paginates to get all.

const FETCH_PAGE_SIZE = 1000;

export async function fetchAllRows<T>(
  buildQuery: (from: number, to: number) => PromiseLike<{ data: T[] | null }>,
): Promise<T[]> {
  const allRows: T[] = [];
  let offset = 0;

  while (true) {
    const { data } = await buildQuery(offset, offset + FETCH_PAGE_SIZE - 1);
    if (!data || data.length === 0) break;
    allRows.push(...data);
    if (data.length < FETCH_PAGE_SIZE) break;
    offset += FETCH_PAGE_SIZE;
  }

  return allRows;
}

// ─── Semantic score helpers ───

export async function buildSemanticScoreMap(
  supabase: ReturnType<typeof createServiceClient>,
  profile: Profile,
): Promise<Map<string, number>> {
  const map = new Map<string, number>();

  try {
    const profileText = buildProfileEmbeddingText(profile);
    const embedding = await generateEmbeddingSafe(profileText);
    if (!embedding) return map;

    // Format as pgvector string for the RPC
    const vectorStr = `[${embedding.join(",")}]`;

    const { data, error } = await supabase.rpc("match_jobs_by_embedding", {
      query_embedding: vectorStr,
      similarity_threshold: 0.3,
      match_count: 500,
    });

    if (error) {
      log.error({ err: error.message }, "Semantic matching RPC error");
      return map;
    }

    if (data) {
      for (const row of data as { job_id: string; similarity: number }[]) {
        map.set(row.job_id, row.similarity);
      }
    }
  } catch (err) {
    log.error({ err }, "Semantic matching error");
  }

  return map;
}

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
    log.error({ err: error.message }, "Failed to fetch jobs");
    return { jobs: [], total: 0, page, pageSize, totalPages: 0, isMatchFiltered: false };
  }

  const total = count ?? 0;
  if (!data || data.length === 0) {
    return { jobs: [], total, page, pageSize, totalPages: Math.ceil(total / pageSize), isMatchFiltered: false };
  }

  const rows = data as unknown as JobRow[];
  fixSalaryInMemory(rows);

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

  // Fetch scoring rows and semantic scores in parallel
  const searchFilter = query ? buildSearchFilter(query) : "";

  const [scoringData, semanticMap] = await Promise.all([
    fetchAllRows((from, to) => {
      let b = supabase
        .from("jobs")
        .select(SCORING_COLUMNS)
        .eq("is_active", true)
        .order("posted_at", { ascending: false })
        .range(from, to);
      if (searchFilter) b = b.or(searchFilter);
      return b;
    }),
    buildSemanticScoreMap(supabase, profile),
  ]);

  const total = scoringData.length;

  if (total === 0) {
    return { jobs: [], total: 0, page, pageSize, totalPages: 0, isMatchFiltered: !query };
  }

  // Apply role category gate
  const scoringRows = filterByRoleCategory(
    scoringData as unknown as ScoringRow[],
    profile.headline
  );

  const scoringOpts: ScoringOptions = { profileHeadline: profile.headline };

  // Score and sort
  const scored = scoringRows.map((row) => ({
    id: row.id,
    postedAt: row.posted_at,
    result: computeMatchScore(row, profile, {
      ...scoringOpts,
      semanticScore: semanticMap.get(row.id) ?? null,
    }),
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
  fixSalaryInMemory(fullRows);

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

export interface ScoringRow {
  id: string;
  title: string;
  skills_required: string[];
  skills_structured?: SkillStructuredEntry[];
  salary_min: number | null;
  salary_max: number | null;
  location_city: string | null;
  work_setup: string | null;
  job_type: string | null;
  experience_level: string | null;
  posted_at: string;
}

export function mapRowToJob(row: JobRow, result: { score: number; scoreRange?: [number, number]; highlight: string | null; matchedSkills?: string[] }, isTop: boolean): Job {
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
    skillsRequired: row.skills_required,
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
    fixSalaryInMemory(rows);

    const jobs: Job[] = rows.map((row, i) => {
      const result = computeMatchScore(row, profile);
      return mapRowToJob(row, result, i === 0);
    });

    return { jobs, totalMatches: 0 };
  }

  // ── Cache-first path ──
  const cached = await readMatchCache(profile!.id, limit);
  if (cached) {
    // Fetch full job data for cached IDs
    const cachedIds = cached.rows.map((r) => r.job_id);
    const { data: fullData } = await supabase
      .from("jobs")
      .select(FEED_COLUMNS)
      .in("id", cachedIds)
      .eq("is_active", true);

    if (fullData && fullData.length > 0) {
      const fullRows = fullData as unknown as JobRow[];
      fixSalaryInMemory(fullRows);
      const rowMap = new Map(fullRows.map((r) => [r.id, r]));

      const jobs: Job[] = cached.rows
        .map((c, i) => {
          const row = rowMap.get(c.job_id);
          if (!row) return null;
          return mapRowToJob(
            row,
            { score: c.match_score, highlight: c.match_highlight, matchedSkills: c.matched_skills },
            i === 0,
          );
        })
        .filter((j): j is Job => j !== null);

      if (jobs.length > 0) {
        return { jobs, totalMatches: cached.totalMatches };
      }
    }
    // If all cached jobs were deactivated, fall through to live computation
  }

  // Phase 1 — lightweight scoring + semantic in parallel
  const [scoringData, semanticMap] = await Promise.all([
    fetchAllRows((from, to) =>
      supabase
        .from("jobs")
        .select(SCORING_COLUMNS)
        .eq("is_active", true)
        .order("posted_at", { ascending: false })
        .range(from, to),
    ),
    buildSemanticScoreMap(supabase, profile!),
  ]);

  if (scoringData.length === 0) {
    return { jobs: [], totalMatches: 0 };
  }

  // Apply role category gate
  const scoringRows = filterByRoleCategory(
    scoringData as unknown as ScoringRow[],
    profile!.headline
  );

  const scoringOpts: ScoringOptions = { profileHeadline: profile!.headline };

  const scored = scoringRows.map((row) => ({
    id: row.id,
    postedAt: row.posted_at,
    result: computeMatchScore(row, profile!, {
      ...scoringOpts,
      semanticScore: semanticMap.get(row.id) ?? null,
    }),
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
  fixSalaryInMemory(fullRows);

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
    log.error({ err: error?.message }, "Failed to fetch job");
    return null;
  }

  const row = data as JobRow;
  fixSalaryInMemory([row]);
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

// ─── Salary sanity fix (read-only, no DB writes) ───
// Normalizes unrealistic salary values in-memory for display purposes.
// Salary extraction now happens at ingestion time (lib/ingest.ts).

const PHP_MONTHLY_SANITY_THRESHOLD = 150_000;

export function fixSalaryInMemory(rows: JobRow[]): void {
  for (const row of rows) {
    // Skip estimated salaries — already normalized during ingestion
    if (row.salary_is_estimate) continue;

    const hasHighSalary =
      (row.salary_min !== null && row.salary_min >= PHP_MONTHLY_SANITY_THRESHOLD) ||
      (row.salary_max !== null && row.salary_max >= PHP_MONTHLY_SANITY_THRESHOLD);

    if (hasHighSalary) {
      row.salary_min = row.salary_min !== null ? Math.round(row.salary_min / 12) : null;
      row.salary_max = row.salary_max !== null ? Math.round(row.salary_max / 12) : null;
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

// ─── Cursor-based explore (DB-sorted paths only) ───

interface GetExploreJobsCursorParams {
  cursor?: string;
  workSetup?: string;
  jobType?: string;
  experienceLevel?: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  datePosted?: string;
  verifiedOnly?: boolean;
  sort: "recency" | "salary_desc" | "salary_asc";
  pageSize?: number;
  profile?: Profile | null;
}

function parseCursor(cursor: string): { value: string; id: string } | null {
  const sep = cursor.lastIndexOf("_");
  if (sep === -1) return null;
  return { value: cursor.slice(0, sep), id: cursor.slice(sep + 1) };
}

export async function getExploreJobsCursor({
  cursor,
  workSetup,
  jobType,
  experienceLevel,
  location,
  salaryMin,
  salaryMax,
  datePosted,
  verifiedOnly,
  sort = "recency",
  pageSize = 20,
  profile,
}: GetExploreJobsCursorParams): Promise<CursorPaginatedJobs> {
  const supabase = createServiceClient();
  const limit = pageSize + 1; // fetch one extra to determine hasMore

  // Build base query with filters (no count)
  let builder = supabase
    .from("jobs")
    .select(FEED_COLUMNS)
    .eq("is_active", true);

  builder = applyExploreFilters(builder, {
    workSetup, jobType, experienceLevel, location,
    salaryMin, salaryMax, datePosted, verifiedOnly,
  });

  // Apply cursor + sort
  const parsed = cursor ? parseCursor(cursor) : null;

  if (sort === "salary_desc") {
    if (parsed) {
      // (salary_max, id) < (cursor_val, cursor_id) for descending
      builder = builder.or(
        `salary_max.lt.${parsed.value},and(salary_max.eq.${parsed.value},id.lt.${parsed.id})`
      );
    }
    builder = builder
      .order("salary_max", { ascending: false, nullsFirst: false })
      .order("id", { ascending: false });
  } else if (sort === "salary_asc") {
    if (parsed) {
      // (salary_min, id) > (cursor_val, cursor_id) for ascending
      builder = builder.or(
        `salary_min.gt.${parsed.value},and(salary_min.eq.${parsed.value},id.gt.${parsed.id})`
      );
    }
    builder = builder
      .order("salary_min", { ascending: true, nullsFirst: false })
      .order("id", { ascending: true });
  } else {
    // recency (default): posted_at DESC, id DESC
    if (parsed) {
      builder = builder.or(
        `posted_at.lt.${parsed.value},and(posted_at.eq.${parsed.value},id.lt.${parsed.id})`
      );
    }
    builder = builder
      .order("posted_at", { ascending: false })
      .order("id", { ascending: false });
  }

  const { data, error } = await builder.limit(limit);

  if (error) {
    return { jobs: [], nextCursor: null, hasMore: false };
  }

  if (!data || data.length === 0) {
    return { jobs: [], nextCursor: null, hasMore: false };
  }

  const hasMore = data.length > pageSize;
  const rows = (hasMore ? data.slice(0, pageSize) : data) as unknown as JobRow[];
  fixSalaryInMemory(rows);

  const jobs: Job[] = rows.map((row) => {
    const result = computeMatchScore(row, profile ?? null);
    return mapRowToJob(row, result, false);
  });

  // Build next cursor from last row
  let nextCursor: string | null = null;
  if (hasMore && rows.length > 0) {
    const lastRow = rows[rows.length - 1];
    if (sort === "salary_desc") {
      nextCursor = `${lastRow.salary_max ?? 0}_${lastRow.id}`;
    } else if (sort === "salary_asc") {
      nextCursor = `${lastRow.salary_min ?? 0}_${lastRow.id}`;
    } else {
      nextCursor = `${lastRow.posted_at}_${lastRow.id}`;
    }
  }

  return { jobs, nextCursor, hasMore };
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

  // When searching, boost title-relevant results to the top
  if (query) {
    return getExploreJobsSearchRanked(supabase, {
      query, workSetup, jobType, experienceLevel, location,
      salaryMin, salaryMax, datePosted, verifiedOnly,
      sort: sort ?? "recency", page, pageSize, from, to, profile: profile ?? null,
    });
  }

  // DB-sorted paths (no search query): recency, salary_desc, salary_asc
  let builder = supabase
    .from("jobs")
    .select(FEED_COLUMNS, { count: "exact" })
    .eq("is_active", true);

  // Apply filters
  builder = applyExploreFilters(builder, {
    workSetup, jobType, experienceLevel, location,
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
    log.error({ err: error.message }, "Failed to fetch explore jobs");
    return { jobs: [], total: 0, page, pageSize, totalPages: 0, isMatchFiltered: false };
  }

  const total = count ?? 0;
  if (!data || data.length === 0) {
    return { jobs: [], total, page, pageSize, totalPages: Math.ceil(total / pageSize), isMatchFiltered: false };
  }

  const rows = data as unknown as JobRow[];
  fixSalaryInMemory(rows);

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

// ── Search-ranked fetch: title-relevant results first ──
// Two-phase: lightweight fetch → score by title relevance → sort → page → full fetch
// This ensures "Software Engineer" search shows Software Engineer jobs first,
// not description-only matches like "Customer Support" that mentions "software".

const SEARCH_RANK_COLUMNS = "id,title,posted_at,salary_min,salary_max";

async function getExploreJobsSearchRanked(
  supabase: ReturnType<typeof createServiceClient>,
  opts: {
    query: string; workSetup?: string; jobType?: string;
    experienceLevel?: string; location?: string;
    salaryMin?: number; salaryMax?: number;
    datePosted?: string; verifiedOnly?: boolean;
    sort: ExploreSort; page: number; pageSize: number; from: number; to: number;
    profile: Profile | null;
  },
): Promise<PaginatedJobs> {
  const { query, sort, page, pageSize, from, to, profile } = opts;

  // Phase 1: lightweight fetch of all matching jobs
  let builder = supabase
    .from("jobs")
    .select(SEARCH_RANK_COLUMNS, { count: "exact" })
    .eq("is_active", true);

  builder = applyExploreFilters(builder, opts);

  const { data, error, count } = await builder;

  if (error) {
    log.error({ err: error.message }, "Failed to fetch explore jobs for search ranking");
    return { jobs: [], total: 0, page, pageSize, totalPages: 0, isMatchFiltered: false };
  }

  const total = count ?? 0;
  if (!data || data.length === 0) {
    return { jobs: [], total, page, pageSize, totalPages: Math.ceil(total / pageSize), isMatchFiltered: false };
  }

  type SearchRow = { id: string; title: string; posted_at: string; salary_min: number | null; salary_max: number | null };
  const rows = data as SearchRow[];

  // Score by title relevance and sort
  const scored = rows.map((row) => ({
    ...row,
    titleRelevance: computeTitleRelevance(row.title, query),
  }));

  scored.sort((a, b) => {
    // Tier grouping: strong title match (>=60) > partial (>0) > description-only (0)
    // Within each tier, sort by the user's chosen sort criterion
    const tierA = a.titleRelevance >= 60 ? 2 : a.titleRelevance > 0 ? 1 : 0;
    const tierB = b.titleRelevance >= 60 ? 2 : b.titleRelevance > 0 ? 1 : 0;
    if (tierB !== tierA) return tierB - tierA;

    // Within same tier: apply user-chosen sort
    if (sort === "salary_desc") {
      return (b.salary_max ?? 0) - (a.salary_max ?? 0);
    }
    if (sort === "salary_asc") {
      return (a.salary_min ?? Infinity) - (b.salary_min ?? Infinity);
    }
    // Default (recency): most recent first
    return new Date(b.posted_at).getTime() - new Date(a.posted_at).getTime();
  });

  // Paginate
  const pageSlice = scored.slice(from, to + 1);
  if (pageSlice.length === 0) {
    return { jobs: [], total, page, pageSize, totalPages: Math.ceil(total / pageSize), isMatchFiltered: false };
  }

  // Phase 2: full detail fetch for page slice only
  const pageIds = pageSlice.map((s) => s.id);
  const { data: fullData } = await supabase
    .from("jobs")
    .select(FEED_COLUMNS)
    .in("id", pageIds);

  if (!fullData || fullData.length === 0) {
    return { jobs: [], total, page, pageSize, totalPages: Math.ceil(total / pageSize), isMatchFiltered: false };
  }

  const fullRows = fullData as unknown as JobRow[];
  fixSalaryInMemory(fullRows);

  // Maintain title-relevance sort order
  const rowMap = new Map(fullRows.map((r) => [r.id, r]));
  const jobs: Job[] = pageSlice
    .map(({ id }) => {
      const row = rowMap.get(id);
      if (!row) return null;
      const result = computeMatchScore(row, profile);
      return mapRowToJob(row, result, false);
    })
    .filter((j): j is Job => j !== null);

  return { jobs, total, page, pageSize, totalPages: Math.ceil(total / pageSize), isMatchFiltered: false };
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

  // Phase 1 — lightweight scoring + semantic in parallel
  const [scoringData, semanticMap] = await Promise.all([
    fetchAllRows((from, to) =>
      applyExploreFilters(
        supabase
          .from("jobs")
          .select(SCORING_COLUMNS)
          .eq("is_active", true)
          .order("posted_at", { ascending: false })
          .range(from, to),
        opts,
      ),
    ),
    profile ? buildSemanticScoreMap(supabase, profile) : Promise.resolve(new Map<string, number>()),
  ]);

  const count = scoringData.length;

  if (scoringData.length === 0) {
    const total = count;
    return { jobs: [], total, page, pageSize, totalPages: Math.ceil(total / pageSize), isMatchFiltered: false };
  }

  // Apply role category gate
  const scoringRows = filterByRoleCategory(
    scoringData as unknown as ScoringRow[],
    profile?.headline ?? null
  );

  const scoringOpts: ScoringOptions = { profileHeadline: profile?.headline ?? null };

  // Score and sort — NO threshold filtering
  const scored = scoringRows.map((row) => ({
    id: row.id,
    postedAt: row.posted_at,
    result: computeMatchScore(row, profile, {
      ...scoringOpts,
      semanticScore: semanticMap.get(row.id) ?? null,
    }),
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
  fixSalaryInMemory(fullRows);

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

// ─── Similar jobs (for detail page sidebar) ───

export async function getSimilarJobs(
  jobId: string,
  skills: string[],
  profile: Profile | null,
  limit = 3,
): Promise<Job[]> {
  const supabase = createServiceClient();

  // Phase 1: fetch minimal columns for scoring (id + skills only)
  const { data: candidates } = await supabase
    .from("jobs")
    .select("id, skills_required")
    .eq("is_active", true)
    .neq("id", jobId)
    .order("posted_at", { ascending: false })
    .limit(50);

  if (!candidates || candidates.length === 0) return [];

  // Score by overlapping skills
  const skillSet = new Set(skills.map((s) => s.toLowerCase()));
  const scored = (candidates as { id: string; skills_required: string[] }[]).map((c) => {
    const overlap = (c.skills_required ?? []).filter((s) =>
      skillSet.has(s.toLowerCase()),
    ).length;
    return { id: c.id, overlap };
  });

  scored.sort((a, b) => b.overlap - a.overlap);
  const topIds = scored.slice(0, limit).map((s) => s.id);

  if (topIds.length === 0) return [];

  // Phase 2: fetch full data for only the top matches
  const { data: fullData } = await supabase
    .from("jobs")
    .select(FEED_COLUMNS)
    .in("id", topIds);

  if (!fullData || fullData.length === 0) return [];

  const rows = fullData as unknown as JobRow[];

  // Preserve ranking order
  const rowMap = new Map(rows.map((r) => [r.id, r]));
  return topIds
    .map((id) => rowMap.get(id))
    .filter((row): row is JobRow => !!row)
    .map((row) => {
      const result = computeMatchScore(row, profile);
      return mapRowToJob(row, result, false);
    });
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

// ─── Distinct locations for filter dropdown (cached 10 min via unstable_cache) ───

export const getDistinctLocations = unstable_cache(
  async (): Promise<string[]> => {
    const supabase = createServiceClient();

    const data = await fetchAllRows<{ location_city: string }>((from, to) =>
      supabase
        .from("jobs")
        .select("location_city")
        .eq("is_active", true)
        .not("location_city", "is", null)
        .order("location_city", { ascending: true })
        .range(from, to),
    );

    if (data.length === 0) return [];

    const unique = [...new Set(
      (data as { location_city: string }[])
        .map((r) => r.location_city)
        .filter(Boolean)
    )];

    return unique.sort();
  },
  ["distinct-locations"],
  { revalidate: 600, tags: ["dashboard"] },
);

// ─── Home page data functions ───

import type { TrendingRole, CompanyInfo, RecentlyViewedJob, CategoryCount, SalarySnapshotData } from "@/lib/types/home";
import { CATEGORY_SKILL_MAP } from "@/lib/constants/categorySkillMap";

const CATEGORY_META: Record<string, { name: string; icon: string }> = {
  tech_it: { name: "Tech & IT", icon: "\uD83D\uDCBB" },
  design: { name: "Design", icon: "\uD83C\uDFA8" },
  bpo: { name: "BPO & Support", icon: "\uD83C\uDFA7" },
  admin: { name: "Virtual Assistant", icon: "\uD83D\uDCCB" },
  sales: { name: "Sales & Marketing", icon: "\uD83D\uDCC8" },
  accounting: { name: "Finance", icon: "\uD83D\uDCB0" },
  healthcare: { name: "Healthcare", icon: "\uD83C\uDFE5" },
  education: { name: "Education", icon: "\uD83D\uDCDA" },
  skilled_trade: { name: "Skilled Trades", icon: "\uD83D\uDD27" },
  other: { name: "Other", icon: "\uD83D\uDCBC" },
};

/** Classify a job into a category based on skills overlap */
function classifyJob(skillsRequired: string[]): string {
  if (!skillsRequired || skillsRequired.length === 0) return "other";

  const lowerSkills = new Set(skillsRequired.map((s) => s.toLowerCase()));
  let bestCategory = "other";
  let bestOverlap = 0;

  for (const [category, catSkills] of Object.entries(CATEGORY_SKILL_MAP)) {
    const overlap = catSkills.filter((s) => lowerSkills.has(s.toLowerCase())).length;
    if (overlap > bestOverlap) {
      bestOverlap = overlap;
      bestCategory = category;
    }
  }

  return bestCategory;
}

/** Get job counts per work category (cached 10 min) */
export const getCategoryJobCounts = unstable_cache(
  async (): Promise<CategoryCount[]> => {
    const supabase = createServiceClient();

    const data = await fetchAllRows<{ skills_required: string[] }>((from, to) =>
      supabase
        .from("jobs")
        .select("skills_required")
        .eq("is_active", true)
        .range(from, to),
    );

    if (data.length === 0) {
      return Object.entries(CATEGORY_META).map(([id, meta]) => ({
        id,
        name: meta.name,
        icon: meta.icon,
        count: 0,
      }));
    }

    const counts: Record<string, number> = {};
    for (const row of data) {
      const cat = classifyJob((row as { skills_required: string[] }).skills_required);
      counts[cat] = (counts[cat] || 0) + 1;
    }

    return Object.entries(CATEGORY_META).map(([id, meta]) => ({
      id,
      name: meta.name,
      icon: meta.icon,
      count: counts[id] || 0,
    }));
  },
  ["category-job-counts"],
  { revalidate: 600, tags: ["dashboard"] },
);

// Static growth/bar data per role (no historical data yet)
const STATIC_ROLE_DATA: Record<string, { growth: number; bars: number[] }> = {
  default: { growth: 12, bars: [35, 40, 50, 55, 65, 72] },
};

/** Get trending roles — top 6 by open count, optionally filtered by category (cached 10 min) */
export async function getTrendingRoles(category?: string): Promise<TrendingRole[]> {
  return _getTrendingRolesCached(category ?? "all");
}

const _getTrendingRolesCached = unstable_cache(
  async (category: string): Promise<TrendingRole[]> => {
    const supabase = createServiceClient();

    type RoleRow = { title: string; salary_min: number | null; salary_max: number | null; skills_required: string[] };

    const rows = await fetchAllRows<RoleRow>((from, to) =>
      supabase
        .from("jobs")
        .select("title, salary_min, salary_max, skills_required")
        .eq("is_active", true)
        .range(from, to),
    );

    if (rows.length === 0) return [];

    // Filter by category if specified
    const filtered = category && category !== "all"
      ? rows.filter((r) => classifyJob(r.skills_required) === category)
      : rows;

    // Aggregate by title
    const roleMap = new Map<string, { count: number; salaryMins: number[]; salaryMaxes: number[] }>();
    for (const row of filtered) {
      const title = row.title;
      const entry = roleMap.get(title) || { count: 0, salaryMins: [], salaryMaxes: [] };
      entry.count++;
      if (row.salary_min) entry.salaryMins.push(row.salary_min);
      if (row.salary_max) entry.salaryMaxes.push(row.salary_max);
      roleMap.set(title, entry);
    }

    // Sort by count descending, take top 6
    const sorted = [...roleMap.entries()]
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 6);

    return sorted.map(([title, { count, salaryMins, salaryMaxes }]) => {
      const minSalary = salaryMins.length > 0 ? Math.min(...salaryMins) : null;
      const maxSalary = salaryMaxes.length > 0 ? Math.max(...salaryMaxes) : null;

      const salaryRange = minSalary && maxSalary
        ? `\u20B1${Math.round(minSalary / 1000)}K \u2013 \u20B1${Math.round(maxSalary / 1000)}K`
        : minSalary
          ? `From \u20B1${Math.round(minSalary / 1000)}K`
          : maxSalary
            ? `Up to \u20B1${Math.round(maxSalary / 1000)}K`
            : "Salary TBD";

      const staticData = STATIC_ROLE_DATA[title] || STATIC_ROLE_DATA.default;

      return {
        title,
        openCount: count,
        salaryRange,
        growthPercent: staticData.growth,
        barHeights: staticData.bars,
      };
    });
  },
  ["trending-roles"],
  { revalidate: 600, tags: ["dashboard"] },
);

/** Get top hiring companies — top 5 by open jobs, optionally filtered by category (cached 10 min) */
export async function getTopHiringCompanies(category?: string): Promise<CompanyInfo[]> {
  return _getTopHiringCompaniesCached(category ?? "all");
}

const _getTopHiringCompaniesCached = unstable_cache(
  async (category: string): Promise<CompanyInfo[]> => {
    const supabase = createServiceClient();

    type CoRow = { company_name: string; company_logo_url: string | null; location_city: string | null; skills_required: string[] };

    const rows = await fetchAllRows<CoRow>((from, to) =>
      supabase
        .from("jobs")
        .select("company_name, company_logo_url, location_city, skills_required")
        .eq("is_active", true)
        .range(from, to),
    );

    if (rows.length === 0) return [];

    const filtered = category && category !== "all"
      ? rows.filter((r) => classifyJob(r.skills_required) === category)
      : rows;

    // Aggregate by company
    const companyMap = new Map<string, { count: number; logoUrl: string | null; location: string }>();
    for (const row of filtered) {
      const name = row.company_name;
      if (!name) continue;
      const entry = companyMap.get(name) || { count: 0, logoUrl: row.company_logo_url, location: row.location_city || "Philippines" };
      entry.count++;
      if (!entry.logoUrl && row.company_logo_url) entry.logoUrl = row.company_logo_url;
      companyMap.set(name, entry);
    }

    // Sort by count descending, take top 5
    const sorted = [...companyMap.entries()]
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5);

    return sorted.map(([name, { count, logoUrl, location }]) => ({
      name,
      industry: "",
      location,
      size: "",
      logoUrl,
      openJobs: count,
      rating: 4.2, // static default
    }));
  },
  ["top-hiring-companies"],
  { revalidate: 600, tags: ["dashboard"] },
);

/** Get recently viewed jobs for user */
export async function getRecentlyViewed(userId: string): Promise<RecentlyViewedJob[]> {
  const supabase = createServiceClient();

  // Get last 4 job_view activities
  const { data: activities } = await supabase
    .from("user_activities")
    .select("target_id, created_at")
    .eq("user_id", userId)
    .eq("activity_type", "job_view")
    .order("created_at", { ascending: false })
    .limit(4);

  if (!activities || activities.length === 0) return [];

  const jobIds = (activities as { target_id: string; created_at: string }[])
    .map((a) => a.target_id)
    .filter(Boolean);

  if (jobIds.length === 0) return [];

  const { data: jobs } = await supabase
    .from("jobs")
    .select("id, title, company_name")
    .in("id", jobIds);

  if (!jobs || jobs.length === 0) return [];

  const jobMap = new Map((jobs as { id: string; title: string; company_name: string }[]).map((j) => [j.id, j]));

  return (activities as { target_id: string; created_at: string }[])
    .map((a) => {
      const job = jobMap.get(a.target_id);
      if (!job) return null;
      return {
        jobId: a.target_id,
        title: job.title,
        company: job.company_name,
        viewedAt: formatRelativeTime(a.created_at),
      };
    })
    .filter((r): r is RecentlyViewedJob => r !== null);
}

/** Cached fetch of all salary rows (shared across users, 10 min TTL) */
const _fetchSalaryRows = unstable_cache(
  async () => {
    const supabase = createServiceClient();
    type Row = { title: string; salary_min: number | null; salary_max: number | null; skills_required: string[] };
    return fetchAllRows<Row>((from, to) =>
      supabase
        .from("jobs")
        .select("title, salary_min, salary_max, skills_required")
        .eq("is_active", true)
        .range(from, to),
    );
  },
  ["salary-snapshot-rows"],
  { revalidate: 600, tags: ["dashboard"] },
);

/** Get salary snapshot — top 3 roles relevant to user's skills with real salary data */
export async function getSalarySnapshot(
  userSkills: string[],
  desiredSalaryMin?: number | null,
  desiredSalaryMax?: number | null,
): Promise<SalarySnapshotData> {
  const empty: SalarySnapshotData = { roles: [], scaleCeiling: 0, userDesiredSalary: null };

  const rows = await _fetchSalaryRows();

  if (rows.length === 0) return empty;

  // Filter jobs by skill overlap with user
  const userSkillSet = new Set(userSkills.map((s) => s.toLowerCase()));

  let matched = userSkillSet.size > 0
    ? rows.filter((r) =>
        (r.skills_required ?? []).some((s) => userSkillSet.has(s.toLowerCase()))
      )
    : [];

  // Fallback: if < 5 skill-matched jobs, use category classification
  if (matched.length < 5) {
    const userCategory = classifyJob(userSkills);
    matched = rows.filter((r) => classifyJob(r.skills_required) === userCategory);
  }

  // If still nothing, bail
  if (matched.length === 0) return empty;

  // Aggregate by title
  const roleMap = new Map<string, { mins: number[]; maxes: number[] }>();
  for (const row of matched) {
    if (row.salary_min === null && row.salary_max === null) continue;
    const entry = roleMap.get(row.title) ?? { mins: [], maxes: [] };
    if (row.salary_min !== null) entry.mins.push(row.salary_min);
    if (row.salary_max !== null) entry.maxes.push(row.salary_max);
    roleMap.set(row.title, entry);
  }

  // Build role objects, only those with salary data
  const roleEntries = [...roleMap.entries()]
    .filter(([, v]) => v.mins.length > 0 || v.maxes.length > 0)
    .map(([title, { mins, maxes }]) => {
      const minSalary = mins.length > 0 ? Math.min(...mins) : Math.min(...maxes);
      const maxSalary = maxes.length > 0 ? Math.max(...maxes) : Math.max(...mins);
      const allMidpoints = mins.length > 0 && maxes.length > 0
        ? mins.map((m, i) => (m + (maxes[i] ?? maxes[0])) / 2)
        : mins.length > 0 ? mins : maxes;
      const avgSalary = Math.round(allMidpoints.reduce((a, b) => a + b, 0) / allMidpoints.length);
      return { title, minSalary, maxSalary, avgSalary, jobCount: mins.length + maxes.length };
    });

  // Sort by job count descending, take top 3
  roleEntries.sort((a, b) => b.jobCount - a.jobCount);
  const roles = roleEntries.slice(0, 3);

  if (roles.length === 0) return empty;

  const scaleCeiling = Math.max(...roles.map((r) => r.maxSalary));
  const userDesiredSalary =
    desiredSalaryMin && desiredSalaryMax
      ? { min: desiredSalaryMin, max: desiredSalaryMax }
      : null;

  return { roles, scaleCeiling, userDesiredSalary };
}
