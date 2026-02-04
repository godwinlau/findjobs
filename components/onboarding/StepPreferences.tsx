"use client";

import { colors } from "@/lib/constants/colors";
import { RadioGroup } from "./RadioGroup";
import { SalaryRangeInput } from "./SalaryRangeInput";
import { EMPLOYMENT_TYPES, INDUSTRIES } from "@/lib/constants/onboarding";
import type { Profile } from "@/lib/types";

interface StepPreferencesProps {
  data: Partial<Profile>;
  onChange: (updates: Partial<Profile>) => void;
}

export function StepPreferences({ data, onChange }: StepPreferencesProps) {
  function toggleIndustry(industry: string) {
    const current = data.preferred_industries || [];
    if (current.includes(industry)) {
      onChange({ preferred_industries: current.filter((i) => i !== industry) });
    } else {
      onChange({ preferred_industries: [...current, industry] });
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
        Job Preferences
      </h2>
      <p
        style={{
          fontSize: 13,
          color: colors.textSec,
          marginBottom: 24,
        }}
      >
        Almost done — tell us what you&apos;re looking for
      </p>

      <SalaryRangeInput
        min={data.desired_salary_min ?? null}
        max={data.desired_salary_max ?? null}
        onMinChange={(v) => onChange({ desired_salary_min: v })}
        onMaxChange={(v) => onChange({ desired_salary_max: v })}
      />

      <RadioGroup
        label="Employment type"
        options={EMPLOYMENT_TYPES}
        value={data.employment_type || "full_time"}
        onChange={(v) => onChange({ employment_type: v as Profile["employment_type"] })}
      />

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
          Preferred industries
        </label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {INDUSTRIES.map((industry) => {
            const selected = (data.preferred_industries || []).includes(industry);
            return (
              <button
                key={industry}
                type="button"
                onClick={() => toggleIndustry(industry)}
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
                {industry}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
