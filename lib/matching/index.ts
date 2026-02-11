// Barrel file — re-exports all matching module components.
// Existing imports from "@/lib/matching" continue to work unchanged.

export { computeMatchScore, isProfileSufficient } from "./core";
export { normalizeSkill, inferSkillsFromHeadline, getEffectiveJobSkills } from "./skills";
export {
  scoreSkillMatch,
  scoreSkillProficiency,
  scoreExperienceFit,
  scoreLocationMatch,
  scoreSalaryAlignment,
  scoreEducationMatch,
} from "./dimensions";
export { computeClusterAffinities, computeClusterBoost } from "./cluster";
export { computeQualityScore, formatHighlight } from "./quality";
export {
  EXP_TO_YEARS,
  PROFICIENCY_LEVEL,
  PROFILE_EDU_ORDINALS,
  JOB_EDU_ORDINALS,
  W_SKILL_MATCH,
  W_SKILL_PROFICIENCY,
  W_EXPERIENCE_FIT,
  W_LOCATION_MATCH,
  W_SALARY_ALIGNMENT,
  W_EDUCATION_MATCH,
  IMPORTANCE_WEIGHT,
} from "./constants";
export type { ScoringOptions, MatchResult, JobRow, SkillRelevance } from "./types";
export { MATCH_SCORE_THRESHOLD } from "./types";
