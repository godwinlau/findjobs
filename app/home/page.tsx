import { redirect } from "next/navigation";
import { colors } from "@/lib/constants/colors";
import { Navbar } from "@/components/layout";
import { SearchStrip, HomeClient } from "@/components/home";

import {
  getCategoryJobCounts,
  getTrendingRoles,
  getTopHiringCompanies,
  getRecentlyViewed,
  getTopMatchedJobs,
  getSalarySnapshot,
} from "@/lib/jobs";
import { createClient } from "@/lib/supabase/server";
import { industrySkillDemand } from "@/lib/constants/industrySkillDemand";
import type { SkillDemandItem } from "@/lib/types/home";
import { fetchCategoryData } from "../actions";

export const dynamic = "force-dynamic";

function computeSkillDemand(userSkills: string[]): SkillDemandItem[] {
  if (!userSkills || userSkills.length === 0) return [];

  const results: SkillDemandItem[] = [];

  for (const skill of userSkills) {
    const lowerSkill = skill.toLowerCase();
    let totalDemand = 0;
    let industryCount = 0;

    for (const industrySkills of Object.values(industrySkillDemand)) {
      if (industrySkills[lowerSkill]) {
        totalDemand += industrySkills[lowerSkill];
        industryCount++;
      }
    }

    if (industryCount > 0) {
      const avgDemand = Math.round(totalDemand / industryCount);
      const label: "High" | "Med" | "Low" =
        avgDemand >= 70 ? "High" : avgDemand >= 40 ? "Med" : "Low";
      results.push({ skill, demandPercent: avgDemand, label });
    }
  }

  // Sort by demand descending, take top 6
  results.sort((a, b) => b.demandPercent - a.demandPercent);
  return results.slice(0, 6);
}

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

  // Find the first category with jobs to use as default
  const categories = await getCategoryJobCounts();
  const firstWithJobs = categories.find((c) => c.count > 0);
  const defaultCategory = firstWithJobs?.id ?? categories[0]?.id ?? "tech_it";

  const userSkills = profile?.skills ?? [];

  const [initialRoles, initialCompanies, recentlyViewed, matchedResult, salarySnapshot] = await Promise.all([
    getTrendingRoles(defaultCategory),
    getTopHiringCompanies(defaultCategory),
    getRecentlyViewed(user.id),
    getTopMatchedJobs({ profile, limit: 5 }),
    getSalarySnapshot(userSkills, profile?.desired_salary_min, profile?.desired_salary_max),
  ]);

  const topJob = matchedResult.jobs[0] ?? null;
  const otherJobs = matchedResult.jobs.slice(1);
  const totalMatches = matchedResult.totalMatches;

  const skillDemand = computeSkillDemand(userSkills);

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

      <SearchStrip />

      <HomeClient
        categories={categories}
        initialRoles={initialRoles}
        initialCompanies={initialCompanies}
        recentlyViewed={recentlyViewed}
        skillDemand={skillDemand}
        fetchCategoryData={fetchCategoryData}
        topJob={topJob}
        otherJobs={otherJobs}
        totalMatches={totalMatches}
        salarySnapshot={salarySnapshot}
      />
    </div>
  );
}
