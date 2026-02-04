"use client";

import { colors } from "@/lib/constants/colors";

interface MatchIndicatorProps {
  percentage: number;
  showLabel?: boolean;
}

export function MatchIndicator({ percentage, showLabel = true }: MatchIndicatorProps) {
  const getColor = () => {
    if (percentage >= 75) return colors.success;
    if (percentage >= 65) return colors.accent;
    return colors.textMuted;
  };

  const getBg = () => {
    if (percentage >= 75) return colors.successBg;
    return colors.surfaceAlt;
  };

  return (
    <div
      style={{
        padding: "4px 9px",
        borderRadius: 6,
        background: getBg(),
        display: "flex",
        alignItems: "center",
        gap: 4,
      }}
    >
      <div
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: getColor(),
        }}
      />
      {showLabel && (
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: percentage >= 75 ? colors.success : colors.textSec,
          }}
        >
          {percentage}%
        </span>
      )}
    </div>
  );
}
