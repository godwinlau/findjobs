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
const CONCURRENCY = 10; // Process 10 jobs in parallel (~600 RPM, within 1K dev tier)

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
const idIdx = args.indexOf("--id");
const singleJobId = idIdx >= 0 ? args[idIdx + 1] : null;

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  // Single job mode: --id <job-id>
  if (singleJobId) {
    console.log(`Backfill single job: ${singleJobId}${dryRun ? " (DRY RUN)" : ""}`);
    const { data: job, error } = await supabase
      .from("jobs")
      .select("id, description_plain, skills_required, skills_structured")
      .eq("id", singleJobId)
      .single();

    if (error || !job) {
      console.error("Fetch error:", error?.message ?? "Job not found");
      process.exit(1);
    }

    console.log("Current skills_required:", (job as Record<string, unknown>).skills_required);
    console.log("Current skills_structured:", (job as Record<string, unknown>).skills_structured);

    const description = (job as Record<string, string>).description_plain;
    if (!description || description.trim().length < 20) {
      console.log("Description too short, skipping.");
      return;
    }

    const result = await extractSkillsWithStructured(description);
    console.log("Extracted:", JSON.stringify(result, null, 2));

    if (!dryRun) {
      const updatePayload: Record<string, unknown> = {
        skills_required: result.skills_required,
        skills_structured: result.skills_structured,
      };
      if (result.experience_level) updatePayload.experience_level = result.experience_level;
      if (result.salary_min !== null || result.salary_max !== null) {
        updatePayload.salary_min = result.salary_min;
        updatePayload.salary_max = result.salary_max;
        updatePayload.salary_is_estimate = result.salary_is_estimate;
      }

      const { error: updateError } = await supabase.from("jobs").update(updatePayload).eq("id", singleJobId);
      if (updateError) {
        console.error("Update error:", updateError.message);
        process.exit(1);
      }
      console.log("Updated successfully!");
    }
    return;
  }

  const startTime = Date.now();
  const elapsed = () => ((Date.now() - startTime) / 1000).toFixed(1);

  console.log("─".repeat(60));
  console.log(`Backfill structured skills`);
  console.log(`  Mode:      ${dryRun ? "DRY RUN" : "LIVE"}${reprocessAll ? " | REPROCESS ALL" : ""}`);
  console.log(`  Max jobs:  ${maxJobs === Infinity ? "unlimited" : maxJobs}`);
  console.log(`  Batch size: ${BATCH_SIZE}`);
  console.log(`  Concurrency: ${CONCURRENCY}`);
  console.log("─".repeat(60));

  let processed = 0;
  let updated = 0;
  let skipped = 0;
  let errors = 0;
  let offset = 0;
  let batchNum = 0;
  let consecutiveEmptyBatches = 0;

  while (processed < maxJobs) {
    batchNum++;
    // Fetch next batch of jobs
    let query = supabase
      .from("jobs")
      .select("id, title, description_plain, skills_required")
      .eq("is_active", true)
      .order("posted_at", { ascending: false })
      .range(offset, offset + BATCH_SIZE - 1);

    // Only filter for missing skills_structured unless --all flag is set
    if (!reprocessAll) {
      query = query.is("skills_structured", null);
    }

    console.log(`\n[Batch ${batchNum}] Fetching jobs (offset ${offset})...`);
    const { data: jobs, error } = await query;

    if (error) {
      console.error(`[Batch ${batchNum}] Fetch error: ${error.message}`);
      break;
    }

    if (!jobs || jobs.length === 0) {
      console.log(`[Batch ${batchNum}] No more jobs to process.`);
      break;
    }

    console.log(`[Batch ${batchNum}] Got ${jobs.length} jobs`);

    let batchUpdated = 0;
    let batchErrors = 0;
    let batchSkipped = 0;

    // Process jobs in chunks of CONCURRENCY
    for (let ci = 0; ci < jobs.length; ci += CONCURRENCY) {
      if (processed >= maxJobs) break;

      const chunk = jobs.slice(ci, ci + CONCURRENCY);
      const results = await Promise.allSettled(
        chunk.map(async (job) => {
          const jobId = (job as Record<string, string>).id;
          const jobTitle = (job as Record<string, string>).title ?? "Untitled";
          const description = (job as Record<string, string>).description_plain;

          if (!description || description.trim().length < 20) {
            return { status: "skip" as const, jobTitle, descLen: description?.length ?? 0 };
          }

          const extractStart = Date.now();
          const { skills_required, skills_structured, experience_level, salary_min, salary_max, salary_is_estimate } =
            await extractSkillsWithStructured(description);
          const extractMs = Date.now() - extractStart;

          if (!dryRun) {
            const updatePayload: Record<string, unknown> = {
              skills_required,
              skills_structured,
            };
            if (experience_level) updatePayload.experience_level = experience_level;
            if (salary_min !== null || salary_max !== null) {
              updatePayload.salary_min = salary_min;
              updatePayload.salary_max = salary_max;
              updatePayload.salary_is_estimate = salary_is_estimate;
            }

            const { error: updateError } = await supabase
              .from("jobs")
              .update(updatePayload)
              .eq("id", jobId);

            if (updateError) {
              return { status: "fail" as const, jobTitle, error: updateError.message };
            }
          }

          return {
            status: dryRun ? "dry" as const : "ok" as const,
            jobTitle,
            skillCount: skills_structured.length,
            skillsList: skills_required.slice(0, 5).join(", "),
            moreCount: skills_required.length > 5 ? skills_required.length - 5 : 0,
            experience_level,
            salary_min,
            salary_max,
            extractMs,
          };
        })
      );

      // Log results in order
      for (const r of results) {
        if (processed >= maxJobs) break;
        const jobNum = processed + 1;

        if (r.status === "rejected") {
          const errMsg = r.reason instanceof Error ? r.reason.message : String(r.reason);
          console.error(`  [${jobNum}] ERR  — ${errMsg}`);
          errors++;
          batchErrors++;
        } else {
          const v = r.value;
          if (v.status === "skip") {
            console.log(`  [${jobNum}] SKIP "${v.jobTitle.slice(0, 50)}" — description too short (${v.descLen} chars)`);
            skipped++;
            batchSkipped++;
            batchErrors++; // stays in filter
          } else if (v.status === "fail") {
            console.error(`  [${jobNum}] FAIL "${v.jobTitle.slice(0, 40)}" — DB: ${v.error}`);
            errors++;
            batchErrors++;
          } else {
            const more = v.moreCount > 0 ? ` +${v.moreCount} more` : "";
            console.log(
              `  [${jobNum}] ${v.status === "dry" ? "DRY" : "OK  "} "${v.jobTitle.slice(0, 40)}" — ${v.skillCount} skills [${v.skillsList}${more}] | exp=${v.experience_level ?? "-"} | salary=${v.salary_min ?? "?"}–${v.salary_max ?? "?"} (${v.extractMs}ms)`
            );
            if (v.status === "ok") { updated++; batchUpdated++; }
            else { batchUpdated++; }
          }
        }
        processed++;
      }
    }

    console.log(`[Batch ${batchNum}] Done — ${batchUpdated} ok, ${batchErrors} errors, ${batchSkipped} skipped | Total: ${processed} processed, ${updated} updated, ${errors} errors (${elapsed()}s)`);

    // Pagination strategy:
    // - Dry-run or --all: always advance by BATCH_SIZE (no DB changes, results don't shift)
    // - Live without --all: only advance by jobs that WEREN'T updated (they stay in the filter).
    //   Successfully updated jobs disappear from the filter, so offset 0 shows the next batch.
    if (reprocessAll || dryRun) {
      offset += BATCH_SIZE;
    } else {
      offset += batchErrors;
      if (batchUpdated === 0) {
        consecutiveEmptyBatches++;
        if (consecutiveEmptyBatches >= 3) {
          console.error("\n3 consecutive batches with no updates — aborting to avoid infinite loop.");
          break;
        }
      } else {
        consecutiveEmptyBatches = 0;
      }
    }
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  const rate = processed > 0 ? (processed / ((Date.now() - startTime) / 1000)).toFixed(1) : "0";

  console.log("\n" + "═".repeat(60));
  console.log("  BACKFILL COMPLETE");
  console.log("═".repeat(60));
  console.log(`  Processed: ${processed}`);
  console.log(`  Updated:   ${updated}`);
  console.log(`  Skipped:   ${skipped}`);
  console.log(`  Errors:    ${errors}`);
  console.log(`  Time:      ${totalTime}s (${rate} jobs/s)`);
  console.log("═".repeat(60));
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
