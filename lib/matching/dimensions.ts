import { ProfileEducationLevel, SkillProficiency } from "@/lib/types";
import { extractEducation, EducationLevel } from "@/lib/queries";
import type { SkillStructuredEntry } from "@/lib/skills/groq-extraction";
import type { SkillRelevance } from "./types";
import { normalizeSkill } from "./skills";
import {
  EXP_TO_YEARS,
  PROFICIENCY_LEVEL,
  PROFILE_EDU_ORDINALS,
  JOB_EDU_ORDINALS,
  IMPORTANCE_WEIGHT,
} from "./constants";

// ─── Dimension scorers (all return 0.0-1.0) ───

export function scoreSkillMatch(
  jobSkills: string[],
  profileSkills: string[],
  skillsStructured?: SkillStructuredEntry[],
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

  const profileSet = new Set(profileSkills.map((s) => normalizeSkill(s)));

  // ── Weighted scoring path (when structured data exists) ──
  if (skillsStructured && skillsStructured.length > 0) {
    let totalWeight = 0;
    let matchedWeight = 0;
    let coreMatches = 0;
    let totalCore = 0;
    const matchedSkills: string[] = [];

    for (const entry of skillsStructured) {
      const weight = (IMPORTANCE_WEIGHT[entry.importance] ?? 2.0) * entry.confidence;
      totalWeight += weight;

      if (entry.importance === "core") totalCore++;

      const normalized = normalizeSkill(entry.label);
      if (profileSet.has(normalized)) {
        matchedWeight += weight;
        matchedSkills.push(entry.label);
        if (entry.importance === "core") coreMatches++;
      }
    }

    if (totalWeight === 0) {
      return { score: 0.5, reason: null, relevance: "match", matched: [] };
    }

    const score = matchedWeight / totalWeight;
    const weightedRatio = matchedWeight / totalWeight;

    // Relevance gate based on weighted match
    let relevance: SkillRelevance;
    if (weightedRatio < 0.1 && coreMatches === 0) {
      relevance = "mismatch";
    } else if (weightedRatio < 0.25 || (totalCore > 0 && coreMatches === 0)) {
      relevance = "weakMatch";
    } else {
      relevance = "match";
    }

    const displayNames = matchedSkills.map((s) => s.charAt(0).toUpperCase() + s.slice(1));

    let reason: string | null = null;
    if (matchedSkills.length === 0) {
      reason = null;
    } else if (matchedSkills.length <= 2) {
      reason = `Matches your ${displayNames.join(" & ")} skills`;
    } else {
      reason = `${matchedSkills.length} of your skills match`;
    }

    return { score: Math.min(score, 1.0), reason, relevance, matched: displayNames };
  }

  // ── Fallback: unweighted overlap (backward compatible) ──
  const jobSet = new Set(jobSkills.map((s) => normalizeSkill(s)));

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

export function scoreSkillProficiency(
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

  // Build normalized proficiency map — proficiencies is keyed by original
  // user-selected name, but we compare against normalized keys
  const normProf: Record<string, SkillProficiency> = {};
  for (const [k, v] of Object.entries(proficiencies)) {
    normProf[normalizeSkill(k)] = v;
  }

  let totalRatio = 0;
  let matchCount = 0;

  for (const skill of jobSet) {
    if (!profileSet.has(skill)) continue;
    matchCount++;

    const userLevel = PROFICIENCY_LEVEL[normProf[skill] ?? "intermediate"] ?? 2;
    totalRatio += Math.min(userLevel / reqLevel, 1.0);
  }

  if (matchCount === 0) return 0.5; // no overlapping skills to rate
  return totalRatio / matchCount;
}

export function scoreExperienceFit(jobExp: string | null, profileExp: string | null): number {
  if (!jobExp) return 0.5;
  if (!profileExp) return 0.5;

  const reqYears = EXP_TO_YEARS[jobExp.toLowerCase()] ?? -1;
  const userYears = EXP_TO_YEARS[profileExp.toLowerCase()] ?? -1;

  if (reqYears < 0 || userYears < 0) return 0.5;

  // Diminishing returns via log curve
  if (reqYears === 0) return userYears === 0 ? 1.0 : 0.8;
  return Math.min(Math.log(1 + userYears) / Math.log(1 + reqYears), 1.0);
}

export function scoreLocationMatch(
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

export function scoreSalaryAlignment(
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

export function scoreEducationMatch(
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
