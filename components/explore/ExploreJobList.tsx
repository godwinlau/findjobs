"use client";

import { colors } from "@/lib/constants/colors";
import { JobCard } from "@/components/dashboard";
import { useSavedJobs } from "@/lib/hooks/useSavedJobs";
import { Job } from "@/lib/types";

interface ExploreJobListProps {
  jobs: Job[];
}

export function ExploreJobList({ jobs }: ExploreJobListProps) {
  const { toggleSave, isSaved } = useSavedJobs();

  if (jobs.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "48px 24px",
          color: colors.textMuted,
          fontSize: 14,
        }}
      >
        No jobs match your filters. Try adjusting your search or removing some filters.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {jobs.map((job, i) => (
        <JobCard
          key={job.id}
          job={job}
          animationDelay={i * 0.03}
          isSaved={isSaved(job.id)}
          onToggleSave={() => toggleSave(job.id)}
        />
      ))}
    </div>
  );
}
