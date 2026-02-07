import { industrySkillDemand } from "@/lib/constants/industrySkillDemand";
import type { SkillsSnapshot, SkillROI, ScoredCourse } from "@/lib/types/learn";

// ─── Insight Hero Data ───

export interface InsightHeroData {
  overallPercentage: number;
  skillsAwayCount: number;
  jobsUnlocked: number;
  potentialMatchPct: number;
  skillsCount: number;
}

export function buildInsightHeroData(
  snapshot: SkillsSnapshot,
  skillROIs: SkillROI[],
  userSkills: string[]
): InsightHeroData {
  const top = skillROIs.slice(0, 3);
  const jobsUnlocked = top.reduce((sum, r) => sum + r.estimatedNewMatches, 0);
  // Estimate boost: each top skill adds ~3-5% match improvement
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
