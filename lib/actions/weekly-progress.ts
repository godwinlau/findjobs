"use server";

import { createClient } from "@/lib/supabase/server";
import type { WeeklyProgressData, WeekActivity } from "@/lib/types";

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

function getTodayPHT(): Date {
  return new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" })
  );
}

function toDateString(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function getMondayOfWeek(d: Date): Date {
  const day = d.getDay(); // 0=Sun, 1=Mon, ...
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export async function getWeeklyProgress(): Promise<WeeklyProgressData | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("current_streak, longest_streak, last_activity_date")
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  const todayPHT = getTodayPHT();
  const todayStr = toDateString(todayPHT);
  const monday = getMondayOfWeek(todayPHT);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const mondayStr = toDateString(monday);
  const sundayStr = toDateString(sunday);

  // Query this week's activities
  const { data: activities } = await supabase
    .from("user_activities")
    .select("activity_date")
    .eq("user_id", user.id)
    .gte("activity_date", mondayStr)
    .lte("activity_date", sundayStr);

  // Count activities per date
  const countsByDate: Record<string, number> = {};
  if (activities) {
    for (const row of activities) {
      countsByDate[row.activity_date] = (countsByDate[row.activity_date] || 0) + 1;
    }
  }

  // Build 7-element days array (Mon–Sun)
  const days: WeekActivity[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = toDateString(d);
    days.push({
      day: DAY_LABELS[i],
      date: dateStr,
      actions: countsByDate[dateStr] || 0,
      isToday: dateStr === todayStr,
      isFuture: dateStr > todayStr,
    });
  }

  const totalActions = days.reduce((sum, d) => sum + d.actions, 0);

  // Display-time streak freshness check
  // If last_activity_date is more than 1 day ago, streak is broken
  let displayStreak = profile.current_streak;
  if (profile.last_activity_date) {
    const yesterday = new Date(todayPHT);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = toDateString(yesterday);
    if (
      profile.last_activity_date !== todayStr &&
      profile.last_activity_date !== yesterdayStr
    ) {
      displayStreak = 0;
    }
  } else {
    displayStreak = 0;
  }

  return {
    currentStreak: displayStreak,
    longestStreak: profile.longest_streak,
    days,
    totalActions,
  };
}
