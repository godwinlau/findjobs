import { createServiceClient } from "@/lib/supabase-server";

// ─── Types ───

export interface HealthCheckResult {
  checked: number;
  deactivated: number;
  stillActive: number;
  errors: number;
  durationMs: number;
}

// ─── Tier 1: Quick HEAD check ───

const GENERIC_REDIRECT_PATTERNS = [
  /^https?:\/\/[^/]+\/?$/,              // root domain
  /^https?:\/\/[^/]+\/jobs\/?$/i,       // /jobs
  /^https?:\/\/[^/]+\/search\/?$/i,     // /search
  /^https?:\/\/[^/]+\/careers\/?$/i,    // /careers
  /^https?:\/\/[^/]+\/expired\/?$/i,    // /expired
];

export async function checkJobUrl(
  url: string
): Promise<"active" | "dead" | "uncertain"> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; HanapBuhay-HealthCheck/1.0)",
      },
    });

    clearTimeout(timeout);

    // Hard dead signals
    if (res.status === 404 || res.status === 410) {
      return "dead";
    }

    // Check if redirected to a generic page
    const finalUrl = res.url;
    if (finalUrl !== url) {
      for (const pattern of GENERIC_REDIRECT_PATTERNS) {
        if (pattern.test(finalUrl)) {
          return "dead";
        }
      }
    }

    // 2xx → likely active, but not certain without content check
    if (res.ok) {
      return "active";
    }

    // 403, 429, 5xx, etc. → can't tell
    return "uncertain";
  } catch {
    // Network error, timeout, DNS failure → uncertain
    return "uncertain";
  }
}

// ─── Tier 2: Deep content check ───

const DEAD_SIGNALS = [
  "this job is no longer available",
  "this position has been filled",
  "this job has expired",
  "job has been removed",
  "no longer accepting applications",
  "this listing has expired",
  "position is no longer available",
  "this role has been filled",
  "job posting has been closed",
  "this job posting is no longer active",
  "sorry, this job is no longer available",
  "the job you are looking for is no longer available",
];

const APPLY_BUTTON_PATTERNS = [
  /apply\s*(now|for\s*this|today|here)?/i,
  /submit\s*application/i,
  /<button[^>]*>.*?apply/i,
  /class="[^"]*apply[^"]*"/i,
  /id="[^"]*apply[^"]*"/i,
];

export async function deepCheckJob(
  url: string
): Promise<"active" | "dead"> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; HanapBuhay-HealthCheck/1.0)",
      },
    });

    clearTimeout(timeout);

    if (!res.ok) {
      return "dead";
    }

    const html = await res.text();
    const lowerHtml = html.toLowerCase();

    // Check for dead signals
    for (const signal of DEAD_SIGNALS) {
      if (lowerHtml.includes(signal)) {
        return "dead";
      }
    }

    // Check for apply button as liveness signal
    let hasApplyButton = false;
    for (const pattern of APPLY_BUTTON_PATTERNS) {
      if (pattern.test(html)) {
        hasApplyButton = true;
        break;
      }
    }

    // No apply button found → likely dead
    if (!hasApplyButton) {
      return "dead";
    }

    return "active";
  } catch {
    // If we can't fetch at all during deep check, treat as dead
    return "dead";
  }
}

// ─── Main health check runner ───

const BATCH_SIZE = 20;
const BATCH_DELAY_MS = 3000;

