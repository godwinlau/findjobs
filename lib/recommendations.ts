import { industrySkillDemand } from "@/lib/constants/industrySkillDemand";
import type {
  Course,
  ScoredCourse,
  SkillROI,
  RecommendationContext,
  LearningPath,
  ScoredLearningPath,
  QuickWin,
  ScoredQuickWin,
  FreeResource,
  ScoredFreeResource,
} from "@/lib/types/learn";

// ─── Helpers ───

function normalize(s: string): string {
  return s.toLowerCase().trim();
}

function getUserGapSkills(ctx: RecommendationContext): string[] {
  const normalizedUserSkills = ctx.userSkills.map(normalize);
  const allSkills: string[] = [];
  for (const skills of Object.values(ctx.allSkillsByCategory)) {
    for (const s of skills) {
      if (!normalizedUserSkills.includes(normalize(s))) {
        allSkills.push(normalize(s));
      }
    }
  }
  return [...new Set(allSkills)];
}

function getDemandForSkill(skill: string, industries: string[]): number {
  let total = 0;
  const key = normalize(skill);
  for (const industry of industries) {
    const demand = industrySkillDemand[industry];
    if (!demand) continue;
    for (const [s, weight] of Object.entries(demand)) {
      if (normalize(s) === key) {
        total += weight;
      }
    }
  }
  return total;
}

function difficultyMatchScore(
  courseDifficulty: string,
  experienceLevel: string
): number {
  const difficultyMap: Record<string, number> = {
    beginner: 1,
    intermediate: 2,
    advanced: 3,
  };
  const levelMap: Record<string, number> = {
    fresh_graduate: 1,
    junior: 1.5,
    mid: 2,
    senior: 3,
  };
  const courseLevel = difficultyMap[courseDifficulty] ?? 1;
  const userLevel = levelMap[experienceLevel] ?? 1;
  const diff = Math.abs(courseLevel - userLevel);
  if (diff === 0) return 10;
  if (diff <= 0.5) return 8;
  if (diff <= 1) return 5;
  return 2;
}

// ─── Course Scoring ───

export function buildRecommendationContext(
  profile: {
    skills?: string[];
    experience_level?: string;
    preferred_industries?: string[];
  } | null,
  snapshot: RecommendationContext["snapshot"],
  assessmentResults: Record<string, { score: number; total: number }>,
  allSkillsByCategory: Record<string, string[]>
): RecommendationContext {
  return {
    userSkills: profile?.skills ?? [],
    experienceLevel: profile?.experience_level ?? "fresh_graduate",
    preferredIndustries: profile?.preferred_industries ?? [],
    snapshot,
    assessmentResults,
    allSkillsByCategory,
  };
}

export function scoreAndRankCourses(
  courses: Course[],
  ctx: RecommendationContext
): ScoredCourse[] {
  const normalizedUserSkills = ctx.userSkills.map(normalize);
  const gapSkills = getUserGapSkills(ctx);

  const scored: ScoredCourse[] = courses.map((course) => {
    let score = 0;
    const reasons: string[] = [];
    const skillGapsCovered: string[] = [];

    // 1. Skill Gap Coverage (35 points max)
    const gapsCovered = course.skillsTaught.filter((s) =>
      gapSkills.includes(normalize(s))
    );
    skillGapsCovered.push(...gapsCovered);
    const gapRatio =
      course.skillsTaught.length > 0
        ? gapsCovered.length / course.skillsTaught.length
        : 0;
    const gapScore = gapRatio * 35;
    score += gapScore;
    if (gapsCovered.length > 0) {
      reasons.push(`Covers ${gapsCovered.length} skill gap${gapsCovered.length > 1 ? "s" : ""} you need`);
    }

    // 2. Industry Alignment (20 points max)
    const matchingIndustries = course.industries.filter((i) =>
      ctx.preferredIndustries.includes(i)
    );
    const industryScore =
      ctx.preferredIndustries.length > 0
        ? (matchingIndustries.length / Math.max(course.industries.length, 1)) * 20
        : 5; // default if no preferred industries
    score += industryScore;
    if (matchingIndustries.length > 0) {
      reasons.push(`Relevant to ${matchingIndustries[0]}${matchingIndustries.length > 1 ? ` +${matchingIndustries.length - 1}` : ""}`);
    }

    // 3. Assessment Performance (15 points max)
    const categoryResult = ctx.assessmentResults[course.categoryId];
    if (categoryResult && categoryResult.total > 0) {
      const pct = categoryResult.score / categoryResult.total;
      // Lower score = more need = higher points
      const assessScore = (1 - pct) * 15;
      score += assessScore;
      if (pct < 0.6) {
        reasons.push("Strengthen your weak assessment area");
      }
    } else {
      // No assessment taken for this category — slight boost
      score += 7;
    }

    // 4. Experience Level Match (10 points max)
    score += difficultyMatchScore(course.difficulty, ctx.experienceLevel);

    // 5. Jobs Unlocked / ROI (10 points max)
    let demandTotal = 0;
    for (const skill of gapsCovered) {
      demandTotal += getDemandForSkill(skill, ctx.preferredIndustries);
    }
    const roiScore = Math.min(demandTotal / 50, 10);
    score += roiScore;

    // 6. Category Weakness (10 points max)
    const catSnapshot = ctx.snapshot.scores.find(
      (s) => s.category === course.categoryId
    );
    if (catSnapshot) {
      const weaknessScore = ((100 - catSnapshot.percentage) / 100) * 10;
      score += weaknessScore;
    }

    // Penalty: if user already has ALL taught skills
    const hasAll = course.skillsTaught.every((s) =>
      normalizedUserSkills.includes(normalize(s))
    );
    if (hasAll) {
      score -= 30;
      reasons.length = 0;
      reasons.push("You already have these skills");
    }

    // Estimate jobs unlocked
    const jobsUnlocked = Math.max(
      Math.round(demandTotal / 30),
      gapsCovered.length > 0 ? 1 : 0
    );

    return {
      ...course,
      relevanceScore: Math.max(0, Math.round(score)),
      reasons,
      jobsUnlocked,
      skillGapsCovered,
    };
  });

  return scored.sort((a, b) => b.relevanceScore - a.relevanceScore);
}

