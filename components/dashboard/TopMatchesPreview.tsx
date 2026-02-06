"use client";

import Link from "next/link";
import { ArrowRight, Target, Clock, Sparkle } from "@phosphor-icons/react";
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
        <div style={{ fontSize: 16, fontWeight: 800, color: "#0A0A0A", marginBottom: 8, letterSpacing: "-0.02em", textTransform: "uppercase" as const }}>
          No personalized matches yet
        </div>
        <div style={{ fontSize: 13, color: "#888", marginBottom: 24, lineHeight: 1.5 }}>
          Complete your profile to see jobs that match your skills and preferences
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
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#FBBF24";
            e.currentTarget.style.color = "#0A0A0A";
            e.currentTarget.style.borderColor = "#FBBF24";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#0A0A0A";
            e.currentTarget.style.color = "#F5F5F0";
            e.currentTarget.style.borderColor = "#0A0A0A";
          }}
        >
          Complete profile
          <ArrowRight size={16} weight="bold" />
        </Link>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 24, animation: "slam 0.4s cubic-bezier(.22,1,.36,1) 0.3s both" }}>
      {/* Section header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 18,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              background: "#FBBF24",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Sparkle size={18} weight="fill" color="#0A0A0A" />
          </div>
          <div>
            <span
              style={{
                fontSize: 14,
                fontWeight: 800,
                color: "#0A0A0A",
                letterSpacing: "-0.02em",
                textTransform: "uppercase" as const,
              }}
            >
              Top Matches for You
            </span>
            {freshnessLabel && (
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                <Clock size={11} weight="fill" color="#888" />
                <span
                  style={{
                    fontSize: 10,
                    fontFamily: "var(--font-mono)",
                    color: "#888",
                    textTransform: "uppercase" as const,
                  }}
                >
                  Updated {freshnessLabel}
                </span>
              </div>
            )}
          </div>
        </div>

        <Link
          href="/explore?sort=match"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 14px",
            fontSize: 11,
            fontWeight: 700,
            fontFamily: "var(--font-mono)",
            textTransform: "uppercase" as const,
            letterSpacing: "0.04em",
            background: "transparent",
            color: "#0A0A0A",
            textDecoration: "none",
            border: "2px solid #0A0A0A",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#0A0A0A";
            e.currentTarget.style.color = "#F5F5F0";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#0A0A0A";
          }}
        >
          {totalMatches > 0 && (
            <span style={{ color: "#FBBF24", fontWeight: 800 }}>{totalMatches}</span>
          )}
          See all matches
          <ArrowRight size={14} weight="bold" />
        </Link>
      </div>

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
        <div
          className="responsive-grid-2"
          style={{
            marginTop: 12,
          }}
        >
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
  );
}
