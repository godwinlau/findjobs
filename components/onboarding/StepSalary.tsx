"use client";

import { colors } from "@/lib/constants/colors";
import { SalaryRangeInput } from "./SalaryRangeInput";
import type { Profile } from "@/lib/types";

interface StepSalaryProps {
  data: Partial<Profile>;
  onChange: (updates: Partial<Profile>) => void;
}

export function StepSalary({ data, onChange }: StepSalaryProps) {
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
        Expected salary?
      </h2>
      <p
        style={{
          fontSize: 13,
          color: colors.textSec,
          marginBottom: 24,
        }}
      >
        Optional — this helps filter jobs outside your range
      </p>

      <SalaryRangeInput
        min={data.desired_salary_min ?? null}
        max={data.desired_salary_max ?? null}
        onMinChange={(v) => onChange({ desired_salary_min: v })}
        onMaxChange={(v) => onChange({ desired_salary_max: v })}
      />

      <div
        style={{
          padding: "12px 16px",
          borderRadius: 8,
          background: colors.surfaceAlt,
          fontSize: 12,
          color: colors.textMuted,
          lineHeight: 1.6,
        }}
      >
        Salary data comes from job listings and may vary. You can update this anytime in your profile.
      </div>
    </div>
  );
}
