import { Profile, ProfileEducationLevel, SkillProficiency } from "@/lib/types";
import { extractEducation, EducationLevel } from "@/lib/queries";
import { TITLE_SKILL_PATTERNS, SKILL_ALIASES } from "@/lib/constants/skill-mappings";
import { resolveSkillCluster } from "@/lib/constants/skillTaxonomy";

// ─── Types ───

export interface MatchResult {
  score: number;           // 0-98
  scoreRange?: [number, number]; // uncertainty range when profile has missing dimensions
  highlight: string | null;
  matchedSkills?: string[];
}

export const MATCH_SCORE_THRESHOLD = 40;

// Lightweight row shape for scoring
export interface JobRow {
  id: string;
  title: string;
  company_name?: string;
  company_verified?: boolean;
  description_plain?: string;
  salary_min: number | null;
  salary_max: number | null;
  salary_is_estimate?: boolean;
  location_city: string | null;
  location_area?: string | null;
  work_setup: string | null;
  job_type: string | null;
  experience_level: string | null;
  skills_required: string[];
  posted_at: string;
}

// ─── Profile sufficiency check ───

export function isProfileSufficient(profile: Profile | null): boolean {
  if (!profile) return false;

  let filled = 0;
  if (profile.skills && profile.skills.length > 0) filled++;
  if (profile.desired_salary_min !== null || profile.desired_salary_max !== null) filled++;
  if (profile.preferred_city) filled++;
  if (profile.work_preference && profile.work_preference !== "any") filled++;
  if (profile.employment_type && profile.employment_type !== "any") filled++;

  return filled >= 2;
}

// ─── Skill normalization ───

export function normalizeSkill(raw: string): string {
  const key = raw.toLowerCase().trim();
  return SKILL_ALIASES[key] ?? key;
}

// ─── Title-to-skills inference for profile headline ───

function inferSkillsFromHeadline(headline: string | null): string[] {
  if (!headline) return [];
  const lower = headline.toLowerCase();
  for (const { pattern, skills } of TITLE_SKILL_PATTERNS) {
    if (pattern.test(lower)) {
      return skills.map(normalizeSkill);
    }
  }
  return [];
}

// ─── Effective skill extraction ───

function getEffectiveJobSkills(row: JobRow, profileSkills: string[]): string[] {
  const existing = new Set(
    (row.skills_required ?? []).map((s) => normalizeSkill(s))
  );

  const titleLower = (row.title ?? "").toLowerCase();
  for (const { pattern, skills } of TITLE_SKILL_PATTERNS) {
    if (pattern.test(titleLower)) {
      for (const skill of skills) existing.add(normalizeSkill(skill));
      break;
    }
  }

  if (!profileSkills || profileSkills.length === 0) {
    return Array.from(existing);
  }

  const searchText = `${row.title ?? ""} ${row.description_plain ?? ""}`.toLowerCase();

  for (const skill of profileSkills) {
    const key = normalizeSkill(skill);
    if (existing.has(key)) continue;

    const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`\\b${escaped}\\b`);
    if (re.test(searchText)) {
      existing.add(key);
    }
  }

  return Array.from(existing);
}

// ─── Experience level → approximate years mapping ───

const EXP_TO_YEARS: Record<string, number> = {
  fresh_graduate: 0,
  entry: 0,
  less_than_1yr: 0.5,
  junior: 1.5,
  "1_to_3yr": 2,
  mid: 4,
  "3_to_5yr": 4,
  "5_to_10yr": 7,
  senior: 7,
  "10_plus": 12,
};

// ─── Proficiency level → numeric ───

const PROFICIENCY_LEVEL: Record<string, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
};

// ─── Education ordinals ───

const PROFILE_EDU_ORDINALS: Record<string, number> = {
  high_school: 0,
  vocational: 1,
  bachelors: 2,
  masters: 3,
  doctorate: 4,
};

const JOB_EDU_ORDINALS: Record<string, number> = {
  high_school: 0,
  associate: 1,
  bachelors: 2,
  masters: 3,
  doctorate: 4,
};

// ─── Dimension weights (sum = 1.0) ───

const W_SKILL_MATCH = 0.45;
const W_SKILL_PROFICIENCY = 0.15;
const W_EXPERIENCE_FIT = 0.15;
const W_LOCATION_MATCH = 0.10;
const W_SALARY_ALIGNMENT = 0.10;
const W_EDUCATION_MATCH = 0.05;

// ─── Cluster affinity scoring ───

