/**
 * Unified data access for learn page content.
 * Strategy: try Notion → fallback to hardcoded data (courses only).
 *
 * All functions return the same types consumed by components,
 * so callers don't need to know which source provided the data.
 */

import { fetchCourses } from "@/lib/notion";
import { courseCatalog } from "@/lib/data/courseCatalog";
import {
  questionBank as hardcodedQuestions,
} from "@/lib/data/learnMockData";
import { isFocusCluster, FOCUS_ASSESSMENT_CATEGORIES } from "@/lib/constants/focusVerticals";
import type {
  Course,
  QuizQuestion,
} from "@/lib/types/learn";
import { logger } from "@/lib/logger";

const log = logger.child({ module: "learn-data" });

const focusAssessmentSet = new Set<string>(FOCUS_ASSESSMENT_CATEGORIES);

// ─── Courses ───

export async function getCourseCatalog(): Promise<Course[]> {
  let courses: Course[];
  try {
    const notionCourses = await fetchCourses();
    courses = notionCourses.length > 0 ? notionCourses : courseCatalog;
  } catch (e) {
    log.warn({ err: e }, "Notion courses fetch failed, using fallback");
    courses = courseCatalog;
  }
  return courses.filter((c) => isFocusCluster(c.categoryId));
}

// ─── Question Bank (hardcoded only — internal assessment content) ───

export async function getQuestionBank(): Promise<Record<string, QuizQuestion[]>> {
  const filtered: Record<string, QuizQuestion[]> = {};
  for (const [key, questions] of Object.entries(hardcodedQuestions)) {
    if (focusAssessmentSet.has(key)) {
      filtered[key] = questions;
    }
  }
  return filtered;
}
