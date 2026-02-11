import { unstable_cache } from "next/cache";
import { createServiceClient } from "@/lib/supabase-server";
import { normalizeSkill } from "@/lib/matching";
import { SKILL_ALIASES } from "@/lib/constants/skill-mappings";

export interface SkillCount {
  name: string;
  jobs: number;
}

/**
 * Fetch top skills by job count from active jobs.
 * Cached for 1 hour via unstable_cache.
 */
export const getTopSkillCounts = unstable_cache(
  async (limit = 12): Promise<SkillCount[]> => {
    try {
      const supabase = createServiceClient();

      // Paginate to bypass Supabase 1000-row default limit
      const allRows: { skills_required: string[] }[] = [];
      let offset = 0;
      const PAGE = 1000;
      while (true) {
        const { data: page, error } = await supabase
          .from("jobs")
          .select("skills_required")
          .eq("is_active", true)
          .range(offset, offset + PAGE - 1);
        if (error || !page || page.length === 0) break;
        allRows.push(...page);
        if (page.length < PAGE) break;
        offset += PAGE;
      }
      const data = allRows;

      if (data.length === 0) return [];

      // Aggregate: normalize each skill, count occurrences
      const counts = new Map<string, number>();

      for (const row of data) {
        const skills: string[] = row.skills_required ?? [];
        // Dedupe within a single job
        const seen = new Set<string>();
        for (const raw of skills) {
          const normalized = normalizeSkill(raw);
          if (!seen.has(normalized)) {
            seen.add(normalized);
            counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
          }
        }
      }

      // Sort descending by count, take top N
      return Array.from(counts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([name, jobs]) => ({ name, jobs }));
    } catch {
      return [];
    }
  },
  ["landing-top-skill-counts"],
  { revalidate: 3600, tags: ["landing"] }
);

/**
 * Build a reverse alias map: canonical name → all known raw aliases.
 * Used to expand selected skills for the overlaps query.
 */
function expandSkillAliases(skills: string[]): string[] {
  // Build reverse map: canonical → aliases
  const reverseMap = new Map<string, Set<string>>();
  for (const [alias, canonical] of Object.entries(SKILL_ALIASES)) {
    const key = canonical.toLowerCase();
    if (!reverseMap.has(key)) reverseMap.set(key, new Set());
    reverseMap.get(key)!.add(alias);
  }

  const expanded = new Set<string>();
  for (const skill of skills) {
    const lower = skill.toLowerCase().trim();
    expanded.add(skill);       // original casing
    expanded.add(lower);       // lowercase
    // Add all known aliases for this canonical name
    const aliases = reverseMap.get(lower);
    if (aliases) {
      for (const a of aliases) expanded.add(a);
    }
  }

  return Array.from(expanded);
}

/**
 * Get the count of active jobs matching ANY of the given skills.
 * Uses the GIN index on skills_required via `overlaps`.
 */
export async function getMatchingJobCount(skills: string[]): Promise<number> {
  try {
    if (skills.length === 0) return 0;

    const supabase = createServiceClient();
    const expandedSkills = expandSkillAliases(skills);

    const { count, error } = await supabase
      .from("jobs")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true)
      .overlaps("skills_required", expandedSkills);

    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}