/**
 * Compute user's affinity to each skill cluster based on their skills.
 * Returns a Map of clusterId → affinity (0.0-1.0).
 */
export function computeClusterAffinities(userSkills: string[]): Map<string, number> {
  const affinities = new Map<string, number>();
  if (!userSkills || userSkills.length === 0) return affinities;

  const normalizedSkills = userSkills.map((s) => normalizeSkill(s));
  const clusterCounts: Record<string, number> = {};

  for (const skill of normalizedSkills) {
    const clusterId = resolveSkillCluster(skill, normalizedSkills);
    if (clusterId) {
      clusterCounts[clusterId] = (clusterCounts[clusterId] ?? 0) + 1;
    }
  }

  const total = normalizedSkills.length;
  for (const [cluster, count] of Object.entries(clusterCounts)) {
    affinities.set(cluster, count / total);
  }

  return affinities;
}

/**
 * Compute cluster-based boost for a job based on user's cluster affinities.
 * Returns 0.0 to 0.15 boost value.
 */
function computeClusterBoost(
  jobSkills: string[],
  userAffinities: Map<string, number>,
): number {
  if (userAffinities.size === 0 || !jobSkills || jobSkills.length === 0) return 0;

  // Determine job's cluster distribution
  const jobClusterCounts: Record<string, number> = {};
  for (const skill of jobSkills) {
    const clusterId = resolveSkillCluster(normalizeSkill(skill), jobSkills.map(normalizeSkill));
    if (clusterId) {
      jobClusterCounts[clusterId] = (jobClusterCounts[clusterId] ?? 0) + 1;
    }
  }

  // Find job's primary cluster (most skills)
  let jobPrimary = "";
  let jobPrimaryCount = 0;
  const jobClusterIds: string[] = [];
  for (const [cluster, count] of Object.entries(jobClusterCounts)) {
    jobClusterIds.push(cluster);
    if (count > jobPrimaryCount) {
      jobPrimary = cluster;
      jobPrimaryCount = count;
    }
  }

  if (!jobPrimary) return 0;

  // Sort user affinities descending to find primary/secondary
  const sorted = Array.from(userAffinities.entries()).sort((a, b) => b[1] - a[1]);
  const userPrimary = sorted[0]?.[0];
  const userSecondary = sorted[1]?.[0];

  // "Unicorn job" — matches 2+ of user's clusters
  const userClusterIds = new Set(sorted.filter(([, v]) => v > 0).map(([k]) => k));
  const matchingClusters = jobClusterIds.filter((c) => userClusterIds.has(c));

  if (matchingClusters.length >= 2) return 0.12;
  if (jobPrimary === userPrimary) return 0.15;
  if (jobPrimary === userSecondary) return 0.08;

  return 0;
}

// ─── Main scoring function ───

export function computeMatchScore(row: JobRow, profile: Profile | null): MatchResult {
  if (!profile || !isProfileSufficient(profile)) {
    return {
      score: computeQualityScore(row),
      highlight: formatHighlight(row.skills_required),
    };
  }

  // Augment profile skills with headline-inferred skills
  const headlineSkills = inferSkillsFromHeadline(profile.headline);
  const augmentedProfileSkills = Array.from(
    new Set([
      ...profile.skills.map(normalizeSkill),
      ...headlineSkills,
    ])
  );

  const effectiveJobSkills = getEffectiveJobSkills(row, augmentedProfileSkills);

  // Score each dimension (all return 0.0-1.0)
  const skillResult = scoreSkillMatch(effectiveJobSkills, augmentedProfileSkills);
  const proficiencyScore = scoreSkillProficiency(
    effectiveJobSkills, augmentedProfileSkills,
    profile.skill_proficiencies ?? {}, row.experience_level
  );
  const experienceScore = scoreExperienceFit(row.experience_level, profile.experience_level);
  const locationScore = scoreLocationMatch(
    row.location_city, row.work_setup,
    profile.preferred_city, profile.willing_to_relocate ?? false
  );
  const salaryScore = scoreSalaryAlignment(
    row.salary_min, row.salary_max,
    profile.desired_salary_min, profile.desired_salary_max
  );
  const educationScore = scoreEducationMatch(row.description_plain, profile.education);

  // Weighted sum
  let total =
    skillResult.score * W_SKILL_MATCH +
    proficiencyScore * W_SKILL_PROFICIENCY +
    experienceScore * W_EXPERIENCE_FIT +
    locationScore * W_LOCATION_MATCH +
    salaryScore * W_SALARY_ALIGNMENT +
    educationScore * W_EDUCATION_MATCH;

  // ── Relevance gate ──
  if (skillResult.relevance === "mismatch") {
    total *= 0.3;
  } else if (skillResult.relevance === "weakMatch") {
    total *= 0.55;
  } else if (skillResult.relevance === "noData") {
    total *= 0.45;
  }

  // ── Cluster affinity boost (applied after relevance gate) ──
  const userAffinities = computeClusterAffinities(augmentedProfileSkills);
  const clusterBoost = computeClusterBoost(effectiveJobSkills, userAffinities);
  total = total + clusterBoost;

  let rawScore = Math.round(total * 100);
  rawScore = Math.min(rawScore, 98);

  // ── Uncertainty ranges for missing dimensions ──
  let missingDimensions = 0;
  if (row.salary_min === null && row.salary_max === null) missingDimensions++;
  if (!row.experience_level) missingDimensions++;
  if (!row.description_plain) missingDimensions++; // education can't be extracted
  if (!row.location_city && row.work_setup !== "remote") missingDimensions++;

  let scoreRange: [number, number] | undefined;
  if (missingDimensions > 0) {
    const uncertainty = missingDimensions * 5;
    scoreRange = [
      Math.max(0, rawScore - uncertainty),
      Math.min(98, rawScore + uncertainty),
    ];
  }

  // Generate highlight
  const highlight = skillResult.reason ?? formatHighlight(row.skills_required);

  return { score: rawScore, scoreRange, highlight, matchedSkills: skillResult.matched };
}

