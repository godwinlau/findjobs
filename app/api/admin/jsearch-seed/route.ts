import { NextRequest, NextResponse } from "next/server";
import { runJSearchIngestion } from "@/lib/jsearch";

// Manual trigger to seed jobs from JSearch (all 35 queries at once).
// Uses ~35 of 200 monthly free-tier requests.
//   POST /api/admin/jsearch-seed

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runJSearchIngestion({ allQueries: true });

    return NextResponse.json({
      success: true,
      ...result,
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
