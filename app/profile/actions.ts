"use server";

import { createClient } from "@/lib/supabase/server";
import { calculateCompletion } from "@/lib/profile";
import { logActivity } from "@/lib/actions/activity";
import type { Profile } from "@/lib/types";

const ALLOWED_FIELDS = [
  "full_name",
  "headline",
  "preferred_city",
  "work_preference",
  "skills",
  "experience_level",
  "years_of_experience",
  "education",
  "field_of_study",
  "desired_salary_min",
  "desired_salary_max",
  "employment_type",
  "preferred_industries",
] as const;

export async function updateProfile(
  data: Partial<Profile>
): Promise<{ error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated." };
  }

  // Fetch current profile to merge for completion calculation
  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!currentProfile) {
    return { error: "Profile not found." };
  }

  // Whitelist allowed fields
  const updateData: Record<string, unknown> = {};
  for (const field of ALLOWED_FIELDS) {
    if (field in data) {
      updateData[field] = data[field as keyof typeof data];
    }
  }

  if (Object.keys(updateData).length === 0) {
    return { error: "No valid fields to update." };
  }

  // Trim full_name if present
  if (typeof updateData.full_name === "string") {
    updateData.full_name = (updateData.full_name as string).trim();
  }

  // Recalculate profile completion with merged data
  const merged = { ...currentProfile, ...updateData } as Partial<Profile>;
  updateData.profile_completion = calculateCompletion(merged);

  const { error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  // Fire-and-forget: log profile update activity
  logActivity({ activityType: "profile_update", targetId: "profile" });

  return {};
}
