"use server";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase-server";
import { calculateCompletion } from "@/lib/profile";
import { logActivity } from "@/lib/actions/activity";
import { computeAndCacheMatches } from "@/lib/match-cache";
import { validateProfileUpdate, usernameSchema } from "@/lib/validation/schemas";
import { normalizeSkill } from "@/lib/matching/skills";
import type { Profile } from "@/lib/types";

const ALLOWED_FIELDS = [
  "full_name",
  "headline",
  "preferred_city",
  "work_preference",
  "skills",
  "skills_learning",
  "skill_proficiencies",
  "experience_level",
  "years_of_experience",
  "education",
  "school",
  "field_of_study",
  "desired_salary_min",
  "desired_salary_max",
  "employment_type",
  "preferred_industries",
  "willing_to_relocate",
  "username",
  "is_profile_public",
  "public_sections",
] as const;

export async function updateProfile(
  data: Partial<Profile>
): Promise<{ error?: string }> {
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

  // Fetch current profile to merge for completion calculation
  const { data: currentProfile, error: fetchError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (fetchError || !currentProfile) {
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

  // Normalize skill names to ontology canonical labels
  if (Array.isArray(updateData.skills)) {
    updateData.skills = (updateData.skills as string[]).map(normalizeSkill);
  }
  if (updateData.skill_proficiencies && typeof updateData.skill_proficiencies === "object") {
    const raw = updateData.skill_proficiencies as Record<string, string>;
    const normalized: Record<string, string> = {};
    for (const [key, val] of Object.entries(raw)) {
      normalized[normalizeSkill(key)] = val;
    }
    updateData.skill_proficiencies = normalized;
  }

  // Recalculate profile completion with merged data
  const merged = { ...currentProfile, ...updateData } as Partial<Profile>;
  updateData.profile_completion = calculateCompletion(merged);

  const { error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", user.id);

  if (error) {
    console.error("Profile update error:", error);
    return { error: "Failed to update profile. Please try again." };
  }

  // Fire-and-forget: log profile update activity
  logActivity({ activityType: "profile_update", targetId: "profile" }).catch(
    (err) => console.error("Activity log error:", err)
  );

  // Fire-and-forget: recompute match cache with updated profile
  const mergedProfile = { ...currentProfile, ...updateData } as Profile;
  computeAndCacheMatches(user.id, mergedProfile).catch(
    (err) => console.error("Match cache recomputation error:", err)
  );

  return {};
}

export async function checkUsernameAvailability(
  username: string
): Promise<{ available: boolean; error?: string }> {
  const result = usernameSchema.safeParse(username);
  if (!result.success) {
    const issues = result.error.issues || [];
    return {
      available: false,
      error: issues[0]?.message || "Invalid username",
    };
  }

  const supabase = await createClient();

  const { data } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (data) {
    return { available: false, error: "This username is already taken" };
  }

  return { available: true };
}

export async function claimUsername(
  username: string
): Promise<{ error?: string }> {
  const validation = usernameSchema.safeParse(username);
  if (!validation.success) {
    const issues = validation.error.issues || [];
    return { error: issues[0]?.message || "Invalid username" };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated." };
  }

  // Check if user already has a username
  const { data: existing } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  if (existing?.username) {
    return { error: "You already have a username." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ username, is_profile_public: true })
    .eq("id", user.id);

  if (error) {
    // Unique violation
    if (error.code === "23505") {
      return { error: "This username is already taken." };
    }
    console.error("Claim username error:", error);
    return { error: "Failed to claim username. Please try again." };
  }

  return {};
}

export async function deleteAccount(
  confirmationText: string
): Promise<{ error?: string }> {
  if (confirmationText !== "DELETE") {
    return { error: "Please type DELETE to confirm." };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated." };
  }

  // Use service role client to delete the auth user
  // All related rows (profiles, activities, assessments, matches) cascade
  const admin = createServiceClient();
  const { error } = await admin.auth.admin.deleteUser(user.id);

  if (error) {
    console.error("Account deletion error:", error);
    return { error: "Failed to delete account. Please try again." };
  }

  // Sign out to clear Supabase session cookies
  await supabase.auth.signOut();

  // Clear the onboarding cookie so re-signup doesn't skip onboarding
  const cookieStore = await cookies();
  cookieStore.delete("onboarding_completed");

  return {};
}
