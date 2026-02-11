import { TITLE_SKILL_PATTERNS, SKILL_ALIASES } from "@/lib/constants/skill-mappings";
import type { JobRow } from "./types";

// ─── Skill normalization ───

export function normalizeSkill(raw: string): string {
  const key = raw.toLowerCase().trim();
  return SKILL_ALIASES[key] ?? key;
}

// ─── Title-to-skills inference for profile headline ───

export function inferSkillsFromHeadline(headline: string | null): string[] {
  if (!headline) return [];
  const lower = headline.toLowerCase();
  const inferred = new Set<string>();
  for (const { pattern, skills } of TITLE_SKILL_PATTERNS) {
    if (pattern.test(lower)) {
      for (const skill of skills) inferred.add(normalizeSkill(skill));
    }
  }
  return Array.from(inferred);
}

// ─── Effective skill extraction ───

export function getEffectiveJobSkills(row: JobRow, profileSkills: string[]): string[] {
  const existing = new Set(
    (row.skills_required ?? []).map((s) => normalizeSkill(s))
  );

  const titleLower = (row.title ?? "").toLowerCase();
  for (const { pattern, skills } of TITLE_SKILL_PATTERNS) {
    if (pattern.test(titleLower)) {
      for (const skill of skills) existing.add(normalizeSkill(skill));
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
