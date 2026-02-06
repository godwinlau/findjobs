"use client";

import { colors } from "@/lib/constants/colors";

interface MatchIndicatorProps {
  percentage: number;
  matchRange?: [number, number];
  showLabel?: boolean;
  highlight?: string;
  size?: "sm" | "md" | "lg";
}

export function MatchIndicator({
  percentage,
  matchRange,
  showLabel = true,
  highlight,
  size = "md",
}: MatchIndicatorProps) {
  const sizeStyles = {
    sm: { padding: "3px 8px", fontSize: 10 },
    md: { padding: "4px 10px", fontSize: 11 },
    lg: { padding: "6px 12px", fontSize: 12 },
  };

  const s = sizeStyles[size];

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
      <div
        style={{
          padding: s.padding,
          background: "#0A0A0A",
          color: "#F5F5F0",
          display: "flex",
          alignItems: "center",
          gap: 4,
          fontFamily: "var(--font-mono)",
          fontWeight: 700,
          fontSize: s.fontSize,
          textTransform: "uppercase" as const,
        }}
      >
        {showLabel && (
          <span>
            {matchRange ? `${matchRange[0]}–${matchRange[1]}%` : `${percentage}% MATCH`}
          </span>
        )}
      </div>
      {highlight && (
        <span
          style={{
            fontSize: 10,
            fontFamily: "var(--font-mono)",
            color: "#888",
            maxWidth: 120,
            textAlign: "right",
            lineHeight: 1.3,
            textTransform: "uppercase" as const,
          }}
        >
          {highlight}
        </span>
      )}
    </div>
  );
}
