import { NextRequest, NextResponse } from "next/server";
import { runIngestionBatch, cleanupExpiredJobs } from "@/lib/ingest";
import { runJSearchIngestion } from "@/lib/jsearch";
import { resetStaleStreaks } from "@/lib/streaks";
import { TOTAL_BATCHES } from "@/lib/queries";

// Vercel Cron calls this 4x daily with different batch sets (PHT schedule):
//   4:00 PM  → batches 0,1
//   9:00 PM  → batches 2,3
//   2:00 AM  → batches 4,5
//   7:00 AM  → batches 6 + JSearch + cleanup + streaks
// Accepts ?batches=0,1 to run specific batches.
// The last run adds ?extras=true to also run JSearch, cleanup, and streaks.

export const maxDuration = 300;

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Parse which batches to run from query param
    const batchesParam = req.nextUrl.searchParams.get("batches");
    const runExtras = req.nextUrl.searchParams.get("extras") === "true";

    let batchesToRun: number[];
    if (batchesParam) {
      batchesToRun = batchesParam
        .split(",")
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !isNaN(n) && n >= 0 && n < TOTAL_BATCHES);
    } else {
      // No param = run all batches (backward compatible)
      batchesToRun = Array.from({ length: TOTAL_BATCHES }, (_, i) => i);
    }

    let totalFetched = 0;
    let totalInserted = 0;
    let totalDuplicates = 0;
    let totalErrors = 0;
    const batchResults = [];

    for (const batch of batchesToRun) {
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

    // Only run JSearch, cleanup, and streaks when extras=true (last daily run)
    // or when no batches param (full backward-compatible run)
    const shouldRunExtras = runExtras || !batchesParam;

    let jsearch = { totalFetched: 0, totalInserted: 0, totalDuplicates: 0, totalErrors: 0, queries: [] as string[], requestsUsed: 0, durationMs: 0 };
    let cleanup = { deactivated: 0 };
    let streaks = { reset: 0 };

    if (shouldRunExtras) {
      jsearch = await runJSearchIngestion();
      cleanup = await cleanupExpiredJobs();
      streaks = await resetStaleStreaks();
    }

    const totalNewJobs = totalInserted + jsearch.totalInserted;

    // Send webhook notification if configured
    await sendIngestionNotification({
      batchesRun: batchesToRun,
      totalFetched: totalFetched + jsearch.totalFetched,
      totalInserted: totalNewJobs,
      totalDuplicates: totalDuplicates + jsearch.totalDuplicates,
      totalErrors: totalErrors + jsearch.totalErrors,
      jsearchInserted: jsearch.totalInserted,
      cleanup: shouldRunExtras ? cleanup.deactivated : 0,
    });

    return NextResponse.json({
      success: true,
      batchesRun: batchesToRun,
      totalFetched: totalFetched + jsearch.totalFetched,
      totalInserted: totalNewJobs,
      totalDuplicates: totalDuplicates + jsearch.totalDuplicates,
      totalErrors: totalErrors + jsearch.totalErrors,
      batches: batchResults,
      ...(shouldRunExtras && {
        jsearch: {
          queries: jsearch.queries,
          requestsUsed: jsearch.requestsUsed,
          fetched: jsearch.totalFetched,
          inserted: jsearch.totalInserted,
          duplicates: jsearch.totalDuplicates,
          errors: jsearch.totalErrors,
          durationMs: jsearch.durationMs,
        },
        cleanup: { deactivated: cleanup.deactivated },
        streaks: { reset: streaks.reset },
      }),
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

// ─── Slack notification ───
// Set INGESTION_WEBHOOK_URL env var to a Slack Incoming Webhook URL.

async function sendIngestionNotification(data: {
  batchesRun: number[];
  totalFetched: number;
  totalInserted: number;
  totalDuplicates: number;
  totalErrors: number;
  jsearchInserted: number;
  cleanup: number;
}): Promise<void> {
  const webhookUrl = process.env.INGESTION_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    const now = new Date().toLocaleString("en-PH", {
      timeZone: "Asia/Manila",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    const hasNewJobs = data.totalInserted > 0;
    const emoji = hasNewJobs ? ":white_check_mark:" : ":recycle:";
    const status = hasNewJobs
      ? `*${data.totalInserted} new jobs* added`
      : "_No new jobs — all duplicates_";

    // Stats line
    const stats = [
      `${data.totalFetched} fetched`,
      `${data.totalDuplicates} dupes`,
    ];
    if (data.jsearchInserted > 0) stats.push(`${data.jsearchInserted} from JSearch`);
    if (data.totalErrors > 0) stats.push(`:warning: ${data.totalErrors} errors`);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const blocks: any[] = [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `${emoji}  *Ingestion Report* — ${now}\nBatches [${data.batchesRun.join(", ")}]`,
        },
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*Status*\n${status}` },
          { type: "mrkdwn", text: `*Details*\n${stats.join(" · ")}` },
        ],
      },
    ];

    if (data.cleanup > 0) {
      blocks.push({
        type: "context",
        elements: [
          { type: "mrkdwn", text: `:broom: ${data.cleanup} expired jobs deactivated` },
        ],
      });
    }

    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blocks }),
    });
  } catch {
    // Non-fatal — don't break ingestion if notification fails
    console.error("Ingestion webhook notification failed");
  }
}
