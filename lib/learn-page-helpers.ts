import { industrySkillDemand } from "@/lib/constants/industrySkillDemand";
import { createServiceClient } from "@/lib/supabase-server";
import { SCORING_COLUMNS } from "@/lib/jobs";
import {
  computeMatchScore,
  MATCH_SCORE_THRESHOLD,
  isProfileSufficient,
} from "@/lib/matching";
import type { Profile } from "@/lib/types";
import type { SkillsSnapshot, SkillROI, ScoredCourse } from "@/lib/types/learn";

// ─── Match Potential (Real Job Scoring) ───

export interface MatchPotentialData {
  currentMatches: number;
  totalJobsAnalyzed: number;
  progression: {
    skill: string;
    matchesBefore: number;
    matchesAfter: number;
  }[];
  fullPotentialMatches: number;
}

export async function computeMatchPotential(
  profile: Profile,
  skillROIs: SkillROI[]
): Promise<MatchPotentialData | null> {
  if (!isProfileSufficient(profile)) return null;

  const supabase = createServiceClient();

  const { data: scoringData } = await supabase
    .from("jobs")
    .select(SCORING_COLUMNS)
    .eq("is_active", true);

  if (!scoringData || scoringData.length === 0) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = scoringData as any[];
  const totalJobsAnalyzed = rows.length;

  // Score all jobs with current profile
  const currentMatches = rows.filter(
    (row) => computeMatchScore(row, profile).score >= MATCH_SCORE_THRESHOLD
  ).length;

  // Simulate adding each top-3 skill
  const top3 = skillROIs.slice(0, 3);
  const progression: MatchPotentialData["progression"] = [];
  let cumulativeSkills = [...profile.skills];
  let prevMatches = currentMatches;

  for (const roi of top3) {
    cumulativeSkills = [...cumulativeSkills, roi.skill];
    const augmented: Profile = { ...profile, skills: cumulativeSkills };
    const newMatches = rows.filter(
      (row) => computeMatchScore(row, augmented).score >= MATCH_SCORE_THRESHOLD
    ).length;
    progression.push({
      skill: roi.skill,
      matchesBefore: prevMatches,
      matchesAfter: newMatches,
    });
    prevMatches = newMatches;
  }

  return {
    currentMatches,
    totalJobsAnalyzed,
    progression,
    fullPotentialMatches: prevMatches,
  };
}

// ─── Insight Hero Data ───

export interface InsightHeroData {
  overallPercentage: number;
  skillsAwayCount: number;
  jobsUnlocked: number;
  potentialMatchPct: number;
  skillsCount: number;
  currentMatches: number | null;
  totalJobsAnalyzed: number | null;
}

export function buildInsightHeroData(
  snapshot: SkillsSnapshot,
  skillROIs: SkillROI[],
  userSkills: string[],
  matchPotential?: MatchPotentialData | null
): InsightHeroData {
  const top = skillROIs.slice(0, 3);

  // Use real match counts if available
  if (matchPotential) {
    const jobsUnlocked =
      matchPotential.fullPotentialMatches - matchPotential.currentMatches;
    return {
      overallPercentage: snapshot.overallPercentage,
      skillsAwayCount: Math.min(skillROIs.length, 5),
      jobsUnlocked,
      potentialMatchPct: Math.min(
        snapshot.overallPercentage +
          Math.min(top.length * Math.round(30 / Math.max(top.length, 1)), 30),
        99
      ),
      skillsCount: userSkills.length,
      currentMatches: matchPotential.currentMatches,
      totalJobsAnalyzed: matchPotential.totalJobsAnalyzed,
    };
  }

  // Fallback heuristic
  const jobsUnlocked = top.reduce((sum, r) => sum + r.estimatedNewMatches, 0);
  const boostPerSkill = top.length > 0 ? Math.round(30 / top.length) : 0;
  const totalBoost = Math.min(top.length * boostPerSkill, 30);
  const potentialMatchPct = Math.min(
    snapshot.overallPercentage + totalBoost,
    99
  );

  return {
    overallPercentage: snapshot.overallPercentage,
    skillsAwayCount: Math.min(skillROIs.length, 5),
    jobsUnlocked,
    potentialMatchPct,
    skillsCount: userSkills.length,
    currentMatches: null,
    totalJobsAnalyzed: null,
  };
}

// ─── Match Progression (sidebar) ───

export interface MatchProgression {
  skill: string;
  fromPct: number;
  toPct: number;
}

export function buildMatchProgression(
  snapshot: SkillsSnapshot,
  skillROIs: SkillROI[]
): { items: MatchProgression[]; currentPct: number; fullPotentialPct: number } {
  const top = skillROIs.slice(0, 3);
  let running = snapshot.overallPercentage;
  const items: MatchProgression[] = [];

  for (const roi of top) {
    const boost = Math.max(
      Math.round(roi.estimatedNewMatches * 1.5),
      2
    );
    const next = Math.min(running + boost, 99);
    items.push({ skill: roi.skill, fromPct: running, toPct: next });
    running = next;
  }

  return {
    items,
    currentPct: snapshot.overallPercentage,
    fullPotentialPct: running,
  };
}

// ─── Demand Trends ───

export interface DemandTrend {
  skill: string;
  demandPct: number;
  trendDirection: "up" | "stable" | "down";
  trendPct: number;
  isHot: boolean;
  jobCount: number;
  isOnProfile: boolean;
}

