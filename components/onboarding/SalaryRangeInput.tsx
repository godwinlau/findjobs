"use client";

import { colors } from "@/lib/constants/colors";

interface SalaryRangeInputProps {
  min: number | null;
  max: number | null;
  onMinChange: (value: number | null) => void;
  onMaxChange: (value: number | null) => void;
  label?: string;
}

export function SalaryRangeInput({ min, max, onMinChange, onMaxChange, label = "Desired salary range (monthly)" }: SalaryRangeInputProps) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label
        style={{
          display: "block",
          fontSize: 13,
          fontWeight: 500,
          color: colors.text,
          marginBottom: 8,
        }}
      >
        {label}
      </label>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <div style={{ flex: 1, position: "relative" }}>
          <span
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: 13,
              color: colors.textMuted,
            }}
          >
            ₱
          </span>
          <input
            type="number"
            placeholder="Min"
            value={min ?? ""}
            onChange={(e) => onMinChange(e.target.value ? Number(e.target.value) : null)}
            style={{
              width: "100%",
              padding: "10px 12px 10px 26px",
              borderRadius: 8,
              border: `1px solid ${colors.border}`,
              background: colors.surface,
              fontSize: 14,
              color: colors.text,
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
        <span style={{ color: colors.textMuted, fontSize: 13 }}>to</span>
        <div style={{ flex: 1, position: "relative" }}>
          <span
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: 13,
              color: colors.textMuted,
            }}
          >
            ₱
          </span>
          <input
            type="number"
            placeholder="Max"
            value={max ?? ""}
            onChange={(e) => onMaxChange(e.target.value ? Number(e.target.value) : null)}
            style={{
              width: "100%",
              padding: "10px 12px 10px 26px",
              borderRadius: 8,
              border: `1px solid ${colors.border}`,
              background: colors.surface,
              fontSize: 14,
              color: colors.text,
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
      </div>
    </div>
  );
}
