"use server";

import { createClient } from "@/lib/supabase/server";
import type { JobFormData } from "@/lib/types";

function plainTextToHtml(text: string): string {
  return text
    .split(/\n\n+/)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br>")}</p>`)
    .join("");
}

export async function createJobPosting(data: JobFormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated." };
  }

  // Verify employer role
  const { data: profile } = await supabase
    .from("profiles")
    .select("user_role")
    .eq("id", user.id)
    .single();

  if (profile?.user_role !== "employer") {
    return { error: "Only employers can post jobs." };
  }

  const descriptionHtml = plainTextToHtml(data.description);
  const sourceId = `${user.id}_${Date.now()}`;

  const { error } = await supabase.from("jobs").insert({
    source: "direct",
    source_id: sourceId,
    posted_by: user.id,
    title: data.title.trim(),
    company_name: data.company_name.trim(),
    company_logo_url: data.company_logo_url?.trim() || null,
    description: descriptionHtml,
    description_plain: data.description.trim(),
    apply_url: data.apply_url.trim(),
    experience_level: data.experience_level || null,
    skills_required: data.skills_required || [],
    salary_min: data.salary_min,
    salary_max: data.salary_max,
    location_city: data.location_city || null,
    location_area: data.location_area?.trim() || null,
    work_setup: data.work_setup || null,
    job_type: data.job_type || null,
    expires_at: data.expires_at || null,
    posted_at: new Date().toISOString(),
    is_active: true,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function updateJobPosting(jobId: string, data: JobFormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated." };
  }

  const descriptionHtml = plainTextToHtml(data.description);

  const { error } = await supabase
    .from("jobs")
    .update({
      title: data.title.trim(),
      company_name: data.company_name.trim(),
      company_logo_url: data.company_logo_url?.trim() || null,
      description: descriptionHtml,
      description_plain: data.description.trim(),
      apply_url: data.apply_url.trim(),
      experience_level: data.experience_level || null,
      skills_required: data.skills_required || [],
      salary_min: data.salary_min,
      salary_max: data.salary_max,
      location_city: data.location_city || null,
      location_area: data.location_area?.trim() || null,
      work_setup: data.work_setup || null,
      job_type: data.job_type || null,
      expires_at: data.expires_at || null,
    })
    .eq("id", jobId)
    .eq("posted_by", user.id);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function toggleJobActive(jobId: string, isActive: boolean) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated." };
  }

  const { error } = await supabase
    .from("jobs")
    .update({ is_active: isActive })
    .eq("id", jobId)
    .eq("posted_by", user.id);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
