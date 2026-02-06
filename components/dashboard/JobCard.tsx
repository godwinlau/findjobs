"use client";

import { useState } from "react";
import { Job } from "@/lib/types";
import { useLogoDominantColor } from "@/lib/hooks/useLogoDominantColor";
import { getSourceBadge, SOURCE_ICONS } from "@/lib/constants/sourceBadge";

interface JobCardProps {
  job: Job;
  animationDelay?: number;
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

export function JobCard({
  job,
  animationDelay = 0,
  isSaved = false,
  onToggleSave,
  onViewDetails,
}: JobCardProps) {
  const [imgError, setImgError] = useState(false);
  const logoBg = useLogoDominantColor(job.logoUrl, job.logoBg);
  const isDisclosed = job.salary !== "Salary not disclosed";
  const sourceBadge = getSourceBadge(job.source, "std");

  const tags: string[] = [];
  if (job.type) job.type.split(" · ").forEach((t) => tags.push(t.trim()));

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("a") || target.closest("button")) return;
    onViewDetails?.(job);
  };

  return (
    <article
      onClick={handleCardClick}
      style={{
        background: "#F5F5F0",
        border: "2px solid #0A0A0A",
        padding: 24,
        display: "flex",
        flexDirection: "column",
        gap: 14,
        cursor: "pointer",
        position: "relative",
        transition: "all 0.2s ease",
        marginTop: -2,
        animation: `slam 0.4s cubic-bezier(.22,1,.36,1) ${animationDelay}s both`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "#EEEEE8";
        e.currentTarget.style.boxShadow = "6px 6px 0 #0A0A0A";
        e.currentTarget.style.transform = "translate(-3px, -3px)";
        e.currentTarget.style.zIndex = "10";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "#F5F5F0";
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.zIndex = "auto";
      }}
    >
      {/* Top: logo + source | save + match */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 48,
              height: 48,
              border: "2px solid #0A0A0A",
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
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              fontWeight: 700,
              padding: "4px 10px",
              background: "#0A0A0A",
              color: "#F5F5F0",
              textTransform: "uppercase",
            }}
          >
            {job.match}%
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); onToggleSave?.(); }}
            style={{
              width: 36,
              height: 36,
              border: "1.5px solid rgba(0,0,0,0.12)",
              background: "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.15s",
              flexShrink: 0,
            }}
            aria-label={isSaved ? "Unsave job" : "Save job"}
          >
            <svg
              viewBox="0 0 24 24"
              fill={isSaved ? "#0A0A0A" : "none"}
              stroke={isSaved ? "#0A0A0A" : "#ccc"}
              strokeWidth="2"
              style={{ width: 15, height: 15 }}
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Company */}
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          color: "#888",
          letterSpacing: "0.05em",
        }}
      >
        {job.company} — {job.location}
      </div>

      {/* Title */}
      <div
        style={{
          fontSize: 20,
          fontWeight: 800,
          lineHeight: 1.15,
          letterSpacing: "-0.03em",
          color: "#0A0A0A",
        }}
      >
        {job.role}
      </div>

      {/* Description */}
      {job.desc && (
        <p
          style={{
            fontSize: 12.5,
            lineHeight: 1.6,
            color: "#666",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            margin: 0,
          }}
        >
          {job.desc}
        </p>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {tags.map((tag) => (
            <span
              key={tag}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                padding: "4px 8px",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                border: "1px solid rgba(0,0,0,0.12)",
                color: "#888",
                background: "transparent",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Bottom: salary | apply */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginTop: "auto",
          paddingTop: 14,
          borderTop: "2px solid #0A0A0A",
        }}
      >
        <div>
          {isDisclosed ? (
            <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em", color: "#0A0A0A" }}>
              {job.salary}
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  fontWeight: 400,
                  color: "#888",
                  display: "block",
                  marginTop: 2,
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
                color: "#888",
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
              color: "#888",
              textTransform: "uppercase",
              marginTop: 2,
            }}
          >
            {job.posted}
          </div>
        </div>
        <a
          href={job.applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          style={{
            padding: "10px 20px",
            border: "2px solid #0A0A0A",
            background: "transparent",
            color: "#0A0A0A",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            cursor: "pointer",
            transition: "all 0.15s",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#0A0A0A";
            e.currentTarget.style.color = "#F5F5F0";
            e.currentTarget.style.boxShadow = "3px 3px 0 #888";
            e.currentTarget.style.transform = "translate(-2px, -2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#0A0A0A";
            e.currentTarget.style.boxShadow = "none";
            e.currentTarget.style.transform = "none";
          }}
        >
          Apply →
        </a>
      </div>
    </article>
  );
}
