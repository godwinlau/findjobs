"use server";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { calculateCompletion } from "@/lib/profile";
import { logActivity } from "@/lib/actions/activity";
import { validateProfileUpdate } from "@/lib/validation/schemas";
import type { Profile } from "@/lib/types";

export async function saveOnboardingStep(step: number, data: Partial<Profile>) {
  // Validate input
  const validation = validateProfileUpdate(data);
  if (!validation.success) {
    return { error: validation.error };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated." };
  }

  // Validate step number (0-2 for the 4-step flow; step 3 uses completeOnboarding)
  if (typeof step !== "number" || step < 0 || step > 2) {
    return { error: "Invalid step." };
  }

  const updateData: Record<string, unknown> = {
    onboarding_step: step + 1,
    user_role: "job_seeker",
  };

  // Step 0: Welcome (full_name, employment_type)
  if (step === 0) {
    if (data.full_name) updateData.full_name = data.full_name.trim();
    if (data.employment_type) updateData.employment_type = data.employment_type;
  }

  // Step 1: Skills (skills)
  if (step === 1) {
    if (data.skills) updateData.skills = data.skills;
  }

  // Step 2: Preferences (preferred_industries, work_preference, desired_salary_min/max)
  if (step === 2) {
    if (data.preferred_industries) updateData.preferred_industries = data.preferred_industries;
    if (data.work_preference) updateData.work_preference = data.work_preference;
    if (data.desired_salary_min !== undefined) updateData.desired_salary_min = data.desired_salary_min;
    if (data.desired_salary_max !== undefined) updateData.desired_salary_max = data.desired_salary_max;
  }

  const { error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", user.id);

  if (error) {
    console.error("Onboarding step error:", error);
    return { error: "Failed to save. Please try again." };
  }

  return { success: true };
}

export async function completeOnboarding(data: Partial<Profile>) {
  // Validate input
  const validation = validateProfileUpdate(data);
  if (!validation.success) {
    return { error: validation.error };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated." };
  }

  const completion = calculateCompletion(data);

  const updateData: Record<string, unknown> = {
    onboarding_completed: true,
    onboarding_step: 4,
    user_role: "job_seeker",
    profile_completion: completion,
  };

  // Save fields from the 4-step flow
  if (data.full_name) updateData.full_name = data.full_name.trim();
  if (data.employment_type) updateData.employment_type = data.employment_type;
  if (data.skills) updateData.skills = data.skills;
  if (data.preferred_industries) updateData.preferred_industries = data.preferred_industries;
  if (data.work_preference) updateData.work_preference = data.work_preference;
  if (data.desired_salary_min !== undefined) updateData.desired_salary_min = data.desired_salary_min;
  if (data.desired_salary_max !== undefined) updateData.desired_salary_max = data.desired_salary_max;

  const { error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", user.id);

  if (error) {
    console.error("Complete onboarding error:", error);
    return { error: "Failed to complete onboarding. Please try again." };
  }

  // Fire-and-forget: log onboarding completion as activity
  logActivity({ activityType: "profile_update", targetId: "onboarding_complete" }).catch(
    (err) => console.error("Activity log error:", err)
  );

  // Set cookies so middleware skips DB checks on redirect
  const cookieStore = await cookies();
  cookieStore.set("onboarding_completed", "1", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });

  return { success: true };
}
