import { Suspense } from "react";
import { redirect } from "next/navigation";
import { colors } from "@/lib/constants/colors";
import { Navbar } from "@/components/layout";
import { SearchStrip, HomeClient } from "@/components/home";
import { WelcomeWalkthrough } from "@/components/walkthrough/WelcomeWalkthrough";
import {
  getCategoryJobCounts,
  getTrendingRoles,
  getTopHiringCompanies,
  getRecentlyViewed,
} from "@/lib/jobs";
import { createClient } from "@/lib/supabase/server";
import { industrySkillDemand } from "@/lib/constants/industrySkillDemand";
import type { SkillDemandItem } from "@/lib/types/home";
import { fetchCategoryData } from "./actions";

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

  const [initialRoles, initialCompanies, recentlyViewed] = await Promise.all([
    getTrendingRoles(defaultCategory),
    getTopHiringCompanies(defaultCategory),
    getRecentlyViewed(user.id),
  ]);

  const userSkills = profile?.skills ?? [];
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
      />

      <Suspense fallback={null}>
        <WelcomeWalkthrough
          firstName={profile?.full_name?.split(" ")[0] || ""}
        />
      </Suspense>
    </div>
  );
}
