/**
 * One-time salary backfill — extracts salary from description_plain
 * for active jobs that have no salary data.
 *
 * Usage: npx tsx --env-file=.env.local scripts/backfill-salary.ts
 *        npx tsx --env-file=.env.local scripts/backfill-salary.ts --dry-run
 */

// ─── Sanity filters ───
// Philippine salary reality checks (monthly PHP)
const MIN_MONTHLY = 5_000;       // ₱5K — below this is likely hourly or parsing error
const MAX_MONTHLY = 500_000;     // ₱500K — above this is likely annual or garbage
const ANNUAL_THRESHOLD = 150_000; // ₱150K+ assumed annual → divide by 12
const MAX_RANGE_RATIO = 5;       // max can't be more than 5× min (too wide = bad parse)

interface SanitizedSalary {
  min: number | null;
  max: number | null;
  action: "ok" | "converted_annual" | "skipped";
  reason?: string;
}

function sanitizeSalary(rawMin: number | null, rawMax: number | null): SanitizedSalary {
  let min = rawMin;
  let max = rawMax;
  const val = max ?? min ?? 0;

  // Filter: absurdly high — likely garbage data (₱8.6M/month)
  if (val > MAX_MONTHLY * 12) {
    return { min: null, max: null, action: "skipped", reason: `₱${Math.round(val / 1000)}K is unrealistic` };
  }

  // Filter: range too wide — likely mixed units or bad parse
  if (min && max && max > min * MAX_RANGE_RATIO) {
    return { min: null, max: null, action: "skipped", reason: `range too wide (${Math.round(max / min)}×)` };
  }

  // Convert: likely annual salary → monthly
  const bothHigh = (min !== null && min >= ANNUAL_THRESHOLD) || (max !== null && max >= ANNUAL_THRESHOLD);
  if (bothHigh) {
    min = min !== null ? Math.round(min / 12) : null;
    max = max !== null ? Math.round(max / 12) : null;

    // After conversion, check if still reasonable
    const converted = max ?? min ?? 0;
    if (converted < MIN_MONTHLY) {
      return { min: null, max: null, action: "skipped", reason: `₱${Math.round(converted / 1000)}K/mo after annual conversion is too low` };
    }

    return { min, max, action: "converted_annual" };
  }

  // Filter: too low — likely hourly rate or parsing error
  if (val < MIN_MONTHLY) {
    return { min: null, max: null, action: "skipped", reason: `₱${Math.round(val / 1000)}K is below ₱5K/mo minimum` };
  }

  return { min, max, action: "ok" };
}

async function main() {
  const { createServiceClient } = await import("../lib/supabase-server");
  const { extractSalaryFromDescription } = await import("../lib/linkedin-jobs");

  const dryRun = process.argv.includes("--dry-run");
  const supabase = createServiceClient();

  console.log(`\n${dryRun ? "🔍 DRY RUN — " : ""}Salary backfill starting...\n`);

  // Fetch all active jobs with no salary but with a description
  const PAGE = 1000;
  let offset = 0;
  const rows: { id: string; description_plain: string }[] = [];

  while (true) {
    const { data, error } = await supabase
      .from("jobs")
      .select("id, description_plain")
      .eq("is_active", true)
      .is("salary_min", null)
      .is("salary_max", null)
      .not("description_plain", "is", null)
      .neq("description_plain", "")
      .range(offset, offset + PAGE - 1);

    if (error) {
      console.error("Fetch error:", error.message);
      break;
    }
    if (!data || data.length === 0) break;
    rows.push(...(data as { id: string; description_plain: string }[]));
    if (data.length < PAGE) break;
    offset += PAGE;
  }

  console.log(`Found ${rows.length} jobs with no salary + description\n`);

  let accepted = 0;
  let converted = 0;
  let filtered = 0;
  let noSalary = 0;
  let updateErrors = 0;

  for (const row of rows) {
    const salary = extractSalaryFromDescription(row.description_plain);

    if (salary.min === null && salary.max === null) {
      noSalary++;
      continue;
    }

    const result = sanitizeSalary(salary.min, salary.max);

    if (result.action === "skipped") {
      filtered++;
      const rawLabel = `₱${salary.min ? Math.round(salary.min / 1000) + "K" : "?"}–₱${salary.max ? Math.round(salary.max / 1000) + "K" : "?"}`;
      console.log(`  ✗ ${row.id.slice(0, 8)}… ${rawLabel} — SKIP: ${result.reason}`);
      continue;
    }

    if (result.action === "converted_annual") converted++;
    accepted++;

    const label = `₱${result.min ? Math.round(result.min / 1000) + "K" : "?"}–₱${result.max ? Math.round(result.max / 1000) + "K" : "?"}`;
    const tag = result.action === "converted_annual" ? " (annual→monthly)" : "";
    console.log(`  ✓ ${row.id.slice(0, 8)}… → ${label}${tag}`);

    if (!dryRun) {
      const { error } = await supabase
        .from("jobs")
        .update({
          salary_min: result.min,
          salary_max: result.max,
          salary_is_estimate: true,
        })
        .eq("id", row.id);

      if (error) {
        console.error(`    ✗ Update failed: ${error.message}`);
        updateErrors++;
      }
    }
  }

  console.log(`\n${dryRun ? "🔍 DRY RUN " : ""}Results:`);
  console.log(`  Total scanned:    ${rows.length}`);
  console.log(`  No salary found:  ${noSalary}`);
  console.log(`  Accepted:         ${accepted} (${converted} converted from annual)`);
  console.log(`  Filtered out:     ${filtered}`);
  if (!dryRun) console.log(`  Update errors:    ${updateErrors}`);
  console.log();
}

main().catch((err) => {
  console.error("❌ Backfill failed:", err);
  process.exit(1);
});
