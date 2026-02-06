"use server";

import { createClient } from "@/lib/supabase/server";
import { validateLogActivity } from "@/lib/validation/schemas";
import type { ActivityType } from "@/lib/types";
import type { SupabaseClient } from "@supabase/supabase-js";

function getTodayPHT(): string {
  return new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" })
  )
    .toISOString()
    .slice(0, 10);
}

function getYesterdayPHT(): string {
  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" })
  );
  now.setDate(now.getDate() - 1);
  return now.toISOString().slice(0, 10);
}

export async function logActivity({
  activityType,
  targetId,
  metadata,
}: {
  activityType: ActivityType;
  targetId?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    // Validate input
    const validation = validateLogActivity({ activityType, targetId, metadata });
    if (!validation.success) {
      console.error("Activity validation failed:", validation.error);
      return;
    }

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const todayPHT = getTodayPHT();

    // Upsert activity — dedup index handles duplicates
    const { error } = await supabase.from("user_activities").insert({
      user_id: user.id,
      activity_type: activityType,
      target_id: targetId ?? null,
      metadata: metadata ?? {},
      activity_date: todayPHT,
    });

    // Unique violation means duplicate — not an error
    if (error && error.code !== "23505") {
      console.error("Failed to log activity:", error.message);
      return;
    }

    await updateStreak(supabase, user.id, todayPHT);
  } catch (err) {
    console.error("logActivity error:", err);
  }
}

async function updateStreak(
  supabase: SupabaseClient,
  userId: string,
  todayPHT: string
): Promise<void> {
  try {
    const { data: profile, error: fetchError } = await supabase
      .from("profiles")
      .select("current_streak, longest_streak, last_activity_date")
      .eq("id", userId)
      .single();

    if (fetchError || !profile) {
      console.error("Failed to fetch profile for streak:", fetchError?.message);
      return;
    }

    const { current_streak, longest_streak, last_activity_date } = profile;

    // Already counted today
    if (last_activity_date === todayPHT) return;

    const yesterdayPHT = getYesterdayPHT();

    let newStreak: number;
    if (last_activity_date === yesterdayPHT) {
      newStreak = current_streak + 1;
    } else {
      newStreak = 1;
    }

    const newLongest = Math.max(newStreak, longest_streak);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        current_streak: newStreak,
        longest_streak: newLongest,
        last_activity_date: todayPHT,
      })
      .eq("id", userId);

    if (updateError) {
      console.error("Failed to update streak:", updateError.message);
    }
  } catch (err) {
    console.error("updateStreak error:", err);
  }
}
