"use client";

import { colors } from "@/lib/constants/colors";
import { RadioGroup } from "./RadioGroup";
import { WORK_CATEGORIES, EMPLOYMENT_TYPES } from "@/lib/constants/onboarding";
import type { Profile } from "@/lib/types";

interface StepWorkTypeProps {
  data: Partial<Profile>;
  onChange: (updates: Partial<Profile>) => void;
}

export function StepWorkType({ data, onChange }: StepWorkTypeProps) {
  const selected = data.preferred_industries || [];

  function toggleCategory(value: string) {
    if (selected.includes(value)) {
      onChange({ preferred_industries: selected.filter((v) => v !== value) });
    } else {
      onChange({ preferred_industries: [...selected, value] });
    }
  }

  return (
    <div>
      <h2
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: colors.text,
          marginBottom: 4,
        }}
      >
        What kind of work are you looking for?
      </h2>
      <p
        style={{
          fontSize: 13,
          color: colors.textSec,
          marginBottom: 24,
        }}
      >
        Select one or more categories — we&apos;ll tailor your job feed
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 10,
          marginBottom: 24,
        }}
      >
        {WORK_CATEGORIES.map((cat) => {
          const isSelected = selected.includes(cat.value);
          return (
            <button
              key={cat.value}
              type="button"
              onClick={() => toggleCategory(cat.value)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "14px 16px",
                borderRadius: 10,
                border: `2px solid ${isSelected ? colors.primary : colors.border}`,
                background: isSelected ? colors.primaryBg : colors.surface,
                cursor: "pointer",
                transition: "all 0.15s ease",
                textAlign: "left",
              }}
            >
              <span style={{ fontSize: 22 }}>{cat.icon}</span>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: isSelected ? 600 : 450,
                  color: isSelected ? colors.primary : colors.text,
                }}
              >
                {cat.label}
              </span>
            </button>
          );
        })}
      </div>

      <RadioGroup
        label="Employment type"
        options={EMPLOYMENT_TYPES}
        value={data.employment_type || "full_time"}
        onChange={(v) => onChange({ employment_type: v as Profile["employment_type"] })}
      />
    </div>
  );
}
