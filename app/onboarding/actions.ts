"use server";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { calculateCompletion } from "@/lib/profile";
import { logActivity } from "@/lib/actions/activity";
import type { Profile } from "@/lib/types";

export async function saveOnboardingStep(step: number, data: Partial<Profile>) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated." };
  }

  const updateData: Record<string, unknown> = {
    onboarding_step: step + 1,
  };

  // Step 0: Role selection
  if (step === 0) {
    if (data.user_role) updateData.user_role = data.user_role;
  }

  // Step 1: About You (full_name, preferred_city, work_preference)
  if (step === 1) {
    if (data.full_name) updateData.full_name = data.full_name.trim();
    if (data.preferred_city !== undefined) updateData.preferred_city = data.preferred_city || null;
    if (data.work_preference) updateData.work_preference = data.work_preference;
  }

  // Step 2: Your Skills
  if (step === 2) {
    if (data.skills) updateData.skills = data.skills;
  }

  // Step 3: Background (experience_level, education, school, field_of_study)
  if (step === 3) {
    if (data.experience_level) updateData.experience_level = data.experience_level;
    if (data.education !== undefined) updateData.education = data.education || null;
    if (data.school !== undefined) updateData.school = data.school || null;
    if (data.field_of_study !== undefined) updateData.field_of_study = data.field_of_study || null;
  }

  const { error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function completeOnboarding(data: Partial<Profile>) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated." };
  }

  const isEmployer = data.user_role === "employer";

  const updateData: Record<string, unknown> = {
    onboarding_completed: true,
    user_role: data.user_role || "job_seeker",
  };

  if (isEmployer) {
    // Employer: mark complete with 100% profile, step 2
    updateData.onboarding_step = 2;
    updateData.profile_completion = 100;
  } else {
    // Job seeker: calculate completion from profile data
    const completion = calculateCompletion(data);
    updateData.onboarding_step = 5;
    updateData.profile_completion = completion;

    // Save step 4 fields (Preferences)
    if (data.desired_salary_min !== undefined) updateData.desired_salary_min = data.desired_salary_min;
    if (data.desired_salary_max !== undefined) updateData.desired_salary_max = data.desired_salary_max;
    if (data.employment_type) updateData.employment_type = data.employment_type;
    if (data.preferred_industries) updateData.preferred_industries = data.preferred_industries;

    // Also save any earlier step fields that may be present
    if (data.full_name) updateData.full_name = data.full_name.trim();
    if (data.preferred_city !== undefined) updateData.preferred_city = data.preferred_city || null;
    if (data.work_preference) updateData.work_preference = data.work_preference;
    if (data.skills) updateData.skills = data.skills;
    if (data.experience_level) updateData.experience_level = data.experience_level;
    if (data.education !== undefined) updateData.education = data.education || null;
    if (data.school !== undefined) updateData.school = data.school || null;
    if (data.field_of_study !== undefined) updateData.field_of_study = data.field_of_study || null;
  }

  const { error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  // Fire-and-forget: log onboarding completion as activity
  logActivity({ activityType: "profile_update", targetId: "onboarding_complete" });

  // Set cookies so middleware skips DB checks on redirect
  const cookieStore = await cookies();
  cookieStore.set("onboarding_completed", "1", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });
  cookieStore.set("user_role", data.user_role || "job_seeker", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return { success: true };
}
