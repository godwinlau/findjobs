"use server";

import { createClient } from "@/lib/supabase/server";
import { getAssessmentResults } from "@/lib/actions/assessments";
import { getQuestionBank } from "@/lib/data/learn-data";
import type { WeekActivity } from "@/lib/types";
import type { QuizQuestion, QuizResult } from "@/lib/types/learn";
import { logger } from "@/lib/logger";

const log = logger.child({ module: "dashboard-stats" });

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Difficulty weights for weighted assessment scoring (Item Response Theory inspired)
const DIFFICULTY_WEIGHTS = {
  beginner: 1.0,
  intermediate: 1.5,
  advanced: 2.0,
} as const;

// Total assessment categories in the system
const TOTAL_ASSESSMENT_CATEGORIES = 6;

/**
 * Find a question by ID in the question bank
 */
function findQuestion(
  questionId: string,
  bank: Record<string, QuizQuestion[]>
): QuizQuestion | null {
  for (const questions of Object.values(bank)) {
    const found = questions.find((q) => q.id === questionId);
    if (found) return found;
  }
  return null;
}

/**
 * Calculate weighted assessment score with confidence factor
 *
 * Formula: Weighted Score = Σ(score_i × weight_i) / Σ(weight_i) × confidence_factor
 *
 * - weight_i = difficulty weight for each question answered correctly
 * - confidence_factor = 0.7 + (0.3 × coverage) where coverage = categories assessed / total categories
 *   This rewards breadth: 1 category = 72.5%, 6 categories = 100% of raw score
 */
function calculateWeightedAssessmentScore(
  results: Record<string, QuizResult>,
  questionBank: Record<string, QuizQuestion[]>
): { score: number | null; categoriesAssessed: number } {
  if (!results || Object.keys(results).length === 0) {
    return { score: null, categoriesAssessed: 0 };
  }

  let totalWeighted = 0;
  let totalMaxPossible = 0;
  const categoriesAssessed = Object.keys(results).length;

  for (const result of Object.values(results)) {
    const { questionIds, answers, score, total } = result;

    // If we have detailed question data, use weighted scoring
    if (questionIds?.length && answers?.length) {
      for (let i = 0; i < questionIds.length; i++) {
        const question = findQuestion(questionIds[i], questionBank);
        const difficulty = question?.difficulty ?? "intermediate";
        const weight = DIFFICULTY_WEIGHTS[difficulty];
        totalMaxPossible += weight;

        // Check if answer was correct
        if (question && answers[i] === question.correctIndex) {
          totalWeighted += weight;
        }
      }
    } else {
      // Fallback: treat all questions as intermediate difficulty
      totalWeighted += score * DIFFICULTY_WEIGHTS.intermediate;
      totalMaxPossible += total * DIFFICULTY_WEIGHTS.intermediate;
    }
  }

  if (totalMaxPossible === 0) {
    return { score: null, categoriesAssessed };
  }

  // Calculate raw score percentage
  const rawScore = (totalWeighted / totalMaxPossible) * 100;

  // Apply confidence factor based on coverage
  const coverage = categoriesAssessed / TOTAL_ASSESSMENT_CATEGORIES;
  const confidenceFactor = 0.7 + 0.3 * coverage; // Range: 0.7 to 1.0
  const finalScore = Math.round(rawScore * confidenceFactor);

  return { score: finalScore, categoriesAssessed };
}

export interface DailyActivity {
  date: string;
  day: string;
  applications: number;
  views: number;
  saves: number;
}

export interface DashboardStats {
  // Job search metrics with week-over-week comparison
  applications: { current: number; previous: number };
  jobsViewed: { current: number; previous: number };
  jobsSaved: { current: number; previous: number };

  // Streak info
  streak: {
    current: number;
    longest: number;
    days: WeekActivity[];
  };

  // Skills metrics
  assessmentAverage: number | null;
  categoriesAssessed: number;
  totalCategories: number;
  skillsCount: number;
  inDemandSkillsCount: number;

  // Match quality
  avgMatchPercent: number | null;

  // Daily activity for chart
  dailyActivity: DailyActivity[];
}

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

