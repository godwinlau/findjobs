import type { SkillScore, SkillsSnapshot, QuizQuestion } from "@/lib/types/learn";
import type { ProfileExperienceLevel } from "@/lib/types";

/**
 * Builds a skills snapshot by comparing user's actual skills
 * against the categories defined in SKILL_CATEGORIES.
 */
export function buildSkillsSnapshot(
  userSkills: string[],
  skillCategories: Record<string, string[]>
): SkillsSnapshot {
  const normalized = userSkills.map((s) => s.toLowerCase().trim());

  const scores: SkillScore[] = Object.entries(skillCategories).map(
    ([category, skills]) => {
      const userCount = skills.filter((skill) =>
        normalized.includes(skill.toLowerCase())
      ).length;

      return {
        category,
        userCount,
        totalCount: skills.length,
        percentage: skills.length > 0 ? Math.round((userCount / skills.length) * 100) : 0,
      };
    }
  );

  const totalUser = scores.reduce((sum, s) => sum + s.userCount, 0);
  const totalAll = scores.reduce((sum, s) => sum + s.totalCount, 0);
  const overallPercentage =
    totalAll > 0 ? Math.round((totalUser / totalAll) * 100) : 0;

  // Find the category with the lowest percentage that still has room to grow
  const sortedByGap = [...scores]
    .filter((s) => s.percentage < 100)
    .sort((a, b) => a.percentage - b.percentage);

  const weakest = sortedByGap[0];
  const topRecommendation = weakest
    ? `Improve your ${weakest.category} skills to unlock more matches`
    : "Great job! You have strong coverage across all categories";

  return { scores, overallPercentage, topRecommendation };
}

// ─── Difficulty targets by experience level ───

const DIFFICULTY_TARGETS: Record<
  ProfileExperienceLevel,
  { beginner: number; intermediate: number; advanced: number }
> = {
  fresh_graduate: { beginner: 3, intermediate: 2, advanced: 0 },
  junior: { beginner: 2, intermediate: 2, advanced: 1 },
  mid: { beginner: 1, intermediate: 2, advanced: 2 },
  senior: { beginner: 0, intermediate: 2, advanced: 3 },
};

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Selects `count` questions from a pool, tailored to experience level and skill gaps.
 *
 * @param pool        Full question bank for a category (10 questions)
 * @param context     User context for targeting
 * @param count       Number of questions to select (default 5)
 */
export function selectQuestions(
  pool: QuizQuestion[],
  context: {
    experienceLevel: ProfileExperienceLevel;
    userSkills: string[];
    categorySkills: string[];
  },
  count = 5
): QuizQuestion[] {
  if (pool.length <= count) return shuffleArray(pool);

  const targets = DIFFICULTY_TARGETS[context.experienceLevel];
  const normalizedUserSkills = context.userSkills.map((s) => s.toLowerCase().trim());

  // Skill gaps = category skills the user does NOT have
  const gapSkills = context.categorySkills
    .map((s) => s.toLowerCase())
    .filter((s) => !normalizedUserSkills.includes(s));

  // Group questions by difficulty
  const byDifficulty: Record<string, QuizQuestion[]> = {
    beginner: [],
    intermediate: [],
    advanced: [],
  };
  for (const q of pool) {
    byDifficulty[q.difficulty]?.push(q);
  }

  const selected: QuizQuestion[] = [];
  const usedIds = new Set<string>();

  // For each difficulty tier, score and pick top questions
  for (const difficulty of ["beginner", "intermediate", "advanced"] as const) {
    const target = targets[difficulty];
    if (target === 0) continue;

    const candidates = byDifficulty[difficulty];
    const scored = candidates.map((q) => {
      let score = 10; // base score for difficulty match
      // Boost questions that cover skill gaps
      for (const tag of q.skillTags) {
        if (gapSkills.includes(tag.toLowerCase())) {
          score += 5;
        }
      }
      // Random tiebreaker for variety across retakes
      score += Math.random();
      return { q, score };
    });

    scored.sort((a, b) => b.score - a.score);

    for (const { q } of scored) {
      if (selected.length >= count) break;
      if (usedIds.has(q.id)) continue;
      if (selected.filter((s) => s.difficulty === difficulty).length >= target) break;
      selected.push(q);
      usedIds.add(q.id);
    }
  }

  // Backfill if any tier was short
  if (selected.length < count) {
    const remaining = pool.filter((q) => !usedIds.has(q.id));
    const scored = remaining.map((q) => {
      let score = 0;
      for (const tag of q.skillTags) {
        if (gapSkills.includes(tag.toLowerCase())) score += 5;
      }
      score += Math.random();
      return { q, score };
    });
    scored.sort((a, b) => b.score - a.score);

    for (const { q } of scored) {
      if (selected.length >= count) break;
      selected.push(q);
    }
  }

  return shuffleArray(selected);
}
