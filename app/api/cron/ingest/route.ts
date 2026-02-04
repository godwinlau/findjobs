import { NextRequest, NextResponse } from "next/server";
import { runIngestionBatch, cleanupExpiredJobs } from "@/lib/ingest";
import { TOTAL_BATCHES } from "@/lib/queries";

// Vercel Cron calls this once daily (Hobby plan limit)
// Runs ALL ingestion batches then cleans up expired jobs
// Source: linkedin-jobs-api npm package (free, no API key)
// Searches LinkedIn guest API with location="Philippines"

// Allow up to 5 minutes for full ingestion + cleanup
export const maxDuration = 300;

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let totalFetched = 0;
    let totalInserted = 0;
    let totalDuplicates = 0;
    let totalErrors = 0;
    const batchResults = [];

    // Run ALL batches sequentially
    for (let batch = 0; batch < TOTAL_BATCHES; batch++) {
      const result = await runIngestionBatch(batch);
      totalFetched += result.totalFetched;
      totalInserted += result.totalInserted;
      totalDuplicates += result.totalDuplicates;
      totalErrors += result.totalErrors;
      batchResults.push({
        batch: result.batch,
        fetched: result.totalFetched,
        inserted: result.totalInserted,
        duplicates: result.totalDuplicates,
        errors: result.totalErrors,
        durationMs: result.durationMs,
      });
    }

    // Run cleanup after ingestion (combines both cron jobs into one)
    const cleanup = await cleanupExpiredJobs();

    return NextResponse.json({
      success: true,
      batchesRun: TOTAL_BATCHES,
      totalFetched,
      totalInserted,
      totalDuplicates,
      totalErrors,
      batches: batchResults,
      cleanup: { deactivated: cleanup.deactivated },
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