export async function getDashboardStats(): Promise<DashboardStats | null> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    // Get profile for streak and skills
    const { data: profile } = await supabase
      .from("profiles")
      .select(
        "current_streak, longest_streak, last_activity_date, skills, preferred_industries"
      )
      .eq("id", user.id)
      .single();

    if (!profile) return null;

    const todayPHT = getTodayPHT();
    const todayStr = toDateString(todayPHT);

    // Current week range
    const currentMonday = getMondayOfWeek(todayPHT);
    const currentSunday = new Date(currentMonday);
    currentSunday.setDate(currentMonday.getDate() + 6);
    const currentMondayStr = toDateString(currentMonday);
    const currentSundayStr = toDateString(currentSunday);

    // Previous week range
    const prevMonday = new Date(currentMonday);
    prevMonday.setDate(prevMonday.getDate() - 7);
    const prevSunday = new Date(prevMonday);
    prevSunday.setDate(prevMonday.getDate() + 6);
    const prevMondayStr = toDateString(prevMonday);
    const prevSundayStr = toDateString(prevSunday);

    // Fetch activities for both weeks
    const { data: activities } = await supabase
      .from("user_activities")
      .select("activity_type, activity_date, metadata")
      .eq("user_id", user.id)
      .gte("activity_date", prevMondayStr)
      .lte("activity_date", currentSundayStr);

    // Aggregate by week and type
    const currentWeek = {
      applications: 0,
      views: 0,
      saves: 0,
    };
    const prevWeek = {
      applications: 0,
      views: 0,
      saves: 0,
    };

    // Daily breakdown for chart
    const dailyMap: Record<
      string,
      { applications: number; views: number; saves: number }
    > = {};

    // Match percentages from applications this week
    const matchPercents: number[] = [];

    if (activities) {
      for (const row of activities) {
        const isCurrentWeek =
          row.activity_date >= currentMondayStr &&
          row.activity_date <= currentSundayStr;
        const isPrevWeek =
          row.activity_date >= prevMondayStr &&
          row.activity_date <= prevSundayStr;

        const target = isCurrentWeek
          ? currentWeek
          : isPrevWeek
          ? prevWeek
          : null;
        if (!target) continue;

        // Daily tracking (current week only)
        if (isCurrentWeek) {
          if (!dailyMap[row.activity_date]) {
            dailyMap[row.activity_date] = {
              applications: 0,
              views: 0,
              saves: 0,
            };
          }
        }

        switch (row.activity_type) {
          case "job_apply":
            target.applications++;
            if (isCurrentWeek) {
              dailyMap[row.activity_date].applications++;
              // Extract match percent if available
              const meta = row.metadata as Record<string, unknown> | null;
              if (meta?.matchPercent && typeof meta.matchPercent === "number") {
                matchPercents.push(meta.matchPercent);
              }
            }
            break;
          case "job_view":
            target.views++;
            if (isCurrentWeek) {
              dailyMap[row.activity_date].views++;
            }
            break;
          case "job_save":
            target.saves++;
            if (isCurrentWeek) {
              dailyMap[row.activity_date].saves++;
            }
            break;
        }
      }
    }

    // Build daily activity array for chart (Mon-Sun)
    const dailyActivity: DailyActivity[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(currentMonday);
      d.setDate(currentMonday.getDate() + i);
      const dateStr = toDateString(d);
      const dayData = dailyMap[dateStr] || {
        applications: 0,
        views: 0,
        saves: 0,
      };

      dailyActivity.push({
        date: dateStr,
        day: DAY_LABELS[i],
        applications: dayData.applications,
        views: dayData.views,
        saves: dayData.saves,
      });
    }

    // Build week days for streak heatmap
    const days: WeekActivity[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(currentMonday);
      d.setDate(currentMonday.getDate() + i);
      const dateStr = toDateString(d);
      const dayData = dailyMap[dateStr];
      const actions = dayData
        ? dayData.applications + dayData.views + dayData.saves
        : 0;

      days.push({
        day: DAY_LABELS[i].charAt(0),
        date: dateStr,
        actions,
        isToday: dateStr === todayStr,
        isFuture: dateStr > todayStr,
      });
    }

    // Calculate display streak (check if streak is still valid)
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

    // Get assessment results and question bank, then calculate weighted score
    const [assessmentResults, questionBank] = await Promise.all([
      getAssessmentResults(),
      getQuestionBank(),
    ]);
    const totalCategories = TOTAL_ASSESSMENT_CATEGORIES;
    const { score: assessmentAverage, categoriesAssessed } = assessmentResults
      ? calculateWeightedAssessmentScore(assessmentResults, questionBank)
      : { score: null, categoriesAssessed: 0 };

    // Skills count
    const skillsCount = profile.skills?.length ?? 0;
    // For in-demand skills, we'd need to cross-reference with industry demand
    // For now, estimate based on preferred industries (simplified)
    const inDemandSkillsCount = Math.min(
      skillsCount,
      Math.ceil(skillsCount * 0.6)
    );

    // Average match percent
    const avgMatchPercent =
      matchPercents.length > 0
        ? Math.round(
            matchPercents.reduce((a, b) => a + b, 0) / matchPercents.length
          )
        : null;

    return {
      applications: {
        current: currentWeek.applications,
        previous: prevWeek.applications,
      },
      jobsViewed: { current: currentWeek.views, previous: prevWeek.views },
      jobsSaved: { current: currentWeek.saves, previous: prevWeek.saves },
      streak: {
        current: displayStreak,
        longest: profile.longest_streak,
        days,
      },
      assessmentAverage,
      categoriesAssessed,
      totalCategories,
      skillsCount,
      inDemandSkillsCount,
      avgMatchPercent,
      dailyActivity,
    };
  } catch (err) {
    log.error({ err }, "getDashboardStats error");
    return null;
  }
}
