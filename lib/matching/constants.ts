// ─── Experience level → approximate years mapping ───

export const EXP_TO_YEARS: Record<string, number> = {
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

export const PROFICIENCY_LEVEL: Record<string, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
};

// ─── Education ordinals ───

export const PROFILE_EDU_ORDINALS: Record<string, number> = {
  high_school: 0,
  vocational: 1,
  bachelors: 2,
  masters: 3,
  doctorate: 4,
};

export const JOB_EDU_ORDINALS: Record<string, number> = {
  high_school: 0,
  associate: 1,
  bachelors: 2,
  masters: 3,
  doctorate: 4,
};

// ─── Dimension weights (sum = 1.0) ───

export const W_SKILL_MATCH = 0.45;
export const W_SKILL_PROFICIENCY = 0.15;
export const W_EXPERIENCE_FIT = 0.15;
export const W_LOCATION_MATCH = 0.10;
export const W_SALARY_ALIGNMENT = 0.10;
export const W_EDUCATION_MATCH = 0.05;

// ─── Importance weights for structured skill scoring ───

export const IMPORTANCE_WEIGHT: Record<string, number> = {
  core: 3.0,
  important: 2.0,
  nice_to_have: 1.0,
};
