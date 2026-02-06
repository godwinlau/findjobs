"use client";

import { colors } from "@/lib/constants/colors";
import { AuthInput } from "@/components/auth/AuthInput";
import { RadioGroup } from "./RadioGroup";
import { EXPERIENCE_LEVELS } from "@/lib/constants/onboarding";
import type { Profile } from "@/lib/types";

interface StepExperienceProps {
  data: Partial<Profile>;
  onChange: (updates: Partial<Profile>) => void;
}

export function StepExperience({ data, onChange }: StepExperienceProps) {
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
        How much experience do you have?
      </h2>
      <p
        style={{
          fontSize: 13,
          color: colors.textSec,
          marginBottom: 24,
        }}
      >
        This helps us match you with the right level of roles
      </p>

      <RadioGroup
        label="Experience level *"
        options={EXPERIENCE_LEVELS}
        value={data.experience_level || ""}
        onChange={(v) => onChange({ experience_level: v as Profile["experience_level"] })}
      />

      <AuthInput
        label="Field of study"
        value={data.field_of_study || ""}
        onChange={(e) => onChange({ field_of_study: e.currentTarget.value || null })}
        placeholder='e.g. "Computer Science", "Communications"'
      />
    </div>
  );
}
