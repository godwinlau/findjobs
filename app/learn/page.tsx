import { redirect } from "next/navigation";
import { colors } from "@/lib/constants/colors";
import { SKILL_CATEGORIES } from "@/lib/constants/onboarding";
import { Navbar } from "@/components/layout";
import { ResponsiveContainer } from "@/components/layout/ResponsiveContainer";
import { buildSkillsSnapshot, selectQuestions } from "@/lib/learn";
import {
  buildRecommendationContext,
  scoreAndRankCourses,
  computeSkillROI,
  rankLearningPaths,
  rankQuickWins,
  rankFreeResources,
} from "@/lib/recommendations";
import {
  SkillsSnapshotHero,
  LearningPathsSection,
  AssessmentsSection,
  QuickWinsSection,
  FreeResourcesSection,
  LearningActivityFeed,
  SkillROISection,
  RecommendedCoursesSection,
} from "@/components/learn";
import {
  learningPaths,
  skillAssessments,
  questionBank,
  quickWins,
  freeResources,
  learningActivities,
} from "@/lib/data/learnMockData";
import { courseCatalog } from "@/lib/data/courseCatalog";
import { getAssessmentResults } from "@/lib/actions/assessments";
import { createClient } from "@/lib/supabase/server";
import type { SkillAssessment } from "@/lib/types/learn";
import type { ProfileExperienceLevel } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function LearnPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const userSkills: string[] = profile?.skills ?? [];
  const experienceLevel: ProfileExperienceLevel =
    profile?.experience_level ?? "fresh_graduate";
  const snapshot = buildSkillsSnapshot(userSkills, SKILL_CATEGORIES);

  // Fetch persisted assessment results from Supabase
  const assessmentResults = await getAssessmentResults();

  // Build tailored assessments with questions selected per user context
  const tailoredAssessments: SkillAssessment[] = skillAssessments.map((a) => {
    const pool = questionBank[a.categoryId] ?? [];
    const categorySkills = SKILL_CATEGORIES[a.categoryId] ?? [];
    const questions = selectQuestions(pool, {
      experienceLevel,
      userSkills,
      categorySkills,
    });
    return { ...a, questions };
  });

  // Build recommendation context from profile + snapshot + assessment results
  const assessmentScores: Record<string, { score: number; total: number }> = {};
  if (assessmentResults) {
    for (const [categoryId, result] of Object.entries(assessmentResults)) {
      if (result && typeof result === "object" && "score" in result && "total" in result) {
        assessmentScores[categoryId] = {
          score: result.score as number,
          total: result.total as number,
        };
      }
    }
  }

  const recContext = buildRecommendationContext(
    profile,
    snapshot,
    assessmentScores,
    SKILL_CATEGORIES
  );

  // Compute personalized data
  const scoredCourses = scoreAndRankCourses(courseCatalog, recContext);
  const skillROIs = computeSkillROI(recContext, courseCatalog);
  const rankedPaths = rankLearningPaths(learningPaths, recContext);
  const rankedWins = rankQuickWins(quickWins, recContext);
  const rankedResources = rankFreeResources(freeResources, recContext);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: colors.bg,
        color: colors.text,
      }}
    >
      <Navbar
        fullName={profile?.full_name || user.user_metadata?.full_name || ""}
        email={user.email || ""}
      />

      <ResponsiveContainer>
        <SkillsSnapshotHero snapshot={snapshot} />
        <SkillROISection skills={skillROIs} />
        <RecommendedCoursesSection courses={scoredCourses} />
        <LearningPathsSection paths={rankedPaths} />
        <AssessmentsSection
          assessments={tailoredAssessments}
          initialResults={assessmentResults ?? {}}
        />
        <QuickWinsSection wins={rankedWins} />
        <FreeResourcesSection resources={rankedResources} />
        <LearningActivityFeed activities={learningActivities} />
      </ResponsiveContainer>
    </div>
  );
}
