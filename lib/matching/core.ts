import { Profile } from "@/lib/types";
import { computeSkillMismatchPenalty, computeUnclassifiedJobPenalty } from "@/lib/role-gates";
import type { JobRow, ScoringOptions, MatchResult } from "./types";
import { normalizeSkill, inferSkillsFromHeadline, getEffectiveJobSkills } from "./skills";
import {
  scoreSkillMatch,
  scoreSkillProficiency,
  scoreExperienceFit,
  scoreLocationMatch,
  scoreSalaryAlignment,
  scoreEducationMatch,
} from "./dimensions";
import { computeClusterAffinities, computeClusterBoost } from "./cluster";
import { computeQualityScore, formatHighlight } from "./quality";
import {
  W_SKILL_MATCH,
  W_SKILL_PROFICIENCY,
  W_EXPERIENCE_FIT,
  W_LOCATION_MATCH,
  W_SALARY_ALIGNMENT,
  W_EDUCATION_MATCH,
} from "./constants";

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

// ─── Main scoring function ───

export function computeMatchScore(row: JobRow, profile: Profile | null, options?: ScoringOptions): MatchResult {
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

  // Title-only job: has a title but no JD and no extracted skills
  const isTitleOnly = (row.skills_required?.length ?? 0) === 0
    && (!row.description_plain || row.description_plain.length < 50);

  // Score each dimension (all return 0.0-1.0)
  const skillResult = scoreSkillMatch(effectiveJobSkills, augmentedProfileSkills, row.skills_structured);
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

  // Business rules weighted sum
  let businessRules =
    skillResult.score * W_SKILL_MATCH +
    proficiencyScore * W_SKILL_PROFICIENCY +
    experienceScore * W_EXPERIENCE_FIT +
    locationScore * W_LOCATION_MATCH +
    salaryScore * W_SALARY_ALIGNMENT +
    educationScore * W_EDUCATION_MATCH;

  // ── Relevance gate ──
  if (skillResult.relevance === "mismatch") {
    businessRules *= 0.3;
  } else if (skillResult.relevance === "weakMatch") {
    businessRules *= 0.55;
  } else if (skillResult.relevance === "noData") {
    // Title-only jobs with inferred skills get a softer penalty
    // (title inference found something to score against)
    businessRules *= (isTitleOnly && effectiveJobSkills.length > 0) ? 0.65 : 0.45;
  }

  // ── Cluster affinity boost (applied after relevance gate) ──
  const userAffinities = computeClusterAffinities(augmentedProfileSkills);
  const clusterBoost = computeClusterBoost(effectiveJobSkills, userAffinities);
  businessRules = businessRules + clusterBoost;

  // ── Blend semantic + business rules ──
  // When semantic is available: semantic(40%) + business(60%)
  // When not available: assume neutral semantic (0.5) so non-embedded jobs
  // don't have an unfair advantage over poorly-embedded ones.
  const semanticScore = options?.semanticScore ?? null;
  let total: number;
  if (semanticScore != null && semanticScore > 0) {
    total = semanticScore * 0.4 + businessRules * 0.6;
  } else {
    total = 0.5 * 0.4 + businessRules * 0.6;
  }

  // ── Negative signal penalty ──
  const profileHeadline = options?.profileHeadline ?? profile.headline;
  const penalty = computeSkillMismatchPenalty(profileHeadline ?? null, effectiveJobSkills);
  total = total - penalty;

  // ── Unclassified job demotion ──
  const unclassifiedPenalty = computeUnclassifiedJobPenalty(profileHeadline ?? null, row.title);
  total = total - unclassifiedPenalty / 100; // convert point penalty to 0-1 scale

  let rawScore = Math.round(total * 100);
  rawScore = Math.max(0, rawScore);
  rawScore = Math.min(rawScore, 98);

  // ── Uncertainty ranges for missing dimensions ──
  let missingDimensions = 0;
  if (row.salary_min === null && row.salary_max === null) missingDimensions++;
  if (!row.experience_level) missingDimensions++;
  if (!row.description_plain || row.description_plain.length < 50) missingDimensions++; // education can't be extracted
  if (!row.location_city && row.work_setup !== "remote") missingDimensions++;
  if (isTitleOnly) missingDimensions++; // extra uncertainty for title-only jobs

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

  return {
    score: rawScore,
    scoreRange,
    highlight,
    matchedSkills: skillResult.matched,
    semanticScore,
    penalty: penalty > 0 ? penalty : undefined,
  };
}
