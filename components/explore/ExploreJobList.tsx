"use client";

import { JobCard } from "@/components/dashboard";
import { useSavedJobs } from "@/lib/hooks/useSavedJobs";
import { Job } from "@/lib/types";

interface ExploreJobListProps {
  jobs: Job[];
  onJobSelect?: (job: Job) => void;
}

export function ExploreJobList({ jobs, onJobSelect }: ExploreJobListProps) {
  const { toggleSave, isSaved } = useSavedJobs();

  if (jobs.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "48px 24px",
          color: "#888",
          fontSize: 12,
          fontFamily: "var(--font-mono)",
          letterSpacing: "0.04em",
          border: "2px solid #0A0A0A",
          background: "#F5F5F0",
        }}
      >
        No jobs match your filters. Try adjusting your search or removing some filters.
      </div>
    );
  }

  return (
    <div className="responsive-grid-2" style={{ gap: 12 }}>
      {jobs.map((job, i) => (
        <JobCard
          key={job.id}
          job={job}
          animationDelay={i * 0.03}
          isSaved={isSaved(job.id)}
          onToggleSave={() => toggleSave(job.id)}
          onViewDetails={onJobSelect}
        />
      ))}
    </div>
  );
}