// ─── Skill ROI ───

export function computeSkillROI(
  ctx: RecommendationContext,
  courses: Course[]
): SkillROI[] {
  const normalizedUserSkills = ctx.userSkills.map(normalize);
  const gapSkills = getUserGapSkills(ctx);
  const results: SkillROI[] = [];

  // User's dominant categories (≥20% skill coverage) — used to boost
  // industry-demanded skills that also sit in a category the user already
  // has strength in (bridge skills for career transitions).
  const dominantCategories = ctx.snapshot.scores
    .filter((s) => s.percentage >= 20)
    .map((s) => s.category);

  for (const skill of gapSkills) {
    // Find which category this skill belongs to
    let category = "";
    for (const [cat, skills] of Object.entries(ctx.allSkillsByCategory)) {
      if (skills.some((s) => normalize(s) === skill)) {
        category = cat;
        break;
      }
    }

    // Calculate demand across preferred industries
    const demand = getDemandForSkill(skill, ctx.preferredIndustries);

    // Skip skills with no demand in user's industries
    if (demand === 0 && ctx.preferredIndustries.length > 0) continue;

    // Find top industries for this skill
    const topIndustries: { name: string; demand: number }[] = [];
    for (const industry of ctx.preferredIndustries) {
      const d = getDemandForSkill(skill, [industry]);
      if (d > 0) topIndustries.push({ name: industry, demand: d });
    }
    topIndustries.sort((a, b) => b.demand - a.demand);

    // Find best matching course
    const matchingCourses = courses.filter((c) =>
      c.skillsTaught.some((s) => normalize(s) === skill)
    );
    const bestCourse =
      matchingCourses.length > 0
        ? matchingCourses.sort((a, b) => {
            // Prefer courses that match user's experience level
            const aMatch = difficultyMatchScore(a.difficulty, ctx.experienceLevel);
            const bMatch = difficultyMatchScore(b.difficulty, ctx.experienceLevel);
            return bMatch - aMatch;
          })[0]
        : null;

    // Determine difficulty based on category
    const catSnapshot = ctx.snapshot.scores.find((s) => s.category === category);
    let difficulty: "beginner" | "intermediate" | "advanced" = "beginner";
    if (catSnapshot && catSnapshot.percentage > 50) difficulty = "intermediate";
    if (catSnapshot && catSnapshot.percentage > 80) difficulty = "advanced";

    // Bridge-skill boost: if this industry-demanded skill also belongs to a
    // category the user already has strength in, it's a natural bridge between
    // their background and their target industry — prioritize it.
    const bridgeBoost = dominantCategories.includes(category) ? 15 : 0;

    results.push({
      skill,
      category,
      jobsRequiring: demand,
      estimatedNewMatches: Math.max(Math.round((demand + bridgeBoost) / 25), 1),
      topIndustries: topIndustries.slice(0, 3).map((t) => t.name),
      difficulty,
      recommendedCourse: bestCourse,
    });
  }

  return results.sort((a, b) => b.estimatedNewMatches - a.estimatedNewMatches);
}

