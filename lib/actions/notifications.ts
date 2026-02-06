"use server";

import { createClient } from "@/lib/supabase/server";

export interface NotificationItem {
  id: string;
  type: string;
  icon: string;
  title: string;
  description: string;
  timestamp: string;
  activityDate: string;
}

function formatActivity(row: {
  id: string;
  activity_type: string;
  activity_date: string;
  created_at: string;
  metadata: Record<string, unknown> | null;
}): NotificationItem {
  const meta = row.metadata ?? {};

  switch (row.activity_type) {
    case "job_view":
      return {
        id: row.id,
        type: row.activity_type,
        icon: "👁",
        title: "Viewed a job",
        description: meta.jobTitle
          ? `You checked out "${meta.jobTitle}"`
          : "You browsed a job listing",
        timestamp: row.created_at,
        activityDate: row.activity_date,
      };
    case "job_apply":
      return {
        id: row.id,
        type: row.activity_type,
        icon: "📤",
        title: "Applied to a job",
        description: meta.jobTitle
          ? `You applied to "${meta.jobTitle}"`
          : "You submitted a job application",
        timestamp: row.created_at,
        activityDate: row.activity_date,
      };
    case "job_save":
      return {
        id: row.id,
        type: row.activity_type,
        icon: "🔖",
        title: "Saved a job",
        description: meta.jobTitle
          ? `You saved "${meta.jobTitle}"`
          : "You bookmarked a job for later",
        timestamp: row.created_at,
        activityDate: row.activity_date,
      };
    case "profile_update":
      return {
        id: row.id,
        type: row.activity_type,
        icon: "✏️",
        title: "Updated your profile",
        description: "You made changes to your profile",
        timestamp: row.created_at,
        activityDate: row.activity_date,
      };
    case "skill_assessment":
      return {
        id: row.id,
        type: row.activity_type,
        icon: "📝",
        title: "Completed a skill assessment",
        description: meta.score
          ? `You scored ${meta.score}/${meta.total}`
          : "You finished a skill quiz",
        timestamp: row.created_at,
        activityDate: row.activity_date,
      };
    default:
      return {
        id: row.id,
        type: row.activity_type,
        icon: "📌",
        title: "Activity",
        description: `Logged activity: ${row.activity_type}`,
        timestamp: row.created_at,
        activityDate: row.activity_date,
      };
  }
}

export async function getRecentActivities(
  limit = 50
): Promise<NotificationItem[]> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
      .from("user_activities")
      .select("id, activity_type, activity_date, created_at, metadata")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Failed to fetch activities:", error.message);
      return [];
    }

    if (!data || data.length === 0) return [];

    return data.map(formatActivity);
  } catch (err) {
    console.error("getRecentActivities error:", err);
    return [];
  }
}
