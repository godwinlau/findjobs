import type { SkillStructuredEntry } from "@/lib/skills/groq-extraction";

// ─── Types ───

export interface ScoringOptions {
  semanticScore?: number | null;
  profileHeadline?: string | null;
}

export interface MatchResult {
  score: number;           // 0-98
  scoreRange?: [number, number]; // uncertainty range when profile has missing dimensions
  highlight: string | null;
  matchedSkills?: string[];
  semanticScore?: number | null;
  penalty?: number;
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
  skills_structured?: SkillStructuredEntry[];
  posted_at: string;
}

export type SkillRelevance = "match" | "weakMatch" | "noData" | "mismatch";
