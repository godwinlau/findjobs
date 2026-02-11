import { createServiceClient } from "@/lib/supabase-server";
import {
  fetchAllRows,
  buildSemanticScoreMap,
  SCORING_COLUMNS,
  type ScoringRow,
} from "@/lib/jobs";
import {
  computeMatchScore,
  isProfileSufficient,
  MATCH_SCORE_THRESHOLD,
  type ScoringOptions,
} from "@/lib/matching";
import { filterByRoleCategory } from "@/lib/role-gates";
import type { Profile } from "@/lib/types";
import { logger } from "@/lib/logger";

const log = logger.child({ module: "match-cache" });

// ─── Types ───

interface CachedMatchRow {
  job_id: string;
  match_score: number;
  match_highlight: string | null;
  matched_skills: string[];
  rank: number;
  total_matches: number;
  computed_at: string;
}

interface CacheResult {
  rows: CachedMatchRow[];
  totalMatches: number;
}

// ─── Constants ───

const CACHE_MAX_AGE_MS = 6 * 60 * 60 * 1000; // 6 hours
const CACHE_SIZE = 20; // store top 20 matches per user

// ─── Read cache ───

export async function readMatchCache(
  userId: string,
  limit: number,
): Promise<CacheResult | null> {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("user_matched_jobs")
    .select("job_id, match_score, match_highlight, matched_skills, rank, total_matches, computed_at")
    .eq("user_id", userId)
    .order("rank", { ascending: true })
    .limit(limit);

  if (error || !data || data.length === 0) return null;

  const rows = data as CachedMatchRow[];

  // Staleness check — if computed_at is older than 6h, return null
  const computedAt = new Date(rows[0].computed_at).getTime();
  if (Date.now() - computedAt > CACHE_MAX_AGE_MS) return null;

  // total_matches is stored on the rank=1 row
  const rank1 = rows.find((r) => r.rank === 1);
  const totalMatches = rank1?.total_matches ?? 0;

  return { rows, totalMatches };
}

// ─── Write cache ───

export async function writeMatchCache(
  userId: string,
  matches: { jobId: string; score: number; highlight: string | null; matchedSkills: string[] }[],
  totalMatches: number,
): Promise<void> {
  const supabase = createServiceClient();

  // Delete old cache for this user
  await supabase
    .from("user_matched_jobs")
    .delete()
    .eq("user_id", userId);

  if (matches.length === 0) return;

  const rows = matches.slice(0, CACHE_SIZE).map((m, i) => ({
    user_id: userId,
    job_id: m.jobId,
    match_score: m.score,
    match_highlight: m.highlight,
    matched_skills: m.matchedSkills,
    rank: i + 1,
    total_matches: i === 0 ? totalMatches : 0,
    computed_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from("user_matched_jobs")
    .insert(rows);

  if (error) {
    log.error({ err: error.message }, "writeMatchCache error");
  }
}

// ─── Full recomputation pipeline ───

export async function computeAndCacheMatches(
  userId: string,
  profile: Profile,
): Promise<{ cached: number; totalMatches: number }> {
  if (!isProfileSufficient(profile)) {
    return { cached: 0, totalMatches: 0 };
  }

  const supabase = createServiceClient();

  // Fetch scoring rows and semantic scores in parallel
  const [scoringData, semanticMap] = await Promise.all([
    fetchAllRows((from, to) =>
      supabase
        .from("jobs")
        .select(SCORING_COLUMNS)
        .eq("is_active", true)
        .order("posted_at", { ascending: false })
        .range(from, to),
    ),
    buildSemanticScoreMap(supabase, profile),
  ]);

  if (scoringData.length === 0) {
    await writeMatchCache(userId, [], 0);
    return { cached: 0, totalMatches: 0 };
  }

  // Apply role category gate
  const scoringRows = filterByRoleCategory(
    scoringData as unknown as ScoringRow[],
    profile.headline,
  );

  const scoringOpts: ScoringOptions = { profileHeadline: profile.headline };

  // Score all jobs
  const scored = scoringRows.map((row) => {
    const result = computeMatchScore(row, profile, {
      ...scoringOpts,
      semanticScore: semanticMap.get(row.id) ?? null,
    });
    return {
      id: row.id,
      postedAt: row.posted_at,
      result,
    };
  });

  // Sort by score desc, then recency
  scored.sort((a, b) => {
    if (b.result.score !== a.result.score) return b.result.score - a.result.score;
    return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
  });

  // Filter to above threshold
  const aboveThreshold = scored.filter((s) => s.result.score >= MATCH_SCORE_THRESHOLD);
  const totalMatches = aboveThreshold.length;

  // Take top N for cache
  const topSlice = aboveThreshold.slice(0, CACHE_SIZE);
  const matches = topSlice.map((s) => ({
    jobId: s.id,
    score: s.result.score,
    highlight: s.result.highlight,
    matchedSkills: s.result.matchedSkills ?? [],
  }));

  await writeMatchCache(userId, matches, totalMatches);

  return { cached: matches.length, totalMatches };
}