// ─── Dimension scorers (all return 0.0-1.0) ───

type SkillRelevance = "match" | "weakMatch" | "noData" | "mismatch";

function scoreSkillMatch(
  jobSkills: string[],
  profileSkills: string[]
): { score: number; reason: string | null; relevance: SkillRelevance; matched: string[] } {
  const jLen = jobSkills?.length ?? 0;
  const pLen = profileSkills?.length ?? 0;

  if (jLen === 0 && pLen === 0) {
    return { score: 0.5, reason: null, relevance: "match", matched: [] };
  }

  if (jLen === 0 && pLen > 0) {
    return { score: 0.1, reason: null, relevance: "noData", matched: [] };
  }

  if (pLen === 0) {
    return { score: 0.2, reason: null, relevance: "match", matched: [] };
  }

  const jobSet = new Set(jobSkills.map((s) => normalizeSkill(s)));
  const profileSet = new Set(profileSkills.map((s) => normalizeSkill(s)));

  let overlapCount = 0;
  const matchedSkills: string[] = [];

  for (const skill of profileSet) {
    if (jobSet.has(skill)) {
      overlapCount++;
      matchedSkills.push(skill);
    }
  }

  if (overlapCount === 0) {
    return { score: 0, reason: null, relevance: "mismatch", matched: [] };
  }

  // MVP: all skills count as required → matched / total_required
  const score = overlapCount / jobSet.size;

  const overlapRatio = overlapCount / Math.max(pLen, jLen);
  const relevance: SkillRelevance =
    overlapCount === 1 && overlapRatio < 0.25 ? "weakMatch" : "match";

  // Proper-case display names
  const displayNames = matchedSkills.map((s) => s.charAt(0).toUpperCase() + s.slice(1));

  let reason: string | null = null;
  if (overlapCount <= 2) {
    reason = `Matches your ${displayNames.join(" & ")} skills`;
  } else {
    reason = `${overlapCount} of your skills match`;
  }

  return { score: Math.min(score, 1.0), reason, relevance, matched: displayNames };
}

function scoreSkillProficiency(
  jobSkills: string[],
  profileSkills: string[],
  proficiencies: Record<string, SkillProficiency>,
  jobExpLevel: string | null,
): number {
  if (!jobSkills || jobSkills.length === 0 || !profileSkills || profileSkills.length === 0) {
    return 0.5; // neutral
  }

  // Infer required proficiency from job's experience level
  const reqLevel = jobExpLevel
    ? (EXP_TO_YEARS[jobExpLevel.toLowerCase()] ?? 2) <= 1 ? 1
      : (EXP_TO_YEARS[jobExpLevel.toLowerCase()] ?? 2) <= 4 ? 2
      : 3
    : 2; // default mid

  const jobSet = new Set(jobSkills.map(normalizeSkill));
  const profileSet = new Set(profileSkills.map(normalizeSkill));

  let totalRatio = 0;
  let matchCount = 0;

  for (const skill of jobSet) {
    if (!profileSet.has(skill)) continue;
    matchCount++;

    const userLevel = PROFICIENCY_LEVEL[proficiencies[skill] ?? "intermediate"] ?? 2;
    totalRatio += Math.min(userLevel / reqLevel, 1.0);
  }

  if (matchCount === 0) return 0.5; // no overlapping skills to rate
  return totalRatio / matchCount;
}

