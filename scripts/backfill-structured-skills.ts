#!/usr/bin/env npx tsx
/**
 * Backfill structured skills for existing jobs.
 *
 * Fetches active jobs missing `skills_structured`, calls `extractSkillsLLM()`
 * per job (rate-limited at ~28/min for Groq free tier), and updates both
 * `skills_structured` and `skills_required`.
 *
 * Usage:
 *   npx tsx scripts/backfill-structured-skills.ts [--limit 100] [--dry-run]
 */

import { createClient } from "@supabase/supabase-js";
import { extractSkillsWithStructured } from "../lib/skills/groq-extraction";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const BATCH_SIZE = 50; // Fetch in batches of 50

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

if (!process.env.GROQ_API_KEY) {
  console.error("Missing GROQ_API_KEY — needed for LLM extraction");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const limitIdx = args.indexOf("--limit");
const maxJobs = limitIdx >= 0 ? parseInt(args[limitIdx + 1], 10) : Infinity;
const dryRun = args.includes("--dry-run");
const reprocessAll = args.includes("--all");

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log(`Backfill structured skills${dryRun ? " (DRY RUN)" : ""}${reprocessAll ? " (REPROCESS ALL)" : ""}`);
  console.log(`Max jobs: ${maxJobs === Infinity ? "all" : maxJobs}`);

  let processed = 0;
  let updated = 0;
  let errors = 0;
  let offset = 0;

  while (processed < maxJobs) {
    // Fetch next batch of jobs
    let query = supabase
      .from("jobs")
      .select("id, description_plain, skills_required")
      .eq("is_active", true)
      .order("posted_at", { ascending: false })
      .range(offset, offset + BATCH_SIZE - 1);

    // Only filter for missing skills_structured unless --all flag is set
    if (!reprocessAll) {
      query = query.or("skills_structured.is.null,skills_structured.eq.[]");
    }

    const { data: jobs, error } = await query;

    if (error) {
      console.error("Fetch error:", error.message);
      break;
    }

    if (!jobs || jobs.length === 0) {
      console.log("No more jobs to process.");
      break;
    }

    for (const job of jobs) {
      if (processed >= maxJobs) break;

      const description = (job as Record<string, string>).description_plain;
      if (!description || description.trim().length < 20) {
        processed++;
        continue;
      }

      try {
        const { skills_required, skills_structured, experience_level, salary_min, salary_max, salary_is_estimate } =
          await extractSkillsWithStructured(description);

        if (dryRun) {
          console.log(
            `[DRY RUN] Job ${(job as Record<string, string>).id}: ${skills_structured.length} structured, ${skills_required.length} labels, exp=${experience_level ?? "null"}, salary=${salary_min ?? "?"}-${salary_max ?? "?"}`
          );
        } else {
          // Build update payload — only overwrite experience/salary if we found new data
          const updatePayload: Record<string, unknown> = {
            skills_required,
            skills_structured,
          };
          if (experience_level) {
            updatePayload.experience_level = experience_level;
          }
          if (salary_min !== null || salary_max !== null) {
            updatePayload.salary_min = salary_min;
            updatePayload.salary_max = salary_max;
            updatePayload.salary_is_estimate = salary_is_estimate;
          }

          const { error: updateError } = await supabase
            .from("jobs")
            .update(updatePayload)
            .eq("id", (job as Record<string, string>).id);

          if (updateError) {
            console.error(
              `Update error for ${(job as Record<string, string>).id}:`,
              updateError.message
            );
            errors++;
          } else {
            updated++;
          }
        }

        processed++;

        if (processed % 10 === 0) {
          console.log(
            `Progress: ${processed} processed, ${updated} updated, ${errors} errors`
          );
        }
      } catch (err) {
        console.error(
          `Extraction error for ${(job as Record<string, string>).id}:`,
          err
        );
        errors++;
        processed++;
      }
    }

    // Move offset forward — since we're filtering by missing skills_structured,
    // successfully updated jobs won't appear again, but failed ones might.
    // Use offset increment to avoid infinite loops.
    offset += BATCH_SIZE;
  }

  console.log("\n=== Backfill Complete ===");
  console.log(`Processed: ${processed}`);
  console.log(`Updated: ${updated}`);
  console.log(`Errors: ${errors}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
