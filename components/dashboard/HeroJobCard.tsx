"use client";

import { Heart } from "@phosphor-icons/react";
import { colors } from "@/lib/constants/colors";
import { CompanyLogo, Badge } from "@/components/ui";
import { Job } from "@/lib/types";

interface HeroJobCardProps {
  job: Job;
  isSaved?: boolean;
  onToggleSave?: () => void;
}

export function HeroJobCard({ job, isSaved = false, onToggleSave }: HeroJobCardProps) {
  return (
    <div
      style={{
        background: colors.surface,
        borderRadius: 14,
        border: `1px solid ${colors.primaryBorder}`,
        padding: "22px 24px",
        marginBottom: 8,
        position: "relative",
        overflow: "hidden",
        animation: "fadeUp 0.35s ease 0.1s both",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 180,
          height: 180,
          background: `radial-gradient(circle at top right, ${colors.primaryBg}, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 14,
        }}
      >
        <span
          style={{
            padding: "3px 9px",
            borderRadius: 5,
            fontSize: 11,
            fontWeight: 600,
            background: colors.primary,
            color: colors.inv,
          }}
        >
          Best match — {job.match}%
        </span>
        <span style={{ fontSize: 11, color: colors.textMuted }}>
          {job.responseTime}
        </span>
      </div>

      <div
        className="responsive-row hero-card-gap"
        style={{
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
          <CompanyLogo
            letter={job.logo}
            logoUrl={job.logoUrl}
            bgColor={job.logoBg}
            textColor={job.logoColor}
            size="lg"
          />
          <div>
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
                fontSize: 18,
                fontWeight: 700,
                color: colors.text,
                marginTop: 2,
                letterSpacing: "-0.03em",
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
                  <span
                    style={{ fontWeight: 400, fontSize: 11, color: colors.textMuted }}
                  >
                    /mo
                  </span>
                )}
              </span>
              <span style={{ color: colors.border }}>·</span>
              <span style={{ fontSize: 12, color: colors.textSec }}>
                {job.location}
              </span>
              <span style={{ color: colors.border }}>·</span>
              <span style={{ fontSize: 12, color: colors.textSec }}>{job.type}</span>
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
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginTop: 10,
              }}
            >
              {job.highlight && (
                <Badge variant="primary" size="md">
                  ✦ {job.highlight}
                </Badge>
              )}
              <span style={{ fontSize: 11, color: colors.textMuted }}>
                {job.applicants} applicants
              </span>
              <span style={{ fontSize: 11, color: colors.textMuted }}>
                Posted {job.posted}
              </span>
            </div>
          </div>
        </div>

        <div className="hero-card-actions" style={{ display: "flex", gap: 8, flexShrink: 0, alignItems: "center" }}>
          <button
            onClick={() => onToggleSave?.()}
            style={{
              width: 38,
              height: 38,
              borderRadius: 9,
              border: `1px solid ${isSaved ? colors.live : colors.border}`,
              background: isSaved ? "#FEF2F2" : colors.surface,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.15s ease",
              flexShrink: 0,
            }}
          >
            <Heart
              size={20}
              weight={isSaved ? "fill" : "regular"}
              color={isSaved ? colors.live : colors.textMuted}
            />
          </button>
          <a
            href={job.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hero-apply-btn"
            style={{
              padding: "10px 24px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap",
              background: colors.primary,
              color: colors.inv,
              border: "none",
              boxShadow: `0 2px 8px ${colors.primary}20`,
              textDecoration: "none",
              display: "inline-block",
              textAlign: "center",
            }}
          >
            Apply now →
          </a>
        </div>
      </div>
    </div>
  );
}
