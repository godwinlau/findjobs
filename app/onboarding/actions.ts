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

  // Validate step number
  if (typeof step !== "number" || step < 0 || step > 6) {
    return { error: "Invalid step." };
  }

  const updateData: Record<string, unknown> = {
    onboarding_step: step + 1,
    user_role: "job_seeker",
  };

  // Step 0: Work Type (preferred_industries, employment_type)
  if (step === 0) {
    if (data.preferred_industries) updateData.preferred_industries = data.preferred_industries;
    if (data.employment_type) updateData.employment_type = data.employment_type;
  }

  // Step 1: Location (preferred_city, work_preference, willing_to_relocate)
  if (step === 1) {
    if (data.preferred_city !== undefined) updateData.preferred_city = data.preferred_city || null;
    if (data.work_preference) updateData.work_preference = data.work_preference;
    if (data.willing_to_relocate !== undefined) updateData.willing_to_relocate = data.willing_to_relocate;
  }

  // Step 2: Skills (skills, skill_proficiencies)
  if (step === 2) {
    if (data.skills) updateData.skills = data.skills;
    if (data.skill_proficiencies) updateData.skill_proficiencies = data.skill_proficiencies;
  }

  // Step 3: Experience (experience_level, field_of_study)
  if (step === 3) {
    if (data.experience_level) updateData.experience_level = data.experience_level;
    if (data.field_of_study !== undefined) updateData.field_of_study = data.field_of_study || null;
  }

  // Step 4: Salary (desired_salary_min, desired_salary_max)
  if (step === 4) {
    if (data.desired_salary_min !== undefined) updateData.desired_salary_min = data.desired_salary_min;
    if (data.desired_salary_max !== undefined) updateData.desired_salary_max = data.desired_salary_max;
  }

  // Step 5: Identity (full_name, education, school)
  if (step === 5) {
    if (data.full_name) updateData.full_name = data.full_name.trim();
    if (data.education !== undefined) updateData.education = data.education || null;
    if (data.school !== undefined) updateData.school = data.school || null;
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
    onboarding_step: 7,
    user_role: "job_seeker",
    profile_completion: completion,
  };

  // Save all fields from all steps
  if (data.preferred_industries) updateData.preferred_industries = data.preferred_industries;
  if (data.employment_type) updateData.employment_type = data.employment_type;
  if (data.preferred_city !== undefined) updateData.preferred_city = data.preferred_city || null;
  if (data.work_preference) updateData.work_preference = data.work_preference;
  if (data.willing_to_relocate !== undefined) updateData.willing_to_relocate = data.willing_to_relocate;
  if (data.skills) updateData.skills = data.skills;
  if (data.skill_proficiencies) updateData.skill_proficiencies = data.skill_proficiencies;
  if (data.experience_level) updateData.experience_level = data.experience_level;
  if (data.field_of_study !== undefined) updateData.field_of_study = data.field_of_study || null;
  if (data.desired_salary_min !== undefined) updateData.desired_salary_min = data.desired_salary_min;
  if (data.desired_salary_max !== undefined) updateData.desired_salary_max = data.desired_salary_max;
  if (data.full_name) updateData.full_name = data.full_name.trim();
  if (data.education !== undefined) updateData.education = data.education || null;
  if (data.school !== undefined) updateData.school = data.school || null;

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
