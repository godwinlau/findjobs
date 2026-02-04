import { NextRequest, NextResponse } from "next/server";
import { runIngestionBatch } from "@/lib/ingest";
import { TOTAL_BATCHES } from "@/lib/queries";

// Manual trigger for testing:
//   POST /api/admin/ingest?batch=0     — run a specific batch
//   POST /api/admin/ingest?batch=all   — run ALL batches

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const batchParam = searchParams.get("batch");

  // Support "all" to run every batch
  if (batchParam === "all") {
    try {
      let totalFetched = 0;
      let totalInserted = 0;
      let totalDuplicates = 0;
      let totalErrors = 0;
      const allResults = [];

      for (let batch = 0; batch < TOTAL_BATCHES; batch++) {
        const result = await runIngestionBatch(batch);
        totalFetched += result.totalFetched;
        totalInserted += result.totalInserted;
        totalDuplicates += result.totalDuplicates;
        totalErrors += result.totalErrors;
        allResults.push({
          batch: result.batch,
          results: result.results,
          totals: {
            fetched: result.totalFetched,
            inserted: result.totalInserted,
            duplicates: result.totalDuplicates,
            errors: result.totalErrors,
            durationMs: result.durationMs,
          },
        });
      }

      return NextResponse.json({
        success: true,
        batchesRun: TOTAL_BATCHES,
        totalFetched,
        totalInserted,
        totalDuplicates,
        totalErrors,
        batches: allResults,
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

  const batch = batchParam ? parseInt(batchParam, 10) : 0;

  if (isNaN(batch) || batch < 0 || batch >= TOTAL_BATCHES) {
    return NextResponse.json(
      { error: `Invalid batch. Must be 0-${TOTAL_BATCHES - 1} or "all"` },
      { status: 400 }
    );
  }

  try {
    const result = await runIngestionBatch(batch);

    return NextResponse.json({
      success: true,
      batch: result.batch,
      results: result.results,
      totals: {
        fetched: result.totalFetched,
        inserted: result.totalInserted,
        duplicates: result.totalDuplicates,
        errors: result.totalErrors,
        durationMs: result.durationMs,
      },
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
