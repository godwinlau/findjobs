import { createClient } from "@/lib/supabase/server";
import type { EmployerJobRow, EmployerStats } from "@/lib/types";

export async function getEmployerJobs(userId: string): Promise<EmployerJobRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("jobs")
    .select(
      "id, title, company_name, salary_min, salary_max, location_city, location_area, is_active, view_count, applicant_count, posted_at, expires_at"
    )
    .eq("posted_by", userId)
    .order("posted_at", { ascending: false });

  if (error) {
    console.error("getEmployerJobs error:", error.message);
    return [];
  }

  return (data ?? []) as EmployerJobRow[];
}

export async function getEmployerStats(userId: string): Promise<EmployerStats> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("jobs")
    .select("is_active, view_count, applicant_count")
    .eq("posted_by", userId);

  if (error) {
    console.error("getEmployerStats error:", error.message);
    return { activeJobs: 0, totalViews: 0, totalApplicants: 0 };
  }

  const jobs = data ?? [];
  return {
    activeJobs: jobs.filter((j) => j.is_active).length,
    totalViews: jobs.reduce((sum, j) => sum + (j.view_count ?? 0), 0),
    totalApplicants: jobs.reduce((sum, j) => sum + (j.applicant_count ?? 0), 0),
  };
}

export async function getEmployerJob(userId: string, jobId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", jobId)
    .eq("posted_by", userId)
    .single();

  if (error) {
    return null;
  }

  return data;
}