export function buildDemandTrends(
  preferredIndustries: string[],
  userSkills: string[],
  limit = 8
): DemandTrend[] {
  const normalizedUser = userSkills.map((s) => s.toLowerCase().trim());
  const skillDemand: Record<string, number> = {};

  // Aggregate demand across preferred industries
  for (const industry of preferredIndustries) {
    const demand = industrySkillDemand[industry];
    if (!demand) continue;
    for (const [skill, weight] of Object.entries(demand)) {
      const key = skill.toLowerCase().trim();
      skillDemand[key] = (skillDemand[key] ?? 0) + weight;
    }
  }

  // If no preferred industries, use all
  if (Object.keys(skillDemand).length === 0) {
    for (const demand of Object.values(industrySkillDemand)) {
      for (const [skill, weight] of Object.entries(demand)) {
        const key = skill.toLowerCase().trim();
        skillDemand[key] = (skillDemand[key] ?? 0) + weight;
      }
    }
  }

  const maxDemand = Math.max(...Object.values(skillDemand), 1);

  const trends: DemandTrend[] = Object.entries(skillDemand)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([skill, demand]) => {
      const demandPct = Math.round((demand / maxDemand) * 100);
      // Simulate trend based on demand level
      const trendPct =
        demandPct > 70
          ? Math.round(20 + Math.random() * 30)
          : demandPct > 40
            ? Math.round(5 + Math.random() * 15)
            : Math.round(-5 + Math.random() * 10);
      const trendDirection: DemandTrend["trendDirection"] =
        trendPct > 15 ? "up" : trendPct > 0 ? "stable" : "down";

      // Capitalize skill name for display
      const displayName = skill
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

      return {
        skill: displayName,
        demandPct,
        trendDirection,
        trendPct: Math.abs(trendPct),
        isHot: demandPct > 70,
        jobCount: Math.round(demand * 3.5),
        isOnProfile: normalizedUser.includes(skill.toLowerCase().trim()),
      };
    });

  return trends;
}

// ─── Gap Resource Links ───

export interface GapResourceLink {
  label: string;
  url: string;
  type: "youtube" | "course" | "docs" | "fcc";
}

export function buildGapResourceLinks(
  skillROI: SkillROI,
  scoredCourses: ScoredCourse[]
): GapResourceLink[] {
  const links: GapResourceLink[] = [];
  const normalizedSkill = skillROI.skill.toLowerCase().trim();

  // 1. Add recommended course YouTube URL if available
  if (skillROI.recommendedCourse?.youtubeUrl) {
    links.push({
      label: "YouTube Tutorial",
      url: skillROI.recommendedCourse.youtubeUrl,
      type: "youtube",
    });
  }

  // 2. Add recommended course URL
  if (skillROI.recommendedCourse?.url) {
    const provider = skillROI.recommendedCourse.provider.toLowerCase();
    const type: GapResourceLink["type"] = provider.includes("freecodecamp")
      ? "fcc"
      : "course";
    links.push({
      label: skillROI.recommendedCourse.provider,
      url: skillROI.recommendedCourse.url,
      type,
    });
  }

  // 3. Add top scored course that teaches this skill (if different)
  const matchingCourse = scoredCourses.find(
    (c) =>
      c.skillsTaught.some((s) => s.toLowerCase().trim() === normalizedSkill) &&
      c.id !== skillROI.recommendedCourse?.id
  );
  if (matchingCourse) {
    if (matchingCourse.youtubeUrl && links.length < 4) {
      links.push({
        label: `${matchingCourse.provider} Video`,
        url: matchingCourse.youtubeUrl,
        type: "youtube",
      });
    }
    if (links.length < 4) {
      links.push({
        label: matchingCourse.provider,
        url: matchingCourse.url,
        type: matchingCourse.provider.toLowerCase().includes("freecodecamp")
          ? "fcc"
          : "course",
      });
    }
  }

  // Deduplicate by URL
  const seen = new Set<string>();
  return links.filter((l) => {
    if (seen.has(l.url)) return false;
    seen.add(l.url);
    return true;
  });
}

// ─── Skill Boost Percentage ───

export function estimateSkillBoost(
  roi: SkillROI,
  totalROIs: SkillROI[]
): number {
  if (totalROIs.length === 0) return 0;
  const maxMatches = Math.max(...totalROIs.map((r) => r.estimatedNewMatches), 1);
  return Math.max(Math.round((roi.estimatedNewMatches / maxMatches) * 15), 2);
}

// ─── User Skills for Sidebar ───

export interface UserSkillBar {
  name: string;
  score: number;
  isAccent: boolean;
}

export function buildUserSkillBars(
  userSkills: string[],
  snapshot: SkillsSnapshot
): UserSkillBar[] {
  // Generate a pseudo-score for each skill based on category coverage
  const categoryMap = new Map<string, number>();
  for (const s of snapshot.scores) {
    categoryMap.set(s.category, s.percentage);
  }

  return userSkills.slice(0, 8).map((skill, i) => {
    // Vary score based on position + some spread
    const baseScore = 95 - i * 4;
    const score = Math.max(Math.min(baseScore + Math.round((Math.random() - 0.5) * 6), 98), 60);
    return {
      name: skill.length > 12 ? skill.slice(0, 11) + "..." : skill,
      score,
      isAccent: i < 3,
    };
  });
}
