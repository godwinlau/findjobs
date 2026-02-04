import { Profile, ProfileEducationLevel } from "@/lib/types";
import { extractEducation, EducationLevel } from "@/lib/queries";
import { TITLE_SKILL_PATTERNS, SKILL_ALIASES } from "@/lib/constants/skill-mappings";

// ─── Types ───

export interface MatchResult {
  score: number;           // 0-98
  highlight: string | null;
}

export const MATCH_SCORE_THRESHOLD = 40;

// Lightweight row shape for scoring — description_plain is optional so we
// can score using only structured columns (fast bulk query), then fetch
// text-heavy columns only for the page slice.
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
// Resolves common aliases (e.g. "reactjs" → "react", "js" → "javascript")
// so naming variations don't block matches.

function normalizeSkill(raw: string): string {
  const key = raw.toLowerCase().trim();
  return SKILL_ALIASES[key] ?? key;
}

// ─── Title-to-skills inference for profile headline ───
// Extracts implied skills from the user's headline (e.g. "Frontend Developer"
// → html, css, javascript) to augment their explicit skill selections.

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
// At match time, scan the job description + title for the user's specific
// skills. This catches matches that ingestion-time extraction missed
// (different phrasing, short descriptions, scrape failures).
// Merged with the pre-extracted skills_required for a fuller picture.

