import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getExploreJobs, getExploreJobsCursor, getDistinctLocations } from "@/lib/jobs";
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
  const cursor = searchParams.get("cursor") || undefined;
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

  // Profile + locations in parallel (locations is cached)
  const [{ data: profile }, locations] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    getDistinctLocations(),
  ]);

  // Use cursor-based pagination for DB-sorted paths (no search query, not match sort)
  const isDbSorted = !query && sort !== "match";

  if (isDbSorted) {
    const cursorResult = await getExploreJobsCursor({
      cursor,
      workSetup,
      jobType,
      experienceLevel,
      location,
      salaryMin,
      salaryMax,
      datePosted,
      verifiedOnly,
      sort: sort as "recency" | "salary_desc" | "salary_asc",
      pageSize: 20,
      profile,
    });

    return NextResponse.json({ ...cursorResult, locations });
  }

  // Offset-based for match sort and search-ranked paths
  const jobResult = await getExploreJobs({
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
  });

  return NextResponse.json({ ...jobResult, locations });
}
