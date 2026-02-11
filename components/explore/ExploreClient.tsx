"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FilterBar } from "./FilterBar";
import { ExploreJobList } from "./ExploreJobList";
import { Pagination } from "@/components/dashboard";
import { colors } from "@/lib/constants/colors";
import type { Job } from "@/lib/types";

interface ExploreClientProps {
  initialJobs: Job[];
  initialTotal: number;
  initialPage: number;
  initialTotalPages: number;
  initialLocations: string[];
  hasProfile: boolean;
  searchQuery: string;
  initialNextCursor?: string | null;
  initialHasMore?: boolean;
}

const FILTER_KEYS = [
  "workSetup", "jobType", "location", "sort",
  "experienceLevel", "salaryMin", "salaryMax", "datePosted", "verifiedOnly",
] as const;

/** DB-sorted paths use cursor pagination; match/search use offset. */
function isCursorMode(sort: string, hasQuery: boolean): boolean {
  return !hasQuery && sort !== "match";
}

export function ExploreClient({
  initialJobs,
  initialTotal,
  initialPage,
  initialTotalPages,
  initialLocations,
  hasProfile,
  searchQuery,
  initialNextCursor = null,
  initialHasMore = false,
}: ExploreClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [locations, setLocations] = useState<string[]>(initialLocations);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const abortRef = useRef<AbortController | null>(null);

  const currentSort = searchParams.get("sort") || "recency";
  const currentQuery = searchParams.get("q") || "";
  const useCursor = isCursorMode(currentSort, !!currentQuery);

  const handleJobSelect = useCallback(
    (job: Job) => {
      router.push(`/jobs/${job.id}`);
    },
    [router],
  );

  // Build current filters from URL
  function getFilters(): Record<string, string> {
    const f: Record<string, string> = {};
    for (const key of FILTER_KEYS) {
      const v = searchParams.get(key);
      if (v) f[key] = v;
    }
    return f;
  }

  const filters = getFilters();

  const fetchJobs = useCallback(async (params: URLSearchParams, append = false) => {
    // Cancel any in-flight request
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }

    try {
      const res = await fetch(`/api/explore/jobs?${params.toString()}`, {
        signal: controller.signal,
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();

      if (append) {
        setJobs((prev) => [...prev, ...data.jobs]);
      } else {
        setJobs(data.jobs);
      }

      // Handle both cursor and offset response shapes
      if ("nextCursor" in data) {
        setNextCursor(data.nextCursor);
        setHasMore(data.hasMore);
      } else {
        setNextCursor(null);
        setHasMore(false);
        setTotal(data.total);
        setPage(data.page);
        setTotalPages(data.totalPages);
      }

      if (data.locations) setLocations(data.locations);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      console.error("Explore fetch error:", err);
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    }
  }, []);

  function handleFilterChange(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    params.delete("cursor");

    // Reset accumulated jobs when filters change
    setNextCursor(null);
    setHasMore(false);

    // Mark as already fetched so the useEffect doesn't duplicate
    prevParamsRef.current = params.toString();

    // Update URL without full navigation
    router.replace(`/explore?${params.toString()}`, { scroll: false });

    // Fetch via API
    fetchJobs(params);
  }

  function handlePageChange(p: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (p <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(p));
    }

    // Mark as already fetched so the useEffect doesn't duplicate
    prevParamsRef.current = params.toString();

    router.replace(`/explore?${params.toString()}`, { scroll: false });
    fetchJobs(params);
  }

  function handleLoadMore() {
    if (!nextCursor || isLoadingMore) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("cursor", nextCursor);
    // Don't update URL for load-more (cursor is ephemeral)
    fetchJobs(params, true);
  }

  // Sync when searchParams change externally (e.g. SearchBar pushes URL)
  const prevParamsRef = useRef(searchParams.toString());
  useEffect(() => {
    const current = searchParams.toString();
    if (current !== prevParamsRef.current) {
      prevParamsRef.current = current;
      // Reset cursor state on external URL change
      setNextCursor(null);
      setHasMore(false);
      fetchJobs(new URLSearchParams(current));
    }
  }, [searchParams, fetchJobs]);

  const jobCount = useCursor ? jobs.length : total;

  return (
    <>
      <FilterBar
        locations={locations}
        hasProfile={hasProfile}
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      {/* Loading progress bar */}
      <div style={{ position: "relative", height: 2, marginBottom: 12 }}>
        {isLoading && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                background: colors.primary,
                animation: "loadingBar 1.2s ease-in-out infinite",
              }}
            />
          </div>
        )}
      </div>

      <div
        style={{
          opacity: isLoading ? 0.5 : 1,
          pointerEvents: isLoading ? "none" : "auto",
          transition: "opacity 150ms ease",
        }}
      >
        <p
          style={{
            fontSize: 11,
            fontFamily: "var(--font-mono)",
            textTransform: "uppercase" as const,
            letterSpacing: "0.04em",
            color: "#888",
            marginBottom: 12,
          }}
        >
          {useCursor
            ? `${jobCount} job${jobCount !== 1 ? "s" : ""} loaded`
            : `${total} job${total !== 1 ? "s" : ""} found`}
        </p>

        <ExploreJobList jobs={jobs} onJobSelect={handleJobSelect} />

        {/* Cursor mode: Load More button */}
        {useCursor && hasMore && (
          <div style={{ display: "flex", justifyContent: "center", padding: "24px 0" }}>
            <button
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              style={{
                padding: "10px 32px",
                fontSize: 14,
                fontWeight: 500,
                color: colors.primary,
                background: "transparent",
                border: `1.5px solid ${colors.primary}`,
                borderRadius: 8,
                cursor: isLoadingMore ? "not-allowed" : "pointer",
                opacity: isLoadingMore ? 0.6 : 1,
                transition: "opacity 150ms ease, background 150ms ease",
              }}
              onMouseEnter={(e) => {
                if (!isLoadingMore) (e.target as HTMLButtonElement).style.background = `${colors.primary}10`;
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.background = "transparent";
              }}
            >
              {isLoadingMore ? "Loading..." : "Load more"}
            </button>
          </div>
        )}

        {/* Offset mode: page numbers */}
        {!useCursor && (
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>

    </>
  );
}
