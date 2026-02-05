import { redirect } from "next/navigation";
import { colors } from "@/lib/constants/colors";
import { SKILL_CATEGORIES } from "@/lib/constants/onboarding";
import { Navbar } from "@/components/layout";
import { ResponsiveContainer } from "@/components/layout/ResponsiveContainer";
import { buildSkillsSnapshot, selectQuestions } from "@/lib/learn";
import {
  SkillsSnapshotHero,
  LearningPathsSection,
  AssessmentsSection,
  QuickWinsSection,
  FreeResourcesSection,
  LearningActivityFeed,
} from "@/components/learn";
import {
  learningPaths,
  skillAssessments,
  questionBank,
  quickWins,
  freeResources,
  learningActivities,
} from "@/lib/data/learnMockData";
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
        <LearningPathsSection paths={learningPaths} />
        <AssessmentsSection
          assessments={tailoredAssessments}
          initialResults={assessmentResults ?? {}}
        />
        <QuickWinsSection wins={quickWins} />
        <FreeResourcesSection resources={freeResources} />
        <LearningActivityFeed activities={learningActivities} />
      </ResponsiveContainer>
    </div>
  );
}
