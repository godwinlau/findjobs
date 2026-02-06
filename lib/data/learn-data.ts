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
import type {
  Course,
  QuizQuestion,
} from "@/lib/types/learn";

// ─── Courses ───

export async function getCourseCatalog(): Promise<Course[]> {
  try {
    const courses = await fetchCourses();
    if (courses.length > 0) return courses;
  } catch (e) {
    console.warn("[learn-data] Notion courses fetch failed, using fallback:", e);
  }
  return courseCatalog;
}

// ─── Question Bank (hardcoded only — internal assessment content) ───

export async function getQuestionBank(): Promise<Record<string, QuizQuestion[]>> {
  return hardcodedQuestions;
}
