import { redirect } from "next/navigation";
import { colors } from "@/lib/constants/colors";
import { Navbar } from "@/components/layout";
import { ResponsiveContainer } from "@/components/layout/ResponsiveContainer";
import { SearchBar } from "@/components/dashboard";
import { ExploreClient } from "@/components/explore";
import { getExploreJobs, getExploreJobsCursor, getDistinctLocations } from "@/lib/jobs";
import { createClient } from "@/lib/supabase/server";
import type { ExploreSort } from "@/lib/jobs";

export const dynamic = "force-dynamic";

interface ExplorePageProps {
  searchParams: Promise<{
    q?: string;
    page?: string;
    workSetup?: string;
    jobType?: string;
    experienceLevel?: string;
    location?: string;
    salaryMin?: string;
    salaryMax?: string;
    datePosted?: string;
    verifiedOnly?: string;
    sort?: string;
  }>;
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const [supabase, params] = await Promise.all([createClient(), searchParams]);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Profile fetch can run in parallel with param parsing below
  const profilePromise = supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const query = params.q || "";
  const page = Math.max(1, parseInt(params.page || "1", 10) || 1);
  const workSetup = params.workSetup || undefined;
  const jobType = params.jobType || undefined;
  const experienceLevel = params.experienceLevel || undefined;
  const location = params.location || undefined;
  const salaryMin = params.salaryMin ? parseInt(params.salaryMin, 10) : undefined;
  const salaryMax = params.salaryMax ? parseInt(params.salaryMax, 10) : undefined;
  const datePosted = params.datePosted || undefined;
  const verifiedOnly = params.verifiedOnly === "true" || undefined;
  const sort = (params.sort as ExploreSort) || "recency";

  // Await profile here (was started above in parallel with param parsing)
  const { data: profile } = await profilePromise;

  const isDbSorted = !query && sort !== "match";

  if (isDbSorted) {
    // Cursor-based path for DB-sorted results (recency, salary_desc, salary_asc)
    const [cursorResult, locations] = await Promise.all([
      getExploreJobsCursor({
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
      }),
      getDistinctLocations(),
    ]);

    return (
      <div
        style={{
          minHeight: "100vh",
          background: colors.bg,
          color: colors.text,
        }}
      >
        <Navbar
          fullName={profile?.full_name || user.user_metadata?.full_name || ""}
          email={user.email || ""}
        />

        <ResponsiveContainer>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              marginBottom: 16,
            }}
          >
            Explore Jobs
          </h1>

          <SearchBar
            total={cursorResult.jobs.length}
            searchQuery={query}
            basePath="/explore"
          />

          <ExploreClient
            initialJobs={cursorResult.jobs}
            initialTotal={0}
            initialPage={1}
            initialTotalPages={0}
            initialLocations={locations}
            hasProfile={!!profile}
            searchQuery={query}
            initialNextCursor={cursorResult.nextCursor}
            initialHasMore={cursorResult.hasMore}
          />
        </ResponsiveContainer>
      </div>
    );
  }

  // Offset-based path for match sort and search
  const [jobResult, locations] = await Promise.all([
    getExploreJobs({
      query: query || undefined,
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

  return (
    <div
      style={{
        minHeight: "100vh",
        background: colors.bg,
        color: colors.text,
      }}
    >
      <Navbar
        fullName={profile?.full_name || user.user_metadata?.full_name || ""}
        email={user.email || ""}
      />

      <ResponsiveContainer>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            marginBottom: 16,
          }}
        >
          Explore Jobs
        </h1>

        <SearchBar
          total={jobResult.total}
          searchQuery={query}
          basePath="/explore"
        />

        <ExploreClient
          initialJobs={jobResult.jobs}
          initialTotal={jobResult.total}
          initialPage={jobResult.page}
          initialTotalPages={jobResult.totalPages}
          initialLocations={locations}
          hasProfile={!!profile}
          searchQuery={query}
        />
      </ResponsiveContainer>
    </div>
  );
}
