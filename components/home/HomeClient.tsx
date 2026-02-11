"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import type {
  TrendingRole,
  CompanyInfo,
  RecentlyViewedJob,
  SkillDemandItem,
  CategoryCount,
  SalarySnapshotData,
} from "@/lib/types/home";
import type { Job } from "@/lib/types";
import { TopMatchesPreview } from "@/components/dashboard";
import { CategoryBrowse } from "./CategoryBrowse";
import { TrendingRoles } from "./TrendingRoles";
import { CompaniesList } from "./CompaniesList";
import { SkillsDemandSidebar } from "./SkillsDemandSidebar";
import { SalarySnapshotSidebar } from "./SalarySnapshotSidebar";
import { RecentlyViewedSidebar } from "./RecentlyViewedSidebar";
import { SalaryExplorer } from "./SalaryExplorer";
import { RemoteHeatmap } from "./RemoteHeatmap";

interface HomeClientProps {
  categories: CategoryCount[];
  initialRoles: TrendingRole[];
  initialCompanies: CompanyInfo[];
  recentlyViewed: RecentlyViewedJob[];
  skillDemand: SkillDemandItem[];
  topJob: Job | null;
  otherJobs: Job[];
  totalMatches: number;
  salarySnapshot: SalarySnapshotData;
  /** Server action to fetch filtered roles/companies */
  fetchCategoryData: (category: string) => Promise<{
    roles: TrendingRole[];
    companies: CompanyInfo[];
  }>;
}

export function HomeClient({
  categories,
  initialRoles,
  initialCompanies,
  recentlyViewed,
  skillDemand,
  topJob,
  otherJobs,
  totalMatches,
  salarySnapshot,
  fetchCategoryData,
}: HomeClientProps) {
  const router = useRouter();
  const firstWithJobs = categories.find((c) => c.count > 0);
  const [activeCategory, setActiveCategory] = useState(firstWithJobs?.id ?? categories[0]?.id ?? "tech_it");
  const [roles, setRoles] = useState<TrendingRole[]>(initialRoles);
  const [companies, setCompanies] = useState<CompanyInfo[]>(initialCompanies);
  const [isPending, startTransition] = useTransition();

  const handleJobSelect = useCallback(
    (job: Job) => router.push(`/jobs/${job.id}`),
    [router]
  );

  const activeCategoryName = categories.find((c) => c.id === activeCategory)?.name ?? "All";

  function handleCategoryChange(id: string) {
    setActiveCategory(id);
    startTransition(async () => {
      const data = await fetchCategoryData(id);
      setRoles(data.roles);
      setCompanies(data.companies);
    });
  }

  return (
    <div className="home-page">
      <TopMatchesPreview
        topJob={topJob}
        otherJobs={otherJobs}
        totalMatches={totalMatches}
        onJobSelect={handleJobSelect}
      />

      <CategoryBrowse
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />

      <div className="two-col">
        <div style={{ opacity: isPending ? 0.6 : 1, transition: "opacity .15s" }}>
          <TrendingRoles roles={roles} categoryName={activeCategoryName} />
          <CompaniesList companies={companies} categoryName={activeCategoryName} />
        </div>

        <div>
          <SkillsDemandSidebar skills={skillDemand} />
          <SalarySnapshotSidebar data={salarySnapshot} />
          <RecentlyViewedSidebar jobs={recentlyViewed} />
        </div>
      </div>

      <SalaryExplorer />
      <RemoteHeatmap />
    </div>
  );
}