function getEffectiveJobSkills(row: JobRow, profileSkills: string[]): string[] {
  const existing = new Set(
    (row.skills_required ?? []).map((s) => normalizeSkill(s))
  );

  // Title-to-skills inference: match title against known role patterns
  // to infer implied skills (e.g. "Frontend Engineer" → html, css, javascript…)
  const titleLower = (row.title ?? "").toLowerCase();
  for (const { pattern, skills } of TITLE_SKILL_PATTERNS) {
    if (pattern.test(titleLower)) {
      for (const skill of skills) existing.add(normalizeSkill(skill));
      break; // first match wins
    }
  }

  if (!profileSkills || profileSkills.length === 0) {
    return Array.from(existing);
  }

  // Search title (always available) + description (when available) for
  // the user's skills. In the lightweight scoring pass description_plain
  // is omitted, so we fall back to title-only scanning — still catches
  // e.g. "React Developer" for a user with "react" skill.
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

// ─── Main scoring function ───

export function computeMatchScore(row: JobRow, profile: Profile | null): MatchResult {
  if (!profile || !isProfileSufficient(profile)) {
    return {
      score: computeQualityScore(row),
      highlight: formatHighlight(row.skills_required),
    };
  }

  let total = 0;
  let bestReason: { type: string; value: string; points: number } | null = null;

  // Augment profile skills with headline-inferred skills (deduplicated)
  const headlineSkills = inferSkillsFromHeadline(profile.headline);
  const augmentedProfileSkills = Array.from(
    new Set([
      ...profile.skills.map(normalizeSkill),
      ...headlineSkills,
    ])
  );

  // Build effective skill set: skills_required + title inference + description scan
  const effectiveJobSkills = getEffectiveJobSkills(row, augmentedProfileSkills);

  // 1. Skills (max 30)
  const skillPts = scoreSkills(effectiveJobSkills, augmentedProfileSkills);
  total += skillPts.points;
  if (skillPts.reason) {
    bestReason = { type: "skills", value: skillPts.reason, points: skillPts.points };
  }

  // 2. Salary (max 20)
  const salaryPts = scoreSalary(row.salary_min, row.salary_max, profile.desired_salary_min, profile.desired_salary_max);
  total += salaryPts.points;
  if (salaryPts.points >= 16 && (!bestReason || salaryPts.points > bestReason.points)) {
    bestReason = { type: "salary", value: "Within your salary range", points: salaryPts.points };
  }

  // 3. Location (max 15)
  const locPts = scoreLocation(row.location_city, row.work_setup, profile.preferred_city);
  total += locPts.points;
  if (locPts.reason && (!bestReason || locPts.points > bestReason.points)) {
    bestReason = { type: "location", value: locPts.reason, points: locPts.points };
  }

  // 4. Work setup (max 10)
  total += scoreWorkSetup(row.work_setup, profile.work_preference);

  // 5. Job type (max 10)
  total += scoreJobType(row.job_type, profile.employment_type);

  // 6. Experience (max 10)
  total += scoreExperience(row.experience_level, profile.experience_level);

  // 7. Education (max 5)
  total += scoreEducation(row.description_plain, profile.education);

  // 8. Recency (max 3)
  total += scoreRecency(row.posted_at);

  // 9. Listing quality (max 2)
  total += scoreListingQuality(row);

  // ── Relevance gate ──
  // Skills are the primary signal for "is this job in my field?"
  // When skills don't match, dampen the total so logistics (salary, city)
  // can't push an irrelevant job to the top.
  if (skillPts.relevance === "mismatch") {
    // Both sides have skills, zero overlap → wrong field (nurse vs developer)
    total = Math.round(total * 0.3);
  } else if (skillPts.relevance === "weakMatch") {
    // Only 1 generic skill overlaps (e.g. "google workspace" shared between
    // a web dev profile and an admin job) → dampen so logistics alone can't
    // push an irrelevant job above the threshold
    total = Math.round(total * 0.55);
  } else if (skillPts.relevance === "noData") {
    // User has skills but job has none even after description scan →
    // likely irrelevant (Service Driver for a web developer)
    total = Math.round(total * 0.45);
  }

  const score = Math.min(total, 98);

  // Generate highlight
  const highlight = bestReason?.value
    ?? formatHighlight(row.skills_required);

  return { score, highlight };
}

// ─── Dimension scorers ───

// Skill relevance tiers used to dampen the total score:
// - "match"    → normal scoring, skills overlap
// - "noData"   → job has no skills even after description scan; dampen moderately
// - "mismatch" → both sides have skills, zero overlap; dampen heavily
type SkillRelevance = "match" | "weakMatch" | "noData" | "mismatch";

function scoreSkills(
  jobSkills: string[],
  profileSkills: string[]
): { points: number; reason: string | null; relevance: SkillRelevance } {
  const jLen = jobSkills?.length ?? 0;
  const pLen = profileSkills?.length ?? 0;

  // Neither side has skills → neutral
  if (jLen === 0 && pLen === 0) {
    return { points: 15, reason: null, relevance: "match" };
  }

  // User has skills but job has none (even after description scan) →
  // likely a completely different field. Award minimal points and flag.
  if (jLen === 0 && pLen > 0) {
    return { points: 2, reason: null, relevance: "noData" };
  }

  // Job has skills but user doesn't → shouldn't reach here (profile check),
  // but handle gracefully
  if (pLen === 0) {
    return { points: 5, reason: null, relevance: "match" };
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

  // Both sides have skills but ZERO overlap → wrong field entirely
  if (overlapCount === 0) {
    return { points: 0, reason: null, relevance: "mismatch" };
  }

  const denom = Math.max(pLen, jLen);
  const points = Math.round((overlapCount / denom) * 30);

  // Weak match: only 1 skill overlaps and it's a small fraction of both sets.
  // A single generic skill (e.g. "google workspace") shared between a web dev
  // and an admin job shouldn't override the relevance gate entirely.
  const overlapRatio = overlapCount / denom;
  const relevance: SkillRelevance =
    overlapCount === 1 && overlapRatio < 0.25 ? "weakMatch" : "match";

  let reason: string | null = null;
  if (overlapCount <= 2) {
    const display = matchedSkills
      .slice(0, 2)
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(" & ");
    reason = `Matches your ${display} skills`;
  } else {
    reason = `${overlapCount} of your skills match`;
  }

  return { points, reason, relevance };
}

function scoreSalary(
  jobMin: number | null,
  jobMax: number | null,
  profileMin: number | null,
  profileMax: number | null
): { points: number } {
  const jobHasSalary = jobMin !== null || jobMax !== null;
  const profileHasSalary = profileMin !== null || profileMax !== null;

  // Job salary null → neutral
  if (!jobHasSalary) return { points: 10 };
  // User salary null → neutral
  if (!profileHasSalary) return { points: 10 };

  const jMin = jobMin ?? 0;
  const jMax = jobMax ?? jMin;
  const pMin = profileMin ?? 0;
  const pMax = profileMax ?? pMin;

  // Check overlap: ranges overlap when one starts before the other ends
  if (jMax >= pMin && pMax >= jMin) {
    return { points: 20 };
  }

  // Within 20% gap
  const gap = jMax < pMin ? pMin - jMax : jMin - pMax;
  const reference = Math.max(pMax, jMax, 1);
  if (gap / reference <= 0.2) {
    return { points: 12 };
  }

  return { points: 0 };
}

function scoreLocation(
  jobCity: string | null,
  workSetup: string | null,
  profileCity: string | null
): { points: number; reason: string | null } {
  // Remote job
  if (workSetup === "remote") {
    return { points: 12, reason: "Remote position" };
  }

  // Job city null → neutral
  if (!jobCity) return { points: 8, reason: null };

  // Profile city null → neutral
  if (!profileCity) return { points: 8, reason: null };

  // City match (case-insensitive, partial match for flexibility)
  const jCity = jobCity.toLowerCase().trim();
  const pCity = profileCity.toLowerCase().trim();

  if (jCity === pCity || jCity.includes(pCity) || pCity.includes(jCity)) {
    return { points: 15, reason: "In your preferred city" };
  }

  return { points: 0, reason: null };
}

function scoreWorkSetup(jobSetup: string | null, profilePref: string | null): number {
  if (!jobSetup) return 5; // neutral
  if (!profilePref || profilePref === "any") return 10;
  return jobSetup === profilePref ? 10 : 0;
}

function scoreJobType(jobType: string | null, profileType: string | null): number {
  if (!jobType) return 5; // neutral
  if (!profileType || profileType === "any") return 10;
  return jobType === profileType ? 10 : 0;
}

const EXP_ORDINALS: Record<string, number> = {
  fresh_graduate: 0,
  entry: 0,
  junior: 1,
  mid: 2,
  senior: 3,
};

function scoreExperience(jobExp: string | null, profileExp: string | null): number {
  if (!jobExp) return 5; // neutral
  if (!profileExp) return 5;

  const jOrd = EXP_ORDINALS[jobExp.toLowerCase()] ?? -1;
  const pOrd = EXP_ORDINALS[profileExp.toLowerCase()] ?? -1;

  if (jOrd === -1 || pOrd === -1) return 5; // unknown → neutral

  const diff = Math.abs(jOrd - pOrd);
  if (diff === 0) return 10;
  if (diff === 1) return 6;
  if (diff === 2) return 2;
  return 0;
}

// Education ordinals (profile uses ProfileEducationLevel, job descriptions yield EducationLevel)
const PROFILE_EDU_ORDINALS: Record<string, number> = {
  high_school: 0,
  vocational: 1,
  bachelors: 2,
  masters: 3,
  doctorate: 4,
};

// Map from extracted EducationLevel (from queries.ts) to ordinal
const JOB_EDU_ORDINALS: Record<string, number> = {
  high_school: 0,
  associate: 1,  // vocational/associate
  bachelors: 2,
  masters: 3,
  doctorate: 4,
};

function scoreEducation(
  descriptionPlain: string | undefined,
  profileEdu: ProfileEducationLevel | null
): number {
  if (!descriptionPlain) return 5; // no text to extract from → neutral
  const jobEdu: EducationLevel = extractEducation(descriptionPlain);

  // No requirement extracted → neutral
  if (!jobEdu) return 5;
  // No profile education → neutral
  if (!profileEdu) return 5;

  const jOrd = JOB_EDU_ORDINALS[jobEdu] ?? -1;
  const pOrd = PROFILE_EDU_ORDINALS[profileEdu] ?? -1;

  if (jOrd === -1 || pOrd === -1) return 5;

  if (pOrd >= jOrd) return 5;       // meets or exceeds requirement
  if (pOrd === jOrd - 1) return 3;  // one level below
  return 0;
}

function scoreRecency(postedAt: string): number {
  const hoursAgo = (Date.now() - new Date(postedAt).getTime()) / 3600000;
  if (hoursAgo < 24) return 3;
  if (hoursAgo < 72) return 2;
  if (hoursAgo < 168) return 1; // 7 days
  return 0;
}

function scoreListingQuality(row: JobRow): number {
  let pts = 0;
  if (row.salary_min !== null || row.salary_max !== null) pts++;
  if (row.skills_required && row.skills_required.length > 0) pts++;
  return pts;
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
