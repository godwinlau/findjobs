import { Suspense } from "react";
import { redirect } from "next/navigation";
import { colors } from "@/lib/constants/colors";
import { Navbar } from "@/components/layout";
import { ResponsiveContainer } from "@/components/layout/ResponsiveContainer";
import { DashboardClient } from "@/components/dashboard";
import { WelcomeWalkthrough } from "@/components/walkthrough/WelcomeWalkthrough";
import { getTopMatchedJobs, getJobsLastUpdated } from "@/lib/jobs";
import { analyzeProfileGaps } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";
import { buildSkillsSnapshot } from "@/lib/learn";
import { buildRecommendationContext, computeSkillROI } from "@/lib/recommendations";
import { SKILL_CATEGORIES } from "@/lib/constants/onboarding";
import { getCourseCatalog } from "@/lib/data/learn-data";
import { getAssessmentResults } from "@/lib/actions/assessments";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
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

  const [
    { jobs: topJobs, totalMatches },
    { lastUpdated },
    assessmentResults,
    courseCatalog,
  ] = await Promise.all([
    getTopMatchedJobs({ profile, limit: 3 }),
    getJobsLastUpdated(),
    getAssessmentResults(),
    getCourseCatalog(),
  ]);

  const topJob = topJobs.length > 0 ? topJobs[0] : null;
  const otherJobs = topJobs.slice(1, 3);

  const profileCompletion = profile?.profile_completion ?? 0;
  const profileComplete = profileCompletion === 100;
  const profileGaps = analyzeProfileGaps(profile);

  // Build skill ROI data
  const userSkills = profile?.skills ?? [];
  const snapshot = buildSkillsSnapshot(userSkills, SKILL_CATEGORIES);

  // Convert assessment results to the format expected by recommendation context
  const assessmentScores: Record<string, { score: number; total: number }> = {};
  if (assessmentResults) {
    for (const [categoryId, result] of Object.entries(assessmentResults)) {
      assessmentScores[categoryId] = { score: result.score, total: result.total };
    }
  }

  const recommendationContext = buildRecommendationContext(
    profile,
    snapshot,
    assessmentScores,
    SKILL_CATEGORIES
  );

  const skillROI = computeSkillROI(recommendationContext, courseCatalog);
  const topSkills = skillROI.slice(0, 3);

  const hasAssessments = Object.keys(assessmentScores).length > 0;
  const highMatchJobCount = topJobs.filter((j) => j.match >= 70).length;

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
        <DashboardClient
          topJob={topJob}
          otherJobs={otherJobs}
          totalMatches={totalMatches}
          lastUpdated={lastUpdated}
          profileComplete={profileComplete}
          profileCompletion={profileCompletion}
          profileGaps={profileGaps}
          hasAssessments={hasAssessments}
          topSkills={topSkills}
          highMatchJobCount={highMatchJobCount}
        />
      </ResponsiveContainer>

      <Suspense fallback={null}>
        <WelcomeWalkthrough
          firstName={profile?.full_name?.split(" ")[0] || ""}
        />
      </Suspense>
    </div>
  );
}
