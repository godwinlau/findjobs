"use client";

import { Suspense } from "react";
import { colors } from "@/lib/constants/colors";
import { HeroJobCard } from "./HeroJobCard";
import { JobCard } from "./JobCard";
import { SearchBar } from "./SearchBar";
import { Pagination } from "./Pagination";
import { Job } from "@/lib/types";
import { useSavedJobs } from "@/lib/hooks/useSavedJobs";

interface JobFeedProps {
  jobs: Job[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  searchQuery: string;
  isMatchFiltered?: boolean;
}

export function JobFeed({
  jobs,
  total,
  page,
  pageSize,
  totalPages,
  searchQuery,
  isMatchFiltered,
}: JobFeedProps) {
  const { isSaved, toggleSave } = useSavedJobs();

  const topJob = jobs.find((job) => job.isTop);
  const otherJobs = jobs.filter((job) => !job.isTop);

  return (
    <div>
      <Suspense fallback={null}>
        <SearchBar total={total} searchQuery={searchQuery} />
      </Suspense>

      {topJob && (
        <HeroJobCard
          job={topJob}
          isSaved={isSaved(topJob.id)}
          onToggleSave={() => toggleSave(topJob.id)}
        />
      )}

      {jobs.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "48px 16px",
            color: colors.textMuted,
            fontSize: 14,
          }}
        >
          {isMatchFiltered && !searchQuery ? (
            <>
              <p style={{ fontWeight: 600, color: colors.textSec, marginBottom: 4 }}>
                No matching jobs right now
              </p>
              <p>
                Complete your profile to unlock better matches, or try searching
                for specific roles.
              </p>
            </>
          ) : (
            <>
              <p style={{ fontWeight: 600, color: colors.textSec, marginBottom: 4 }}>
                No jobs found
              </p>
              <p>Try a different search term or clear the search.</p>
            </>
          )}
        </div>
      ) : (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              margin: "18px 0 12px",
            }}
          >
            <h3 style={{ fontSize: 13, fontWeight: 600, color: colors.text }}>
              {searchQuery ? "Search results" : "More matches"}
            </h3>
            <span style={{ fontSize: 11, color: colors.textMuted }}>
              {searchQuery
                ? `Page ${page} of ${totalPages}`
                : `${otherJobs.length} more today`}
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {otherJobs.map((job, i) => (
              <JobCard
                key={job.id}
                job={job}
                animationDelay={0.15 + i * 0.05}
                isSaved={isSaved(job.id)}
                onToggleSave={() => toggleSave(job.id)}
              />
            ))}
          </div>

          <Pagination page={page} totalPages={totalPages} />
        </>
      )}
    </div>
  );
}
