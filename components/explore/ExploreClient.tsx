"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { colors } from "@/lib/constants/colors";
import { FilterBar } from "./FilterBar";
import { ExploreJobList } from "./ExploreJobList";
import { Pagination } from "@/components/dashboard";
import type { Job } from "@/lib/types";

interface ExploreClientProps {
  initialJobs: Job[];
  initialTotal: number;
  initialPage: number;
  initialTotalPages: number;
  initialLocations: string[];
  hasProfile: boolean;
  searchQuery: string;
}

const FILTER_KEYS = [
  "workSetup", "jobType", "location", "sort",
  "experienceLevel", "salaryMin", "salaryMax", "datePosted", "verifiedOnly",
] as const;

export function ExploreClient({
  initialJobs,
  initialTotal,
  initialPage,
  initialTotalPages,
  initialLocations,
  hasProfile,
  searchQuery,
}: ExploreClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [locations, setLocations] = useState<string[]>(initialLocations);
  const abortRef = useRef<AbortController | null>(null);

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

  const fetchJobs = useCallback(async (params: URLSearchParams) => {
    // Cancel any in-flight request
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(`/api/explore/jobs?${params.toString()}`, {
        signal: controller.signal,
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setJobs(data.jobs);
      setTotal(data.total);
      setPage(data.page);
      setTotalPages(data.totalPages);
      if (data.locations) setLocations(data.locations);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      console.error("Explore fetch error:", err);
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

    router.replace(`/explore?${params.toString()}`, { scroll: false });
    fetchJobs(params);
  }

  // Sync when searchParams change externally (e.g. SearchBar pushes URL)
  const prevParamsRef = useRef(searchParams.toString());
  useEffect(() => {
    const current = searchParams.toString();
    if (current !== prevParamsRef.current) {
      prevParamsRef.current = current;
      fetchJobs(new URLSearchParams(current));
    }
  }, [searchParams, fetchJobs]);

  return (
    <>
      <FilterBar
        locations={locations}
        hasProfile={hasProfile}
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      <p
        style={{
          fontSize: 12,
          color: colors.textMuted,
          marginBottom: 12,
        }}
      >
        {total} job{total !== 1 ? "s" : ""} found
      </p>

      <ExploreJobList jobs={jobs} />

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

    </>
  );
}