export async function runHealthCheck(
  batchSize: number = BATCH_SIZE
): Promise<HealthCheckResult> {
  const start = Date.now();
  const supabase = createServiceClient();
  const now = new Date();
  let checked = 0;
  let deactivated = 0;
  let stillActive = 0;
  let errors = 0;

  // Step 1: Auto-deactivate jobs older than 60 days
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
  const { data: autoDeactivated } = await supabase
    .from("jobs")
    .update({ is_active: false })
    .eq("is_active", true)
    .lt("posted_at", sixtyDaysAgo.toISOString())
    .select("id");

  deactivated += autoDeactivated?.length || 0;

  // Step 2: Select jobs needing health checks based on age-based priority
  // Jobs < 7 days old → check every 3 days
  // Jobs 7–21 days old → check every 24 hours (highest churn)
  // Jobs 21–45 days old → check every 48 hours
  // Jobs > 45 days (but < 60) → check every 48 hours
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

  // Query jobs that need checking:
  // Either never checked, or checked long enough ago based on their age tier
  const { data: jobsToCheck, error: queryError } = await supabase
    .from("jobs")
    .select("id, apply_url, posted_at, failed_checks, last_health_check_at")
    .eq("is_active", true)
    .gte("posted_at", sixtyDaysAgo.toISOString()) // exclude >60 day (already deactivated)
    .or(
      `last_health_check_at.is.null,last_health_check_at.lt.${threeDaysAgo.toISOString()}`
    )
    .order("last_health_check_at", { ascending: true, nullsFirst: true })
    .limit(batchSize * 5); // fetch extra, we'll filter by tier

  if (queryError) {
    return { checked: 0, deactivated, stillActive: 0, errors: 1, durationMs: Date.now() - start };
  }

  if (!jobsToCheck || jobsToCheck.length === 0) {
    return { checked: 0, deactivated, stillActive: 0, errors: 0, durationMs: Date.now() - start };
  }

  // Filter to jobs that actually need checking based on their age tier
  const needsCheck = jobsToCheck.filter((job) => {
    const lastCheck = job.last_health_check_at
      ? new Date(job.last_health_check_at)
      : null;
    const postedAt = new Date(job.posted_at);
    const ageMs = now.getTime() - postedAt.getTime();
    const ageDays = ageMs / (24 * 60 * 60 * 1000);

    // Never checked → always needs check
    if (!lastCheck) return true;

    if (ageDays < 7) {
      // Check every 3 days
      return lastCheck < threeDaysAgo;
    } else if (ageDays <= 21) {
      // Check every 24 hours (highest churn period)
      return lastCheck < oneDayAgo;
    } else {
      // Check every 48 hours
      return lastCheck < twoDaysAgo;
    }
  });

  // Process in batches
  const toProcess = needsCheck.slice(0, batchSize * 3); // cap total work

  for (let i = 0; i < toProcess.length; i += batchSize) {
    const batch = toProcess.slice(i, i + batchSize);

    const batchResults = await Promise.allSettled(
      batch.map(async (job) => {
        const url = job.apply_url;
        if (!url) {
          return { jobId: job.id, status: "dead" as const, failedChecks: job.failed_checks };
        }

        // Tier 1: Quick HEAD check
        let status = await checkJobUrl(url);

        // Tier 2: If uncertain, do deep check
        if (status === "uncertain") {
          status = await deepCheckJob(url);
        }

        return {
          jobId: job.id,
          status,
          failedChecks: job.failed_checks,
        };
      })
    );

    // Process results
    for (const result of batchResults) {
      if (result.status === "rejected") {
        errors++;
        continue;
      }

      const { jobId, status, failedChecks } = result.value;
      checked++;

      if (status === "dead") {
        const newFailedChecks = (failedChecks || 0) + 1;

        if (newFailedChecks >= 2) {
          // 2 consecutive failures → deactivate
          await supabase
            .from("jobs")
            .update({
              is_active: false,
              last_health_check_at: now.toISOString(),
              failed_checks: newFailedChecks,
            })
            .eq("id", jobId);
          deactivated++;
        } else {
          // First failure → increment counter, don't deactivate yet
          await supabase
            .from("jobs")
            .update({
              last_health_check_at: now.toISOString(),
              failed_checks: newFailedChecks,
            })
            .eq("id", jobId);
          stillActive++;
        }
      } else {
        // Active → reset failed counter
        await supabase
          .from("jobs")
          .update({
            last_health_check_at: now.toISOString(),
            failed_checks: 0,
          })
          .eq("id", jobId);
        stillActive++;
      }
    }

    // Delay between batches to be respectful to job boards
    if (i + batchSize < toProcess.length) {
      await new Promise((r) => setTimeout(r, BATCH_DELAY_MS));
    }
  }

  return {
    checked,
    deactivated,
    stillActive,
    errors,
    durationMs: Date.now() - start,
  };
}
