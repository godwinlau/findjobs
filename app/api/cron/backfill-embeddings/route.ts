import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase-server";
import { embedAndStoreJobs } from "@/lib/embeddings";

// Backfill embeddings for existing jobs that don't have them yet.
// Run manually: curl -H "Authorization: Bearer $CRON_SECRET" /api/cron/backfill-embeddings
// Or via temporary Vercel cron until all jobs are backfilled.

export const maxDuration = 300;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.HUGGINGFACE_API_KEY) {
    return NextResponse.json(
      { error: "HUGGINGFACE_API_KEY not set" },
      { status: 500 }
    );
  }

  const supabase = createServiceClient();

  // Fetch up to 200 jobs without embeddings
  const { data: jobs, error } = await supabase
    .from("jobs")
    .select("id, title, skills_required, experience_level, work_setup, description_plain")
    .eq("is_active", true)
    .is("embedding", null)
    .order("posted_at", { ascending: false })
    .limit(200);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!jobs || jobs.length === 0) {
    return NextResponse.json({ processed: 0, errors: 0, remaining: 0 });
  }

  const result = await embedAndStoreJobs(
    jobs as { id: string; title: string; skills_required: string[]; experience_level: string | null; work_setup: string | null; description_plain: string }[],
    supabase,
  );

  // Check how many jobs still need embeddings
  const { count: remaining } = await supabase
    .from("jobs")
    .select("id", { count: "exact", head: true })
    .eq("is_active", true)
    .is("embedding", null);

  return NextResponse.json({
    processed: result.embedded,
    errors: result.errors,
    remaining: remaining ?? 0,
  });
}
