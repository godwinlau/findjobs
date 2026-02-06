"use server";

import { fetchJobRow, buildJobDetail, JobDetail } from "@/lib/jobs";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/actions/activity";

export async function getJobDetailForDrawer(
  jobId: string
): Promise<JobDetail | null> {
  const supabase = await createClient();

  const [row, { data: { user } }] = await Promise.all([
    fetchJobRow(jobId),
    supabase.auth.getUser(),
  ]);

  if (!row) return null;

  // Log job view activity
  if (user) {
    logActivity({ activityType: "job_view", targetId: jobId });
  }

  // Fetch profile for match scoring
  const { data: profile } = user
    ? await supabase.from("profiles").select("*").eq("id", user.id).single()
    : { data: null };

  return buildJobDetail(row, profile);
}
