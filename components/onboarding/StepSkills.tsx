"use client";

import { colors } from "@/lib/constants/colors";
import { AuthInput } from "@/components/auth/AuthInput";
import { RadioGroup } from "./RadioGroup";
import { SkillChipSelector } from "./SkillChipSelector";
import { EXPERIENCE_LEVELS, EDUCATION_LEVELS } from "@/lib/constants/onboarding";
import type { Profile } from "@/lib/types";

interface StepSkillsProps {
  data: Partial<Profile>;
  onChange: (updates: Partial<Profile>) => void;
}

export function StepSkills({ data, onChange }: StepSkillsProps) {
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
        Your Skills
      </h2>
      <p
        style={{
          fontSize: 13,
          color: colors.textSec,
          marginBottom: 24,
        }}
      >
        Help us match you with the right jobs
      </p>

      <SkillChipSelector
        selected={data.skills || []}
        onChange={(skills) => onChange({ skills })}
      />

      <RadioGroup
        label="Experience level"
        options={EXPERIENCE_LEVELS}
        value={data.experience_level || "fresh_graduate"}
        onChange={(v) => onChange({ experience_level: v as Profile["experience_level"] })}
      />

      <div style={{ marginBottom: 20 }}>
        <label
          style={{
            display: "block",
            fontSize: 13,
            fontWeight: 500,
            color: colors.text,
            marginBottom: 6,
          }}
        >
          Years of experience
        </label>
        <input
          type="number"
          min={0}
          max={50}
          value={data.years_of_experience ?? 0}
          onChange={(e) => onChange({ years_of_experience: Number(e.target.value) || 0 })}
          style={{
            width: 100,
            padding: "10px 12px",
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

      <div style={{ marginBottom: 16 }}>
        <label
          style={{
            display: "block",
            fontSize: 13,
            fontWeight: 500,
            color: colors.text,
            marginBottom: 6,
          }}
        >
          Education level
        </label>
        <select
          value={data.education || ""}
          onChange={(e) => onChange({ education: (e.target.value || null) as Profile["education"] })}
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 8,
            border: `1px solid ${colors.border}`,
            background: colors.surface,
            fontSize: 14,
            color: data.education ? colors.text : colors.textMuted,
            outline: "none",
            boxSizing: "border-box",
            appearance: "none",
          }}
        >
          <option value="">Select education level</option>
          {EDUCATION_LEVELS.map((lvl) => (
            <option key={lvl.value} value={lvl.value}>
              {lvl.label}
            </option>
          ))}
        </select>
      </div>

      <AuthInput
        label="Field of study"
        value={data.field_of_study || ""}
        onChange={(e) => onChange({ field_of_study: e.currentTarget.value })}
        placeholder='e.g. "Communications"'
      />
    </div>
  );
}
