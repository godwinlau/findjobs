"use client";

import Link from "next/link";
import { Heart } from "@phosphor-icons/react";
import { colors } from "@/lib/constants/colors";
import { CompanyLogo, MatchIndicator } from "@/components/ui";
import { Job } from "@/lib/types";

interface JobCardProps {
  job: Job;
  animationDelay?: number;
  isSaved?: boolean;
  onToggleSave?: () => void;
}

export function JobCard({
  job,
  animationDelay = 0,
  isSaved = false,
  onToggleSave,
}: JobCardProps) {
  return (
    <div
      className="job-card-padding"
      style={{
        background: colors.surface,
        borderRadius: 14,
        border: `1px solid ${colors.border}`,
        transition: "all 0.12s ease",
        animation: `fadeUp 0.3s ease ${animationDelay}s both`,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 14,
            alignItems: "flex-start",
            flex: 1,
            minWidth: 0,
          }}
        >
          <CompanyLogo
            letter={job.logo}
            logoUrl={job.logoUrl}
            bgColor={job.logoBg}
            textColor={job.logoColor}
            size="lg"
          />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, color: colors.textSec, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
              <span>
                {job.company}
                {job.verified && (
                  <span style={{ color: colors.success, marginLeft: 4 }}>✓</span>
                )}
              </span>
              {job.source === "linkedin" && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 3,
                    padding: "1px 6px",
                    borderRadius: 4,
                    fontSize: 9,
                    fontWeight: 600,
                    background: "#0A66C20F",
                    color: "#0A66C2",
                    letterSpacing: "0.02em",
                  }}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="#0A66C2">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  LinkedIn
                </span>
              )}
            </div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: colors.text,
                marginTop: 3,
                letterSpacing: "-0.02em",
              }}
            >
              {job.role}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginTop: 8,
                flexWrap: "wrap",
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 700, color: colors.success }}>
                {job.salary}
                {job.salary !== "Salary not disclosed" && (
                  <span style={{ fontWeight: 400, fontSize: 11, color: colors.textMuted }}>/mo</span>
                )}
              </span>
              <span style={{ color: colors.border }}>·</span>
              <span style={{ fontSize: 12, color: colors.textMuted }}>
                {job.location}
              </span>
              <span style={{ color: colors.border }}>·</span>
              <span style={{ fontSize: 12, color: colors.textMuted }}>{job.type}</span>
              {job.education && (
                <>
                  <span style={{ color: colors.border }}>·</span>
                  <span
                    style={{
                      fontSize: 11,
                      color: colors.accent,
                      fontWeight: 500,
                    }}
                  >
                    {job.education}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div
          style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}
        >
          <MatchIndicator percentage={job.match} />
        </div>
      </div>

      {/* Description preview — always visible */}
      <div
        style={{
          marginTop: 16,
          paddingTop: 16,
          borderTop: `1px solid ${colors.border}`,
        }}
      >
        <p
          style={{
            fontSize: 13,
            color: colors.textSec,
            lineHeight: 1.75,
            marginBottom: 14,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical" as const,
            overflow: "hidden",
          }}
        >
          {job.desc}
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div className="responsive-gap-sm" style={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, color: colors.textMuted }}>
              {job.applicants} applicants
            </span>
            <span style={{ fontSize: 11, color: colors.textMuted }}>{job.posted}</span>
            {job.responseTime && (
              <span style={{ fontSize: 11, color: colors.textMuted }}>
                {job.responseTime}
              </span>
            )}
            {job.closing && (
              <span
                style={{ fontSize: 11, fontWeight: 600, color: colors.warning }}
              >
                {job.closing}
              </span>
            )}
          </div>
          <div className="responsive-gap-sm" style={{ display: "flex", alignItems: "center" }}>
            <button
              onClick={() => onToggleSave?.()}
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                border: `1px solid ${isSaved ? colors.live : colors.border}`,
                background: isSaved ? "#FEF2F2" : colors.surface,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <Heart
                size={18}
                weight={isSaved ? "fill" : "regular"}
                color={isSaved ? colors.live : colors.textMuted}
              />
            </button>
            <a
              href={job.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="job-card-apply-btn"
              style={{
                borderRadius: 7,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                whiteSpace: "nowrap",
                background: colors.primary,
                color: colors.inv,
                border: "none",
                boxShadow: `0 2px 8px ${colors.primary}20`,
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              Apply
            </a>
            <Link
              href={`/jobs/${job.id}`}
              className="job-card-details-btn"
              style={{
                borderRadius: 7,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                whiteSpace: "nowrap",
                background: colors.surface,
                color: colors.textSec,
                border: `1px solid ${colors.border}`,
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              Details →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
