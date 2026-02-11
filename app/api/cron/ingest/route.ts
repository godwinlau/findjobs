import { NextRequest, NextResponse } from "next/server";
import { runIngestionBatch, cleanupExpiredJobs } from "@/lib/ingest";
import { runJSearchIngestion } from "@/lib/jsearch";
import { resetStaleStreaks } from "@/lib/streaks";
import { TOTAL_BATCHES } from "@/lib/queries";
import { logger } from "@/lib/logger";

const log = logger.child({ module: "cron:ingest" });

// Vercel Cron calls this with 1 batch per invocation (PHT schedule):
//   5:30 PM  → batch 0      5:40 PM → batch 1
//  10:30 PM  → batch 2     10:40 PM → batch 3
//   3:30 AM  → batch 4      3:40 AM → batch 5
//   8:30 AM  → batch 6 + JSearch + cleanup + streaks
// Each batch has 5 queries × ~60s = ~300s max, fits within maxDuration.

export const maxDuration = 300;

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
  const batchResults: { batch: number; fetched: number; inserted: number; duplicates: number; errors: number; durationMs: number }[] = [];

  let jsearch = { totalFetched: 0, totalInserted: 0, totalDuplicates: 0, totalErrors: 0, queries: [] as string[], requestsUsed: 0, durationMs: 0 };
  let cleanup = { deactivated: 0 };
  let streaks = { reset: 0 };

  try {
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

    if (shouldRunExtras) {
      jsearch = await runJSearchIngestion();
      cleanup = await cleanupExpiredJobs();
      streaks = await resetStaleStreaks();
    }
  } catch (err) {
    // Count the error but continue to notification + response
    totalErrors++;
    log.error({ err }, "Ingestion error");
  } finally {
    // Always send notification — even on partial completion or timeout edge
    const totalNewJobs = totalInserted + jsearch.totalInserted;
    const shouldRunExtras = runExtras || !batchesParam;

    await sendIngestionNotification({
      batchesRun: batchesToRun,
      batchesCompleted: batchResults.map((r) => r.batch),
      totalFetched: totalFetched + jsearch.totalFetched,
      totalInserted: totalNewJobs,
      totalDuplicates: totalDuplicates + jsearch.totalDuplicates,
      totalErrors: totalErrors + jsearch.totalErrors,
      jsearchInserted: jsearch.totalInserted,
      cleanup: shouldRunExtras ? cleanup.deactivated : 0,
    });
  }

  const totalNewJobs = totalInserted + jsearch.totalInserted;
  const shouldRunExtras = runExtras || !batchesParam;

  return NextResponse.json({
    success: totalErrors === 0,
    batchesRun: batchesToRun,
    batchesCompleted: batchResults.map((r) => r.batch),
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
}

// ─── Slack notification ───
// Set INGESTION_WEBHOOK_URL env var to a Slack Incoming Webhook URL.

async function sendIngestionNotification(data: {
  batchesRun: number[];
  batchesCompleted: number[];
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
    const partial = data.batchesCompleted.length < data.batchesRun.length;
    const emoji = partial ? ":warning:" : hasNewJobs ? ":white_check_mark:" : ":recycle:";
    const status = partial
      ? `*Partial run* — completed [${data.batchesCompleted.join(", ")}] of [${data.batchesRun.join(", ")}]`
      : hasNewJobs
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
          text: `${emoji}  *Ingestion Report* — ${now}\nBatch [${data.batchesCompleted.join(", ")}]`,
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
    log.error("Ingestion webhook notification failed");
  }
}
