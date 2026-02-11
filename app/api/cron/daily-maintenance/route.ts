import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase-server";
import { runHealthCheck } from "@/lib/job-health-checker";
import { computeAndCacheMatches } from "@/lib/match-cache";
import { embedAndStoreJobs } from "@/lib/embeddings";
import type { Profile } from "@/lib/types";
import { logger } from "@/lib/logger";

const log = logger.child({ module: "cron:daily-maintenance" });

// Consolidated daily maintenance cron (Hobby plan: max 2 crons).
// Combines: check-jobs + recompute-matches + backfill-embeddings

export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: {
    healthCheck: { success: boolean; error?: string };
    recomputeMatches: { processed: number; skipped: number; errors: number };
    backfillEmbeddings: { processed: number; errors: number; remaining: number };
  } = {
    healthCheck: { success: false },
    recomputeMatches: { processed: 0, skipped: 0, errors: 0 },
    backfillEmbeddings: { processed: 0, errors: 0, remaining: 0 },
  };

  // 1. Health check (check-jobs)
  try {
    await runHealthCheck();
    results.healthCheck = { success: true };
  } catch (err) {
    log.error({ err }, "Health check failed");
    results.healthCheck = {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }

  // 2. Recompute matches
  try {
    const supabase = createServiceClient();
    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("onboarding_completed", true)
      .not("skills", "eq", "{}")
      .limit(50);

    if (profileError) throw new Error(profileError.message);

    if (profiles && profiles.length > 0) {
      const userIds = (profiles as Profile[]).map((p) => p.id);
      const sixHoursAgo = new Date(
        Date.now() - 6 * 60 * 60 * 1000
      ).toISOString();

      const { data: freshCaches } = await supabase
        .from("user_matched_jobs")
        .select("user_id, computed_at")
        .in("user_id", userIds)
        .eq("rank", 1)
        .gte("computed_at", sixHoursAgo);

      const freshUserIds = new Set(
        (freshCaches ?? []).map((r: { user_id: string }) => r.user_id)
      );

      const staleProfiles = (profiles as Profile[]).filter(
        (p) => !freshUserIds.has(p.id)
      );

      for (const profile of staleProfiles) {
        try {
          await computeAndCacheMatches(profile.id, profile);
          results.recomputeMatches.processed++;
        } catch (err) {
          log.error({ err, userId: profile.id }, "recompute-matches error");
          results.recomputeMatches.errors++;
        }
      }

      results.recomputeMatches.skipped =
        profiles.length - staleProfiles.length;
    }
  } catch (err) {
    log.error({ err }, "Recompute matches failed");
    results.recomputeMatches.errors++;
  }

  // 3. Backfill embeddings
  try {
    if (process.env.HUGGINGFACE_API_KEY) {
      const supabase = createServiceClient();
      const { data: jobs, error } = await supabase
        .from("jobs")
        .select(
          "id, title, skills_required, experience_level, work_setup, description_plain"
        )
        .eq("is_active", true)
        .is("embedding", null)
        .order("posted_at", { ascending: false })
        .limit(200);

      if (error) throw new Error(error.message);

      if (jobs && jobs.length > 0) {
        const result = await embedAndStoreJobs(
          jobs as {
            id: string;
            title: string;
            skills_required: string[];
            experience_level: string | null;
            work_setup: string | null;
            description_plain: string;
          }[],
          supabase
        );
        results.backfillEmbeddings.processed = result.embedded;
        results.backfillEmbeddings.errors = result.errors;
      }

      const { count: remaining } = await supabase
        .from("jobs")
        .select("id", { count: "exact", head: true })
        .eq("is_active", true)
        .is("embedding", null);

      results.backfillEmbeddings.remaining = remaining ?? 0;
    }
  } catch (err) {
    log.error({ err }, "Backfill embeddings failed");
    results.backfillEmbeddings.errors++;
  }

  return NextResponse.json(results);
}
