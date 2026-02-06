"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle, Lightning, Info, WarningCircle } from "@phosphor-icons/react";
import type { ProfileGap } from "@/lib/profile";

interface ProfileCompletionProps {
  percentage: number;
  matchesUnlocked: number;
  profileComplete: boolean;
  gaps: ProfileGap[];
}

const MAX_VISIBLE_GAPS = 3;

const IMPACT_CONFIG: Record<ProfileGap["impact"], { icon: React.ReactNode; bg: string; color: string; borderColor: string; label: string }> = {
  high: {
    icon: <Lightning size={12} weight="fill" />,
    bg: "transparent",
    color: "#FBBF24",
    borderColor: "#FBBF24",
    label: "HIGH IMPACT",
  },
  medium: {
    icon: <WarningCircle size={12} weight="fill" />,
    bg: "transparent",
    color: "#888",
    borderColor: "#888",
    label: "MEDIUM",
  },
  low: {
    icon: <Info size={12} weight="fill" />,
    bg: "transparent",
    color: "#666",
    borderColor: "#666",
    label: "LOW",
  },
};

function ProgressRing({ percentage, size, strokeWidth }: {
  percentage: number;
  size: number;
  strokeWidth: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * ((100 - percentage) / 100);
  const center = size / 2;

  const color: string = percentage >= 80 ? "#6EE7B7" : percentage >= 50 ? "#FBBF24" : "#EF4444";

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(10,10,10,0.08)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="butt"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${center} ${center})`}
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
      </svg>
      <span
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: size * 0.26,
          fontWeight: 800,
          color: "#0A0A0A",
          fontFamily: "var(--font-mono)",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {percentage}
      </span>
    </div>
  );
}

export function ProfileCompletion({
  percentage,
  matchesUnlocked,
  profileComplete,
  gaps,
}: ProfileCompletionProps) {
  if (profileComplete) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          padding: "16px 20px",
          marginBottom: 20,
          background: "#F5F5F0",
          border: "2px solid #0A0A0A",
          animation: "slam 0.4s cubic-bezier(.22,1,.36,1) 0.06s both",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 36,
              height: 36,
              background: "#0A0A0A",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CheckCircle size={20} weight="fill" color="#FBBF24" />
          </div>
          <div>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#0A0A0A", fontFamily: "var(--font-mono)", textTransform: "uppercase" as const, letterSpacing: "0.04em" }}>
              Profile complete
            </span>
            <span style={{ fontSize: 11, color: "#888", marginLeft: 8, fontFamily: "var(--font-mono)", textTransform: "uppercase" as const }}>
              {matchesUnlocked} job{matchesUnlocked !== 1 ? "s" : ""} matched
            </span>
          </div>
        </div>
        <Link
          href="/profile"
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
          View profile
          <ArrowRight size={14} weight="bold" />
        </Link>
      </div>
    );
  }

  const visibleGaps = gaps.slice(0, MAX_VISIBLE_GAPS);
  const remainingCount = gaps.length - visibleGaps.length;

  return (
    <div
      style={{
        marginBottom: 20,
        background: "#F5F5F0",
        border: "2px solid #0A0A0A",
        overflow: "hidden",
        animation: "slam 0.4s cubic-bezier(.22,1,.36,1) 0.06s both",
      }}
    >
      {/* Header */}
      <div
        className="profile-completion-header"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 18,
          padding: "20px 24px",
        }}
      >
        <ProgressRing percentage={percentage} size={56} strokeWidth={4} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#0A0A0A", fontFamily: "var(--font-mono)", textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>
            Profile Strength
          </div>
          <div style={{ fontSize: 12, color: "#888", marginTop: 3, fontFamily: "var(--font-mono)", textTransform: "uppercase" as const }}>
            {visibleGaps.length > 0
              ? `${gaps.length} area${gaps.length !== 1 ? "s" : ""} to improve`
              : "Looking good"}
          </div>
        </div>
      </div>

      {/* Gap list */}
      {visibleGaps.length > 0 && (
        <div
          style={{
            borderTop: "2px solid #0A0A0A",
            padding: "8px 16px",
          }}
        >
          {visibleGaps.map((gap, i) => {
            const config = IMPACT_CONFIG[gap.impact];
            return (
              <div
                key={gap.field}
                style={{
                  display: "flex",
                  gap: 14,
                  alignItems: "flex-start",
                  padding: "14px 8px",
                  borderBottom: i < visibleGaps.length - 1 ? "1px solid rgba(10,10,10,0.08)" : "none",
                }}
              >
                {/* Impact badge */}
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 9,
                    fontWeight: 700,
                    fontFamily: "var(--font-mono)",
                    letterSpacing: "0.04em",
                    textTransform: "uppercase" as const,
                    padding: "4px 8px",
                    background: config.bg,
                    color: config.color,
                    border: `1.5px solid ${config.borderColor}`,
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  {config.icon}
                  {config.label}
                </div>

                {/* Gap text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0A0A0A" }}>
                    {gap.label}
                  </div>
                  <div style={{ fontSize: 12, color: "#888", marginTop: 3, lineHeight: 1.5 }}>
                    {gap.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <div
        className="responsive-row completion-footer-gap profile-completion-footer"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "14px 24px",
          borderTop: "2px solid #0A0A0A",
          background: "rgba(10,10,10,0.03)",
        }}
      >
        <span style={{ fontSize: 11, color: "#888", fontFamily: "var(--font-mono)", textTransform: "uppercase" as const }}>
          {remainingCount > 0
            ? `+ ${remainingCount} more area${remainingCount !== 1 ? "s" : ""}`
            : "Complete for better matches"}
        </span>
        <Link
          href="/profile"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "10px 18px",
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
          <ArrowRight size={14} weight="bold" />
        </Link>
      </div>
    </div>
  );
}
