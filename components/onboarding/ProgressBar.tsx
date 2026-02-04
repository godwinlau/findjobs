"use client";

import { colors } from "@/lib/constants/colors";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  labels: string[];
}

export function ProgressBar({ currentStep, totalSteps, labels }: ProgressBarProps) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
        {Array.from({ length: totalSteps }, (_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              background: i <= currentStep ? colors.primary : colors.border,
              transition: "background 0.3s ease",
            }}
          />
        ))}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: 12, color: colors.textMuted }}>
          Step {currentStep + 1} of {totalSteps}
        </span>
        <span style={{ fontSize: 12, color: colors.textSec, fontWeight: 500 }}>
          {labels[currentStep]}
        </span>
      </div>
    </div>
  );
}
