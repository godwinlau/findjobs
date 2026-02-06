"use client";

import { useState, useRef } from "react";
import { Job } from "@/lib/types";
import { useLogoDominantColor } from "@/lib/hooks/useLogoDominantColor";
import { getSourceBadge, SOURCE_ICONS } from "@/lib/constants/sourceBadge";

interface HeroJobCardProps {
  job: Job;
  isSaved?: boolean;
  onToggleSave?: () => void;
  onViewDetails?: (job: Job) => void;
}

function SourceIcon({ source, color }: { source: string; color: string }) {
  const key = source.toLowerCase().trim();
  const d = SOURCE_ICONS[key];
  if (d) {
    return (
      <svg viewBox="0 0 24 24" fill={color} style={{ width: 12, height: 12 }}>
        <path d={d} />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12 }}>
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
    </svg>
  );
}

export function HeroJobCard({ job, isSaved = false, onToggleSave, onViewDetails }: HeroJobCardProps) {
  const [imgError, setImgError] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const logoBg = useLogoDominantColor(job.logoUrl, job.logoBg);
  const isDisclosed = job.salary !== "Salary not disclosed";
  const sourceBadge = getSourceBadge(job.source, "hero");

  const tags: string[] = [];
  if (job.type) job.type.split(" · ").forEach((t) => tags.push(t.trim()));
  if (job.education) tags.push(job.education);

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("a") || target.closest("button")) return;
    onViewDetails?.(job);
  };

  return (
    <div
      ref={cardRef}
      className="hero-card-grid"
      onClick={handleCardClick}
      style={{
        background: "#0A0A0A",
        color: "#F5F5F0",
        border: "2px solid #0A0A0A",
        padding: 40,
        minHeight: 280,
        cursor: "pointer",
        position: "relative",
        transition: "all 0.2s ease",
        animation: "slam 0.4s cubic-bezier(.22,1,.36,1) 0.1s both",
        marginBottom: 12,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "#1A1A1A";
        e.currentTarget.style.boxShadow = "8px 8px 0 #0A0A0A";
        e.currentTarget.style.transform = "translate(-4px, -4px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "#0A0A0A";
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.transform = "none";
      }}
    >
      {/* LEFT COLUMN */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Top row: logo + source + match */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div
            style={{
              width: 48,
              height: 48,
              border: "2px solid rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              fontSize: 20,
              fontWeight: 800,
              background: logoBg,
              color: job.logoColor,
              overflow: "hidden",
            }}
          >
            {job.logoUrl && !imgError ? (
              <img
                src={job.logoUrl}
                alt={job.company}
                onError={() => setImgError(true)}
                style={{ width: 28, height: 28, objectFit: "contain", background: "transparent" }}
              />
            ) : (
              job.logo
            )}
          </div>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "4px 10px",
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              border: "1.5px solid",
              borderColor: sourceBadge.colors.border,
              color: sourceBadge.colors.border,
              background: "transparent",
              lineHeight: 1,
            }}
          >
            <SourceIcon source={job.source} color={sourceBadge.colors.icon} />
            {sourceBadge.label}
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              fontWeight: 700,
              padding: "4px 10px",
              background: "#F5F5F0",
              color: "#0A0A0A",
              textTransform: "uppercase",
            }}
          >
            {job.match}% Match
          </span>
          {job.verified && (
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 9,
                fontWeight: 700,
                padding: "3px 8px",
                background: "#FBBF24",
                color: "#0A0A0A",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              Verified
            </span>
          )}
        </div>

        {/* Company */}
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            color: "rgba(245,245,240,0.4)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          {job.company} — {job.location}
        </div>

        {/* Title */}
        <div
          className="hero-title"
          style={{
            fontSize: 36,
            fontWeight: 800,
            letterSpacing: "-0.04em",
            lineHeight: 1,
            textTransform: "uppercase",
          }}
        >
          {job.role}
        </div>

        {/* Description */}
        {job.desc && (
          <p
            style={{
              fontSize: 14,
              lineHeight: 1.65,
              color: "rgba(245,245,240,0.5)",
              maxWidth: 520,
              margin: 0,
            }}
          >
            {job.desc}
          </p>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {tags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  padding: "4px 8px",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "rgba(255,255,255,0.5)",
                  background: "transparent",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT COLUMN */}
      <div
        className="hero-right"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 16,
          alignSelf: "stretch",
          justifyContent: "space-between",
        }}
      >
        {/* Save */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleSave?.(); }}
          style={{
            width: 36,
            height: 36,
            border: "1.5px solid rgba(255,255,255,0.15)",
            background: "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.15s",
          }}
          aria-label={isSaved ? "Unsave job" : "Save job"}
        >
          <svg
            viewBox="0 0 24 24"
            fill={isSaved ? "#FBBF24" : "none"}
            stroke={isSaved ? "#FBBF24" : "rgba(255,255,255,0.3)"}
            strokeWidth="2"
            style={{ width: 15, height: 15 }}
          >
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        </button>

        {/* Salary + time */}
        <div style={{ textAlign: "right" }}>
          {isDisclosed ? (
            <div
              className="hero-salary"
              style={{
                fontSize: 28,
                fontWeight: 800,
                letterSpacing: "-0.03em",
                lineHeight: 1,
              }}
            >
              {job.salary}
              <span
                style={{
                  display: "block",
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  fontWeight: 400,
                  color: "rgba(245,245,240,0.3)",
                  marginTop: 4,
                  letterSpacing: "0.04em",
                }}
              >
                /mo
              </span>
            </div>
          ) : (
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                color: "rgba(245,245,240,0.3)",
                textTransform: "uppercase",
              }}
            >
              Salary not disclosed
            </div>
          )}
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "rgba(245,245,240,0.25)",
              textAlign: "right",
              marginTop: 4,
              textTransform: "uppercase",
            }}
          >
            {job.posted}
          </div>
        </div>

        {/* Apply */}
        <a
          href={job.applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          style={{
            padding: "14px 32px",
            background: "#F5F5F0",
            color: "#0A0A0A",
            border: "none",
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            cursor: "pointer",
            transition: "all 0.15s",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#FBBF24";
            e.currentTarget.style.boxShadow = "4px 4px 0 rgba(255,255,255,0.2)";
            e.currentTarget.style.transform = "translate(-2px, -2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#F5F5F0";
            e.currentTarget.style.boxShadow = "none";
            e.currentTarget.style.transform = "none";
          }}
        >
          Apply Now →
        </a>
      </div>
    </div>
  );
}
