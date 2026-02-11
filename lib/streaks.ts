import { createServiceClient } from "@/lib/supabase-server";
import { logger } from "@/lib/logger";

const log = logger.child({ module: "streaks" });

/**
 * Safety-net cron: resets current_streak to 0 for users who haven't
 * been active since before yesterday (PHT). This handles cases where
 * users don't log in — the display-time freshness check covers the
 * dashboard, but this keeps the DB accurate over time.
 */
export async function resetStaleStreaks(): Promise<{ reset: number }> {
  const supabase = createServiceClient();

  // Yesterday in PHT
  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" })
  );
  now.setDate(now.getDate() - 1);
  const yesterdayPHT = now.toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("profiles")
    .update({ current_streak: 0 })
    .lt("last_activity_date", yesterdayPHT)
    .gt("current_streak", 0)
    .select("id");

  if (error) {
    log.error({ err: error.message }, "resetStaleStreaks error");
    return { reset: 0 };
  }

  return { reset: data?.length ?? 0 };
}
