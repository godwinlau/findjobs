import { redirect } from "next/navigation";
import { VISIBLE_SKILL_CATEGORIES } from "@/lib/constants/onboarding";
import { FOCUS_ASSESSMENT_CATEGORIES } from "@/lib/constants/focusVerticals";
import { Navbar } from "@/components/layout";
import { buildSkillsSnapshot, selectQuestions } from "@/lib/learn";
import {
  buildRecommendationContext,
  scoreAndRankCourses,
  computeSkillROI,
} from "@/lib/recommendations";
import {
  buildInsightHeroData,
  buildMatchProgression,
  buildDemandTrends,
  buildGapResourceLinks,
  buildUserSkillBars,
  computeMatchPotential,
} from "@/lib/learn-page-helpers";
import { LearnPageClient } from "@/components/learn";
import { skillAssessments } from "@/lib/data/learnMockData";
import { getCourseCatalog, getQuestionBank } from "@/lib/data/learn-data";
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

  const [courseCatalog, questionBank, assessmentResults] = await Promise.all([
    getCourseCatalog(),
    getQuestionBank(),
    getAssessmentResults(),
  ]);

  const userSkills: string[] = profile?.skills ?? [];
  const experienceLevel: ProfileExperienceLevel =
    profile?.experience_level ?? "fresh_graduate";
  const snapshot = buildSkillsSnapshot(userSkills, VISIBLE_SKILL_CATEGORIES);

  // Build tailored assessments with questions selected per user context
  const focusAssessmentSet = new Set<string>(FOCUS_ASSESSMENT_CATEGORIES);
  const tailoredAssessments: SkillAssessment[] = skillAssessments
    .filter((a) => focusAssessmentSet.has(a.categoryId))
    .map((a) => {
      const pool = questionBank[a.categoryId] ?? [];
      const categorySkills = VISIBLE_SKILL_CATEGORIES[a.categoryId] ?? [];
      const questions = selectQuestions(pool, {
        experienceLevel,
        userSkills,
        categorySkills,
      });
      return { ...a, questions };
    });

  // Build recommendation context
  const assessmentScores: Record<string, { score: number; total: number }> = {};
  if (assessmentResults) {
    for (const [categoryId, result] of Object.entries(assessmentResults)) {
      if (
        result &&
        typeof result === "object" &&
        "score" in result &&
        "total" in result
      ) {
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
    VISIBLE_SKILL_CATEGORIES
  );

  // Compute personalized data
  const scoredCourses = scoreAndRankCourses(courseCatalog, recContext);
  const skillROIs = computeSkillROI(recContext, courseCatalog);

  // Compute real match potential against the jobs database
  const matchPotential = profile
    ? await computeMatchPotential(profile, skillROIs)
    : null;

  // Build new page data
  const heroData = buildInsightHeroData(snapshot, skillROIs, userSkills, matchPotential);
  const matchProgression = buildMatchProgression(snapshot, skillROIs);
  const demandTrends = buildDemandTrends(
    profile?.preferred_industries ?? [],
    userSkills
  );
  const userSkillBars = buildUserSkillBars(userSkills, snapshot);

  // Build resource links for each skill gap
  const resourceLinksMap: Record<string, ReturnType<typeof buildGapResourceLinks>> = {};
  for (const roi of skillROIs.slice(0, 5)) {
    resourceLinksMap[roi.skill] = buildGapResourceLinks(roi, scoredCourses);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F5F5F0", color: "#0A0A0A" }}>
      <Navbar
        fullName={profile?.full_name || user.user_metadata?.full_name || ""}
        email={user.email || ""}
      />

      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "28px 20px 60px" }}>
        <LearnPageClient
          heroData={heroData}
          skillROIs={skillROIs}
          resourceLinksMap={resourceLinksMap}
          matchProgression={matchProgression}
          matchPotential={matchPotential}
          demandTrends={demandTrends}
          userSkillBars={userSkillBars}
          assessments={tailoredAssessments}
          initialResults={assessmentResults ?? {}}
        />
      </div>
    </div>
  );
}
