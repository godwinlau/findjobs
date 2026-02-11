"use server";

import { createClient } from "@/lib/supabase/server";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type MatchEventType = "impression" | "click" | "apply" | "save" | "dismiss" | "not_relevant";

interface MatchEventInput {
  jobId: string;
  eventType: MatchEventType;
  matchScore?: number;
  position?: number;
  timeSpentMs?: number;
  metadata?: Record<string, unknown>;
}

interface ImpressionInput {
  jobId: string;
  matchScore: number;
  position: number;
}

// ---------------------------------------------------------------------------
// Single event logging
// ---------------------------------------------------------------------------

export async function logMatchEvent({
  jobId,
  eventType,
  matchScore,
  position,
  timeSpentMs,
  metadata,
}: MatchEventInput): Promise<void> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("match_events").insert({
      user_id: user.id,
      job_id: jobId,
      event_type: eventType,
      match_score: matchScore ?? null,
      position: position ?? null,
      time_spent_ms: timeSpentMs ?? null,
      metadata: metadata ?? {},
    });
  } catch {
    // Non-fatal: tracking failures should never block UX
  }
}

// ---------------------------------------------------------------------------
// Batch impression logging (for feed renders)
// ---------------------------------------------------------------------------

export async function logImpressions(
  impressions: ImpressionInput[]
): Promise<void> {
  if (!impressions || impressions.length === 0) return;

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const rows = impressions.map((imp) => ({
      user_id: user.id,
      job_id: imp.jobId,
      event_type: "impression" as const,
      match_score: imp.matchScore,
      position: imp.position,
      time_spent_ms: null,
      metadata: {},
    }));

    await supabase.from("match_events").insert(rows);
  } catch {
    // Non-fatal
  }
}