// ─── Learning Paths Ranking ───

export function rankLearningPaths(
  paths: LearningPath[],
  ctx: RecommendationContext
): ScoredLearningPath[] {
  const normalizedUserSkills = ctx.userSkills.map(normalize);

  const scored = paths.map((path) => {
    let score = 0;

    // Role alignment: check if path target role relates to preferred industries
    const roleIndustryMap: Record<string, string[]> = {
      "Customer Support Representative": ["BPO / Outsourcing", "Telecommunications", "Retail / E-commerce"],
      "Junior Web Developer": ["IT / Software", "Media / Advertising"],
      "Data Entry Specialist": ["Banking / Finance", "Government", "Manufacturing"],
    };
    const relatedIndustries = roleIndustryMap[path.targetRole] ?? [];
    const industryOverlap = relatedIndustries.filter((i) =>
      ctx.preferredIndustries.includes(i)
    ).length;
    score += industryOverlap * 15;

    // Experience level fit
    const levelFit: Record<string, string[]> = {
      beginner: ["fresh_graduate", "junior"],
      intermediate: ["junior", "mid"],
      advanced: ["mid", "senior"],
    };
    if (levelFit[path.level]?.includes(ctx.experienceLevel)) {
      score += 10;
    }

    // Gap skills coverage: check path step topics against user gaps
    const pathKeywords = path.steps
      .map((s) => normalize(s.title))
      .join(" ");
    const gapSkills = getUserGapSkills(ctx);
    let gapHits = 0;
    for (const gap of gapSkills) {
      if (pathKeywords.includes(gap)) gapHits++;
    }
    score += Math.min(gapHits * 5, 20);

    return {
      ...path,
      relevanceScore: score,
      isTopPick: false,
    };
  });

  scored.sort((a, b) => b.relevanceScore - a.relevanceScore);
  if (scored.length > 0) {
    scored[0].isTopPick = true;
  }

  return scored;
}

// ─── Quick Wins Ranking ───

export function rankQuickWins(
  wins: QuickWin[],
  ctx: RecommendationContext
): ScoredQuickWin[] {
  const normalizedUserSkills = ctx.userSkills.map(normalize);

  const scored = wins
    .filter((win) => !normalizedUserSkills.includes(normalize(win.skill)))
    .map((win) => {
      const demand = getDemandForSkill(win.skill, ctx.preferredIndustries);
      return {
        ...win,
        relevanceScore: demand + win.jobsUnlocked,
        isTopPick: false,
      };
    });

  scored.sort((a, b) => b.relevanceScore - a.relevanceScore);
  if (scored.length > 0) {
    scored[0].isTopPick = true;
  }

  return scored;
}

// ─── Free Resources Ranking ───

const RESOURCE_CATEGORY_MAP: Record<string, string[]> = {
  "General": ["Virtual Assistance & Admin", "BPO & Customer Service"],
  "Tech & Business": ["Software Development"],
  "Tech & Dev": ["Software Development"],
  "Business": ["Virtual Assistance & Admin"],
  "Design": ["Design & Creative"],
};

export function rankFreeResources(
  resources: FreeResource[],
  ctx: RecommendationContext
): ScoredFreeResource[] {
  const scored = resources.map((resource) => {
    let score = 0;

    // Map resource category to skill categories and check weakness
    const relatedCats = RESOURCE_CATEGORY_MAP[resource.category] ?? [];
    for (const cat of relatedCats) {
      const catScore = ctx.snapshot.scores.find((s) => s.category === cat);
      if (catScore) {
        // Lower user score in this category = higher relevance
        score += (100 - catScore.percentage) * 0.3;
      }
    }

    // Boost if resource category matches user's weak areas
    const weakest = [...ctx.snapshot.scores].sort(
      (a, b) => a.percentage - b.percentage
    );
    if (weakest.length > 0 && relatedCats.includes(weakest[0].category)) {
      score += 15;
    }

    return {
      ...resource,
      relevanceScore: Math.round(score),
      isBestForGaps: false,
    };
  });

  scored.sort((a, b) => b.relevanceScore - a.relevanceScore);
  if (scored.length > 0) {
    scored[0].isBestForGaps = true;
  }

  return scored;
}
