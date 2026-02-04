"use client";

import Link from "next/link";
import { colors } from "@/lib/constants/colors";
import { Card, Button } from "@/components/ui";
import type { ProfileGap } from "@/lib/profile";

interface ProfileCompletionProps {
  percentage: number;
  matchesUnlocked: number;
  profileComplete: boolean;
  gaps: ProfileGap[];
}

const MAX_VISIBLE_GAPS = 3;

const IMPACT_STYLES: Record<ProfileGap["impact"], { bg: string; color: string; label: string }> = {
  high: { bg: colors.primaryBg, color: colors.primary, label: "HIGH IMPACT" },
  medium: { bg: colors.warningBg, color: colors.warning, label: "MEDIUM" },
  low: { bg: colors.surfaceAlt, color: colors.textMuted, label: "LOW" },
};

function ProgressRing({ percentage, size, strokeWidth, color }: {
  percentage: number;
  size: number;
  strokeWidth: number;
  color: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * ((100 - percentage) / 100);
  const center = size / 2;

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={colors.border}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </svg>
      <span
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: size * 0.24,
          fontWeight: 800,
          color: colors.text,
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
  // ── Complete state: compact bar ──
  if (profileComplete) {
    return (
      <Card
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          padding: "12px 20px",
          marginBottom: 20,
        }}
        animationDelay={0.06}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <ProgressRing percentage={100} size={30} strokeWidth={2.5} color={colors.success} />
          <span style={{ fontSize: 12, color: colors.textSec }}>
            <strong style={{ color: colors.text }}>Profile complete</strong> —{" "}
            {matchesUnlocked} job{matchesUnlocked !== 1 ? "s" : ""} matched to your profile
          </span>
        </div>
        <Link href="/profile" style={{ textDecoration: "none" }}>
          <Button variant="secondary" size="sm">
            View profile →
          </Button>
        </Link>
      </Card>
    );
  }

  // ── Incomplete state: expanded card with gap analysis ──
  const visibleGaps = gaps.slice(0, MAX_VISIBLE_GAPS);
  const remainingCount = gaps.length - visibleGaps.length;

  return (
    <Card
      style={{ padding: 0, marginBottom: 20, overflow: "hidden" }}
      animationDelay={0.06}
    >
      {/* Header */}
      <div
        className="profile-completion-header"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <ProgressRing percentage={percentage} size={52} strokeWidth={3.5} color={colors.primary} />
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: colors.text }}>
            Profile Strength: {percentage}%
          </div>
          <div style={{ fontSize: 13, color: colors.textSec, marginTop: 2 }}>
            {visibleGaps.length > 0
              ? `${gaps.length} area${gaps.length !== 1 ? "s" : ""} to improve for better matches`
              : "Looking good — keep your profile up to date"}
          </div>
        </div>
      </div>

      {/* Gap list */}
      {visibleGaps.length > 0 && (
        <div
          style={{
            borderTop: `1px solid ${colors.border}`,
            padding: "4px 24px 8px",
          }}
        >
          {visibleGaps.map((gap, i) => {
            const style = IMPACT_STYLES[gap.impact];
            return (
              <div
                key={gap.field}
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "flex-start",
                  padding: "12px 0",
                  borderBottom: i < visibleGaps.length - 1 ? `1px solid ${colors.border}` : "none",
                }}
              >
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                    padding: "3px 7px",
                    borderRadius: 4,
                    background: style.bg,
                    color: style.color,
                    whiteSpace: "nowrap",
                    marginTop: 1,
                    flexShrink: 0,
                  }}
                >
                  {style.label}
                </span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: colors.text }}>
                    {gap.label}
                  </div>
                  <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 2, lineHeight: 1.4 }}>
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
          justifyContent: "space-between",
          borderTop: `1px solid ${colors.border}`,
          background: colors.surfaceAlt,
        }}
      >
        <span style={{ fontSize: 12, color: colors.textMuted }}>
          {remainingCount > 0
            ? `+ ${remainingCount} more area${remainingCount !== 1 ? "s" : ""} to improve`
            : "Each improvement helps surface better job matches"}
        </span>
        <Link href="/profile" style={{ textDecoration: "none" }}>
          <Button variant="primary" size="sm">
            Complete profile →
          </Button>
        </Link>
      </div>
    </Card>
  );
}
