import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase-server";
import { extractSalaryFromDescription } from "@/lib/linkedin-jobs";

// Re-parse salary from description_plain for jobs with null salary.
// POST /api/admin/backfill-salaries

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  // Fetch all active jobs with no salary that have a description
  const { data: jobs, error: fetchError } = await supabase
    .from("jobs")
    .select("id, description_plain")
    .eq("is_active", true)
    .is("salary_min", null)
    .is("salary_max", null)
    .not("description_plain", "eq", "");

  if (fetchError) {
    return NextResponse.json(
      { error: fetchError.message },
      { status: 500 }
    );
  }

  if (!jobs || jobs.length === 0) {
    return NextResponse.json({
      success: true,
      message: "No jobs to backfill",
      updated: 0,
    });
  }

  let updated = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const job of jobs) {
    const salary = extractSalaryFromDescription(job.description_plain);

    if (salary.min === null && salary.max === null) {
      skipped++;
      continue;
    }

    const { error: updateError } = await supabase
      .from("jobs")
      .update({
        salary_min: salary.min,
        salary_max: salary.max,
        salary_is_estimate: true,
      })
      .eq("id", job.id);

    if (updateError) {
      errors.push(`Job ${job.id}: ${updateError.message}`);
    } else {
      updated++;
    }
  }

  return NextResponse.json({
    success: true,
    total: jobs.length,
    updated,
    skipped,
    errors: errors.length > 0 ? errors : null,
  });
}
