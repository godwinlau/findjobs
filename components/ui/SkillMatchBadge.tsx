"use client";

import { colors } from "@/lib/constants/colors";

interface SkillMatchBadgeProps {
  matchedSkills: string[];
  totalRequired: number;
  maxDisplay?: number;
}

export function SkillMatchBadge({
  matchedSkills,
  totalRequired,
  maxDisplay = 3,
}: SkillMatchBadgeProps) {
  if (matchedSkills.length === 0 || totalRequired === 0) return null;

  const displaySkills = matchedSkills.slice(0, maxDisplay);
  const remaining = matchedSkills.length - maxDisplay;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        flexWrap: "wrap",
      }}
    >
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: colors.success,
          display: "flex",
          alignItems: "center",
          gap: 3,
        }}
      >
        <span style={{ fontSize: 10 }}>✓</span>
        {matchedSkills.length}/{totalRequired} skills
      </span>
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        {displaySkills.map((skill, i) => (
          <span
            key={i}
            style={{
              fontSize: 10,
              padding: "2px 6px",
              borderRadius: 4,
              background: colors.successBg,
              color: colors.success,
              fontWeight: 500,
            }}
          >
            {skill}
          </span>
        ))}
        {remaining > 0 && (
          <span
            style={{
              fontSize: 10,
              padding: "2px 6px",
              borderRadius: 4,
              background: colors.surfaceAlt,
              color: colors.textMuted,
              fontWeight: 500,
            }}
          >
            +{remaining}
          </span>
        )}
      </div>
    </div>
  );
}
