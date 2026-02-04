"use client";

import { colors } from "@/lib/constants/colors";

interface MarketInsightProps {
  message: string;
}

export function MarketInsight({ message }: MarketInsightProps) {
  return (
    <div style={{ padding: "8px 4px", animation: "fadeUp 0.3s ease 0.38s both" }}>
      <div style={{ fontSize: 11, color: colors.textMuted, lineHeight: 1.6 }}>
        📊{" "}
        <strong style={{ fontWeight: 500, color: colors.textSec }}>
          Market insight:
        </strong>{" "}
        {message}
      </div>
    </div>
  );
}