function scoreExperienceFit(jobExp: string | null, profileExp: string | null): number {
  if (!jobExp) return 0.5;
  if (!profileExp) return 0.5;

  const reqYears = EXP_TO_YEARS[jobExp.toLowerCase()] ?? -1;
  const userYears = EXP_TO_YEARS[profileExp.toLowerCase()] ?? -1;

  if (reqYears < 0 || userYears < 0) return 0.5;

  // Diminishing returns via log curve
  if (reqYears === 0) return userYears === 0 ? 1.0 : 0.8;
  return Math.min(Math.log(1 + userYears) / Math.log(1 + reqYears), 1.0);
}

function scoreLocationMatch(
  jobCity: string | null,
  workSetup: string | null,
  profileCity: string | null,
  willingToRelocate: boolean,
): number {
  // Remote job → full match
  if (workSetup === "remote") return 1.0;

  if (!jobCity) return 0.5; // neutral
  if (!profileCity) return 0.5;

  const jCity = jobCity.toLowerCase().trim();
  const pCity = profileCity.toLowerCase().trim();

  if (jCity === pCity || jCity.includes(pCity) || pCity.includes(jCity)) {
    return 1.0;
  }

  // Willing to relocate → partial credit
  if (willingToRelocate) return 0.5;

  return 0;
}

function scoreSalaryAlignment(
  jobMin: number | null,
  jobMax: number | null,
  profileMin: number | null,
  profileMax: number | null,
): number {
  const jobHasSalary = jobMin !== null || jobMax !== null;
  const profileHasSalary = profileMin !== null || profileMax !== null;

  if (!jobHasSalary) return 0.5; // neutral
  if (!profileHasSalary) return 0.5;

  const jMin = jobMin ?? 0;
  const jMax = jobMax ?? jMin;
  const pMin = profileMin ?? 0;
  const pMax = profileMax ?? pMin;

  const userWidth = Math.max(pMax - pMin, 1);

  // Calculate overlap
  const overlapStart = Math.max(jMin, pMin);
  const overlapEnd = Math.min(jMax, pMax);
  const overlap = Math.max(0, overlapEnd - overlapStart);

  return Math.min(overlap / userWidth, 1.0);
}

function scoreEducationMatch(
  descriptionPlain: string | undefined,
  profileEdu: ProfileEducationLevel | null,
): number {
  if (!descriptionPlain) return 0.5;
  const jobEdu: EducationLevel = extractEducation(descriptionPlain);

  if (!jobEdu) return 0.5;
  if (!profileEdu) return 0.5;

  const jOrd = JOB_EDU_ORDINALS[jobEdu] ?? -1;
  const pOrd = PROFILE_EDU_ORDINALS[profileEdu] ?? -1;

  if (jOrd === -1 || pOrd === -1) return 0.5;

  if (pOrd >= jOrd) return 1.0;       // meets or exceeds
  if (pOrd === jOrd - 1) return 0.5;  // one level below
  return 0;
}

// ─── Quality score (fallback for sparse profiles) ───

export function computeQualityScore(row: JobRow): number {
  let score = 50;

  if (row.salary_min || row.salary_max) score += 15;
  if (row.skills_required.length > 0) score += 10;
  if (row.skills_required.length >= 3) score += 5;
  if (row.description_plain && row.description_plain.length > 200) score += 5;
  if (row.company_verified) score += 5;
  if (row.location_city) score += 5;
  if (row.work_setup) score += 3;
  if (row.job_type) score += 2;

  const hoursSincePosted = (Date.now() - new Date(row.posted_at).getTime()) / 3600000;
  if (hoursSincePosted < 24) score += 5;
  else if (hoursSincePosted < 72) score += 2;

  return Math.min(score, 98);
}

// ─── Highlight formatter (fallback) ───

export function formatHighlight(skills: string[]): string | null {
  if (!skills || skills.length === 0) return null;
  if (skills.length === 1) return `Requires ${skills[0]}`;
  return `${skills.length} skills listed for this role`;
}
