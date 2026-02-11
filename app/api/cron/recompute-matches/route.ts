import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase-server";
import { computeAndCacheMatches } from "@/lib/match-cache";
import type { Profile } from "@/lib/types";

export const maxDuration = 300;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  // Fetch up to 50 profiles that completed onboarding and have skills
  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("onboarding_completed", true)
    .not("skills", "eq", "{}")
    .limit(50);

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  if (!profiles || profiles.length === 0) {
    return NextResponse.json({ processed: 0, skipped: 0, errors: 0 });
  }

  // Check which users have stale or missing caches
  const userIds = (profiles as Profile[]).map((p) => p.id);
  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();

  // Get the latest computed_at per user (only for users who have a cache)
  const { data: freshCaches } = await supabase
    .from("user_matched_jobs")
    .select("user_id, computed_at")
    .in("user_id", userIds)
    .eq("rank", 1)
    .gte("computed_at", sixHoursAgo);

  const freshUserIds = new Set(
    (freshCaches ?? []).map((r: { user_id: string }) => r.user_id)
  );

  // Filter to only stale/missing
  const staleProfiles = (profiles as Profile[]).filter(
    (p) => !freshUserIds.has(p.id)
  );

  let processed = 0;
  let errors = 0;

  for (const profile of staleProfiles) {
    try {
      await computeAndCacheMatches(profile.id, profile);
      processed++;
    } catch (err) {
      console.error(`recompute-matches error for ${profile.id}:`, err);
      errors++;
    }
  }

  return NextResponse.json({
    processed,
    skipped: profiles.length - staleProfiles.length,
    errors,
    total_profiles: profiles.length,
  });
}
