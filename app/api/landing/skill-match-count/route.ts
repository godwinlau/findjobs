import { NextRequest, NextResponse } from "next/server";
import { getMatchingJobCount } from "@/lib/data/skill-counts";

export async function GET(request: NextRequest) {
  const skillsParam = request.nextUrl.searchParams.get("skills");

  if (!skillsParam) {
    return NextResponse.json({ count: 0 });
  }

  const skills = skillsParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 20); // cap at 20 skills

  if (skills.length === 0) {
    return NextResponse.json({ count: 0 });
  }

  const count = await getMatchingJobCount(skills);

  return NextResponse.json(
    { count },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300",
      },
    }
  );
}
