/**
 * Local ingestion runner — runs all LinkedIn batches + JSearch.
 * Usage: npx tsx --env-file=.env.local scripts/run-ingest.ts
 *        npx tsx --env-file=.env.local scripts/run-ingest.ts --batch 0
 */

async function main() {
  // Dynamic imports to avoid module resolution issues outside Next.js
  const { runIngestionBatch, cleanupExpiredJobs } = await import("../lib/ingest");
  const { runJSearchIngestion } = await import("../lib/jsearch");
  const { TOTAL_BATCHES } = await import("../lib/queries");

  const args = process.argv.slice(2);
  const batchFlagIdx = args.indexOf("--batch");
  const specificBatch = batchFlagIdx !== -1 ? parseInt(args[batchFlagIdx + 1], 10) : null;

  const batchesToRun =
    specificBatch !== null && !isNaN(specificBatch)
      ? [specificBatch]
      : Array.from({ length: TOTAL_BATCHES }, (_, i) => i);

  console.log(`\n🔄 Running ingestion for batches: [${batchesToRun.join(", ")}]\n`);

  let totalInserted = 0;
  let totalFetched = 0;

  for (const batch of batchesToRun) {
    console.log(`── Batch ${batch} ──`);
    const result = await runIngestionBatch(batch);
    totalFetched += result.totalFetched;
    totalInserted += result.totalInserted;
    console.log(
      `   Fetched: ${result.totalFetched} | Inserted: ${result.totalInserted} | Dupes: ${result.totalDuplicates} | Errors: ${result.totalErrors} | ${(result.durationMs / 1000).toFixed(1)}s`
    );
  }

  // Run JSearch
  console.log(`\n── JSearch ──`);
  const jsearch = await runJSearchIngestion();
  totalFetched += jsearch.totalFetched;
  totalInserted += jsearch.totalInserted;
  console.log(
    `   Fetched: ${jsearch.totalFetched} | Inserted: ${jsearch.totalInserted} | Dupes: ${jsearch.totalDuplicates} | Errors: ${jsearch.totalErrors} | ${(jsearch.durationMs / 1000).toFixed(1)}s`
  );

  // Cleanup expired jobs
  console.log(`\n── Cleanup ──`);
  const cleanup = await cleanupExpiredJobs();
  console.log(`   Deactivated: ${cleanup.deactivated}`);

  console.log(`\n✅ Done — Fetched: ${totalFetched} | Inserted: ${totalInserted}\n`);
}

main().catch((err) => {
  console.error("❌ Ingestion failed:", err);
  process.exit(1);
});
