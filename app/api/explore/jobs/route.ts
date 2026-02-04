import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getExploreJobs, getDistinctLocations } from "@/lib/jobs";
import type { ExploreSort } from "@/lib/jobs";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;

  const query = searchParams.get("q") || undefined;
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
  const workSetup = searchParams.get("workSetup") || undefined;
  const jobType = searchParams.get("jobType") || undefined;
  const experienceLevel = searchParams.get("experienceLevel") || undefined;
  const location = searchParams.get("location") || undefined;
  const salaryMin = searchParams.get("salaryMin") ? parseInt(searchParams.get("salaryMin")!, 10) : undefined;
  const salaryMax = searchParams.get("salaryMax") ? parseInt(searchParams.get("salaryMax")!, 10) : undefined;
  const datePosted = searchParams.get("datePosted") || undefined;
  const verifiedOnly = searchParams.get("verifiedOnly") === "true" || undefined;
  const sort = (searchParams.get("sort") as ExploreSort) || "recency";

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const [jobResult, locations] = await Promise.all([
    getExploreJobs({
      query,
      workSetup,
      jobType,
      experienceLevel,
      location,
      salaryMin,
      salaryMax,
      datePosted,
      verifiedOnly,
      sort,
      page,
      pageSize: 20,
      profile,
    }),
    getDistinctLocations(),
  ]);

  return NextResponse.json({ ...jobResult, locations });
}
