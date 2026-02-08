"use client";

import Link from "next/link";
import { Target } from "@phosphor-icons/react";
import { HeroJobCard } from "./HeroJobCard";
import { JobCard } from "./JobCard";
import { Job } from "@/lib/types";
import { useSavedJobs } from "@/lib/hooks/useSavedJobs";

interface TopMatchesPreviewProps {
  topJob: Job | null;
  otherJobs: Job[];
  totalMatches: number;
  lastUpdated?: string | null;
  onJobSelect?: (job: Job) => void;
}

function formatLastUpdated(isoDate: string | null | undefined): string | null {
  if (!isoDate) return null;
  const now = Date.now();
  const then = new Date(isoDate).getTime();
  const diffMs = now - then;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "1d ago";
  return `${days}d ago`;
}

export function TopMatchesPreview({
  topJob,
  otherJobs,
  totalMatches,
  lastUpdated,
  onJobSelect,
}: TopMatchesPreviewProps) {
  const { isSaved, toggleSave } = useSavedJobs();
  const freshnessLabel = formatLastUpdated(lastUpdated);
  const displayCount = (topJob ? 1 : 0) + otherJobs.length;

  if (!topJob && otherJobs.length === 0) {
    return (
      <div
        style={{
          marginTop: 24,
          padding: "40px 32px",
          background: "#F5F5F0",
          border: "2px solid #0A0A0A",
          textAlign: "center",
          animation: "slam 0.4s cubic-bezier(.22,1,.36,1) 0.3s both",
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            background: "#0A0A0A",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
          }}
        >
          <Target size={28} weight="fill" color="#FBBF24" />
        </div>
        <div
          style={{
            fontSize: 16,
            fontWeight: 800,
            color: "#0A0A0A",
            marginBottom: 8,
            letterSpacing: "-0.02em",
          }}
        >
          No personalized matches yet
        </div>
        <div
          style={{
            fontSize: 13,
            color: "#888",
            marginBottom: 24,
            lineHeight: 1.5,
          }}
        >
          Complete your profile to see jobs that match your skills and
          preferences
        </div>
        <Link
          href="/profile"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 24px",
            fontSize: 12,
            fontWeight: 700,
            fontFamily: "var(--font-mono)",
            textTransform: "uppercase" as const,
            letterSpacing: "0.04em",
            background: "#0A0A0A",
            color: "#F5F5F0",
            textDecoration: "none",
            border: "2px solid #0A0A0A",
            transition: "all 0.15s ease",
          }}
        >
          Complete profile &#8594;
        </Link>
      </div>
    );
  }

  return (
    <div
      style={{
        marginTop: 24,
        animation: "slam 0.4s cubic-bezier(.22,1,.36,1) 0.3s both",
      }}
    >
      {/* Section header */}
      <div className="matches-header">
        <div className="matches-label">// personalized for you</div>
        <div className="matches-title">Top Matches</div>
        <div className="matches-subtitle">
          {displayCount} highly compatible role{displayCount !== 1 ? "s" : ""}
          {freshnessLabel ? ` \u00b7 Updated ${freshnessLabel}` : ""}
        </div>
      </div>

      {/* Info banner */}
      <div className="matches-info">
        <div className="matches-info-text">
          Showing <span>{totalMatches} highly compatible</span> roles
        </div>
        <Link href="/explore?sort=match" className="matches-info-link">
          See all &#8594;
        </Link>
      </div>

      {/* Wrapper */}
      <div className="matches-wrapper">
        {/* Hero job */}
        {topJob && (
          <HeroJobCard
            job={topJob}
            isSaved={isSaved(topJob.id)}
            onToggleSave={() => toggleSave(topJob.id)}
            onViewDetails={onJobSelect}
          />
        )}

        {/* Other jobs grid */}
        {otherJobs.length > 0 && (
          <div className="jobs-grid">
            {otherJobs.map((job, i) => (
              <JobCard
                key={job.id}
                job={job}
                animationDelay={0.35 + i * 0.05}
                isSaved={isSaved(job.id)}
                onToggleSave={() => toggleSave(job.id)}
                onViewDetails={onJobSelect}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
