"use client";

import { colors } from "@/lib/constants/colors";

interface RadioOption {
  value: string;
  label: string;
}

interface RadioGroupProps {
  label: string;
  options: readonly RadioOption[] | RadioOption[];
  value: string;
  onChange: (value: string) => void;
}

export function RadioGroup({ label, options, value, onChange }: RadioGroupProps) {
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
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {options.map((opt) => {
          const selected = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              style={{
                padding: "7px 14px",
                borderRadius: 8,
                border: `1px solid ${selected ? colors.primary : colors.border}`,
                background: selected ? colors.primaryBg : colors.surface,
                color: selected ? colors.primary : colors.textSec,
                fontSize: 13,
                fontWeight: selected ? 600 : 400,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
