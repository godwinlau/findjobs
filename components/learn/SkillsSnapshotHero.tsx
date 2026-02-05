"use client";

import { colors } from "@/lib/constants/colors";
import { Card, Button } from "@/components/ui";
import type { SkillsSnapshot } from "@/lib/types/learn";

interface SkillsSnapshotHeroProps {
  snapshot: SkillsSnapshot;
}

function ProgressRing({
  percentage,
  size,
  strokeWidth,
  color,
}: {
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

const CATEGORY_COLORS: Record<string, string> = {
  "Communication & Soft Skills": colors.primary,
  "Tech & Development": colors.accent,
  "Design & Creative": "#E11D48",
  "Data & Analytics": colors.warning,
  "Business Tools": colors.success,
  "Domain Skills": colors.textSec,
};

export function SkillsSnapshotHero({ snapshot }: SkillsSnapshotHeroProps) {
  return (
    <Card
      variant="highlighted"
      style={{
        display: "flex",
        gap: 24,
        flexWrap: "wrap",
        marginBottom: 20,
      }}
      padding="lg"
      animationDelay={0}
    >
      {/* Left: Ring + CTA */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
          minWidth: 100,
        }}
      >
        <ProgressRing
          percentage={snapshot.overallPercentage}
          size={72}
          strokeWidth={5}
          color={colors.primary}
        />
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: colors.textMuted,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          Skill Score
        </div>
      </div>

      {/* Right: Category bars + recommendation */}
      <div style={{ flex: 1, minWidth: 200, display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: colors.text }}>
          Skills Snapshot
        </div>

        {snapshot.scores.map((score) => {
          const barColor = CATEGORY_COLORS[score.category] || colors.primary;
          // Shorten category names for display
          const shortName = score.category
            .replace("Communication & Soft Skills", "Communication")
            .replace("Tech & Development", "Tech & Dev")
            .replace("Design & Creative", "Design")
            .replace("Data & Analytics", "Data")
            .replace("Business Tools", "Biz Tools")
            .replace("Domain Skills", "Domain");

          return (
            <div key={score.category}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 3,
                }}
              >
                <span style={{ fontSize: 11, color: colors.textSec, fontWeight: 500 }}>
                  {shortName}
                </span>
                <span style={{ fontSize: 11, color: colors.textMuted }}>
                  {score.userCount}/{score.totalCount}
                </span>
              </div>
              <div
                style={{
                  height: 5,
                  borderRadius: 3,
                  background: colors.surfaceAlt,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${score.percentage}%`,
                    borderRadius: 3,
                    background: barColor,
                    transition: "width 0.5s ease",
                    minWidth: score.percentage > 0 ? 4 : 0,
                  }}
                />
              </div>
            </div>
          );
        })}

        {/* Recommendation */}
        <div
          style={{
            marginTop: 4,
            padding: "8px 12px",
            borderRadius: 8,
            background: colors.primaryBg,
            border: `1px solid ${colors.primaryBorder}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: 12, color: colors.primary, fontWeight: 500 }}>
            {snapshot.topRecommendation}
          </span>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              document
                .getElementById("skill-assessments")
                ?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          >
            Start →
          </Button>
        </div>
      </div>
    </Card>
  );
}
