"use client";

import Link from "next/link";
import { colors } from "@/lib/constants/colors";
import { HeroJobCard } from "./HeroJobCard";
import { JobCard } from "./JobCard";
import { Job } from "@/lib/types";
import { useSavedJobs } from "@/lib/hooks/useSavedJobs";

interface TopMatchesPreviewProps {
  topJob: Job | null;
  otherJobs: Job[];
  totalMatches: number;
}

export function TopMatchesPreview({
  topJob,
  otherJobs,
  totalMatches,
}: TopMatchesPreviewProps) {
  const { isSaved, toggleSave } = useSavedJobs();

  if (!topJob && otherJobs.length === 0) {
    return (
      <div
        style={{
          marginTop: 24,
          padding: "32px 24px",
          background: colors.surface,
          borderRadius: 14,
          border: `1px solid ${colors.border}`,
          textAlign: "center",
          animation: "fadeUp 0.3s ease 0.3s both",
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 600, color: colors.text, marginBottom: 6 }}>
          No personalized matches yet
        </div>
        <div style={{ fontSize: 13, color: colors.textSec, marginBottom: 16 }}>
          Complete your profile to see personalized job matches
        </div>
        <Link
          href="/profile"
          style={{
            padding: "8px 20px",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            background: colors.primary,
            color: colors.inv,
            textDecoration: "none",
          }}
        >
          Complete profile
        </Link>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 24, animation: "fadeUp 0.3s ease 0.3s both" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 14,
        }}
      >
        <span style={{ fontSize: 15, fontWeight: 700, color: colors.text }}>
          Top Matches for You
        </span>
        <Link
          href="/explore?sort=match"
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: colors.primary,
            textDecoration: "none",
          }}
        >
          {totalMatches > 0 ? `${totalMatches} matches — ` : ""}See all →
        </Link>
      </div>

      {topJob && (
        <HeroJobCard
          job={topJob}
          isSaved={isSaved(topJob.id)}
          onToggleSave={() => toggleSave(topJob.id)}
        />
      )}

      {otherJobs.length > 0 && (
        <div
          className="responsive-grid-2"
          style={{
            gap: 12,
            marginTop: 8,
          }}
        >
          {otherJobs.map((job, i) => (
            <JobCard
              key={job.id}
              job={job}
              animationDelay={0.35 + i * 0.05}
              isSaved={isSaved(job.id)}
              onToggleSave={() => toggleSave(job.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
