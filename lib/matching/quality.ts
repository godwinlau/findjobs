import type { JobRow } from "./types";

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
