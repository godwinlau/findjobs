#!/usr/bin/env npx tsx
/**
 * Backfill: normalize existing profile skills to ontology canonical labels.
 *
 * Reads all profiles with non-empty `skills` arrays, normalizes each skill
 * name via `normalizeSkill()`, and also normalizes `skill_proficiencies` keys.
 * Updates profiles in batches of 100.
 *
 * Usage:
 *   npx tsx scripts/normalize-profile-skills.ts [--dry-run] [--limit 50]
 */

import { createClient } from "@supabase/supabase-js";
import { normalizeSkill } from "../lib/matching/skills";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const BATCH_SIZE = 100;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const limitIdx = args.indexOf("--limit");
const maxProfiles = limitIdx >= 0 ? parseInt(args[limitIdx + 1], 10) : Infinity;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function objectKeysEqual(
  a: Record<string, string> | null,
  b: Record<string, string> | null
): boolean {
  if (!a && !b) return true;
  if (!a || !b) return false;
  const aKeys = Object.keys(a).sort();
  const bKeys = Object.keys(b).sort();
  if (aKeys.length !== bKeys.length) return false;
  for (let i = 0; i < aKeys.length; i++) {
    if (aKeys[i] !== bKeys[i]) return false;
    if (a[aKeys[i]] !== b[bKeys[i]]) return false;
  }
  return true;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log(`Normalize profile skills — ${dryRun ? "DRY RUN" : "LIVE"}`);
  console.log(`Max profiles: ${maxProfiles === Infinity ? "all" : maxProfiles}`);

  let offset = 0;
  let totalProcessed = 0;
  let totalUpdated = 0;
  let totalSkipped = 0;

  while (totalProcessed < maxProfiles) {
    const batchLimit = Math.min(BATCH_SIZE, maxProfiles - totalProcessed);

    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("id, skills, skill_proficiencies")
      .not("skills", "is", null)
      .order("id")
      .range(offset, offset + batchLimit - 1);

    if (error) {
      console.error("Fetch error:", error.message);
      process.exit(1);
    }

    if (!profiles || profiles.length === 0) break;

    for (const profile of profiles) {
      const skills: string[] = profile.skills ?? [];
      const proficiencies: Record<string, string> | null =
        profile.skill_proficiencies;

      // Skip profiles with empty skills
      if (skills.length === 0) {
        totalSkipped++;
        totalProcessed++;
        continue;
      }

      // Normalize skills
      const normalizedSkills = skills.map(normalizeSkill);

      // Normalize proficiency keys
      let normalizedProf: Record<string, string> | null = null;
      if (proficiencies && typeof proficiencies === "object") {
        normalizedProf = {};
        for (const [key, val] of Object.entries(proficiencies)) {
          normalizedProf[normalizeSkill(key)] = val;
        }
      }

      // Check if anything changed
      const skillsChanged = !arraysEqual(skills, normalizedSkills);
      const profChanged = !objectKeysEqual(proficiencies, normalizedProf);

      if (!skillsChanged && !profChanged) {
        totalSkipped++;
        totalProcessed++;
        continue;
      }

      // Log changes
      if (skillsChanged) {
        const changes = skills
          .map((s, i) => (s !== normalizedSkills[i] ? `  "${s}" → "${normalizedSkills[i]}"` : null))
          .filter(Boolean);
        console.log(`[${profile.id}] skills changes:`);
        changes.forEach((c) => console.log(c));
      }
      if (profChanged) {
        console.log(`[${profile.id}] proficiency keys normalized`);
      }

      if (!dryRun) {
        const updateData: Record<string, unknown> = {};
        if (skillsChanged) updateData.skills = normalizedSkills;
        if (profChanged) updateData.skill_proficiencies = normalizedProf;

        const { error: updateError } = await supabase
          .from("profiles")
          .update(updateData)
          .eq("id", profile.id);

        if (updateError) {
          console.error(`[${profile.id}] update error:`, updateError.message);
        } else {
          totalUpdated++;
        }
      } else {
        totalUpdated++;
      }

      totalProcessed++;
    }

    offset += profiles.length;

    // If we got fewer than requested, we've reached the end
    if (profiles.length < batchLimit) break;
  }

  console.log("\n--- Summary ---");
  console.log(`Processed: ${totalProcessed}`);
  console.log(`Updated:   ${totalUpdated}`);
  console.log(`Skipped:   ${totalSkipped} (no changes needed)`);
  if (dryRun) console.log("(dry run — no DB writes)");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
