import { NextRequest, NextResponse } from "next/server";
import { cleanupExpiredJobs } from "@/lib/ingest";

// Runs daily at 2AM — marks expired listings as inactive

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await cleanupExpiredJobs();

    return NextResponse.json({
      success: true,
      deactivated: result.deactivated,
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
