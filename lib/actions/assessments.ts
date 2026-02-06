"use server";

import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/actions/activity";
import { validateAssessmentResult } from "@/lib/validation/schemas";
import type { QuizResult } from "@/lib/types/learn";

export async function saveAssessmentResult(params: {
  categoryId: string;
  score: number;
  total: number;
  questionIds: string[];
  answers: number[];
}): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Not authenticated" };

    // Fetch experience_level for snapshotting
    const { data: profile } = await supabase
      .from("profiles")
      .select("experience_level")
      .eq("id", user.id)
      .single();

    const experienceLevel = profile?.experience_level ?? "fresh_graduate";

    // Validate input
    const validation = validateAssessmentResult({
      categoryId: params.categoryId,
      score: params.score,
      total: params.total,
      questionIds: params.questionIds,
      answers: params.answers,
      experienceLevel,
    });

    if (!validation.success) {
      return { success: false, error: validation.error };
    }

    const { error } = await supabase
      .from("skill_assessment_results")
      .insert({
        user_id: user.id,
        category_id: params.categoryId,
        score: params.score,
        total: params.total,
        question_ids: params.questionIds,
        answers: params.answers,
        experience_level: experienceLevel,
      });

    if (error) {
      console.error("Failed to save assessment result:", error.message);
      return { success: false, error: "Failed to save assessment. Please try again." };
    }

    // Log activity for streak tracking
    logActivity({
      activityType: "skill_assessment",
      targetId: params.categoryId,
      metadata: { score: params.score, total: params.total },
    }).catch((err) => console.error("Activity log error:", err));

    return { success: true };
  } catch (err) {
    console.error("saveAssessmentResult error:", err);
    return { success: false, error: "Unexpected error occurred." };
  }
}

export async function getAssessmentResults(): Promise<Record<
  string,
  QuizResult
> | null> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
      .from("skill_assessment_results")
      .select("category_id, score, total, question_ids, answers, completed_at")
      .eq("user_id", user.id)
      .order("completed_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch assessment results:", error.message);
      return null;
    }

    if (!data || data.length === 0) return null;

    // Deduplicate: keep latest per category_id
    const resultMap: Record<string, QuizResult> = {};
    for (const row of data) {
      if (!resultMap[row.category_id]) {
        resultMap[row.category_id] = {
          score: row.score,
          total: row.total,
          completedAt: row.completed_at,
          questionIds: row.question_ids,
          answers: row.answers,
        };
      }
    }

    return resultMap;
  } catch (err) {
    console.error("getAssessmentResults error:", err);
    return null;
  }
}
