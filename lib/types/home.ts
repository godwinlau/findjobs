// Home page type definitions

export interface TrendingRole {
  title: string;
  openCount: number;
  salaryRange: string;
  growthPercent: number;
  barHeights: number[]; // 6 values, 0-100
}

export interface CompanyInfo {
  name: string;
  industry: string;
  location: string;
  size: string;
  logoUrl: string | null;
  openJobs: number;
  rating: number;
}

export interface RecentlyViewedJob {
  jobId: string;
  title: string;
  company: string;
  viewedAt: string; // relative time like "2h ago"
}

export interface SkillDemandItem {
  skill: string;
  demandPercent: number; // 0-100
  label: "High" | "Med" | "Low";
}

export interface CategoryCount {
  id: string;
  name: string;
  icon: string;
  count: number;
}
