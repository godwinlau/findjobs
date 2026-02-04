"use client";

import { colors } from "@/lib/constants/colors";
import { AuthInput } from "@/components/auth/AuthInput";
import { RadioGroup } from "./RadioGroup";
import {
  CITY_OPTIONS,
  WORK_PREFERENCES,
} from "@/lib/constants/onboarding";
import type { Profile } from "@/lib/types";

interface StepBasicsProps {
  data: Partial<Profile>;
  onChange: (updates: Partial<Profile>) => void;
}

export function StepBasics({ data, onChange }: StepBasicsProps) {
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
        About You
      </h2>
      <p
        style={{
          fontSize: 13,
          color: colors.textSec,
          marginBottom: 24,
        }}
      >
        Let&apos;s start with the basics
      </p>

      <AuthInput
        label="Full name *"
        value={data.full_name || ""}
        onChange={(e) => onChange({ full_name: e.currentTarget.value })}
        placeholder="Juan dela Cruz"
        required
      />

      <AuthInput
        label="Headline"
        value={data.headline || ""}
        onChange={(e) => onChange({ headline: e.currentTarget.value })}
        placeholder='e.g. "Fresh grad seeking marketing role"'
      />

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
          Preferred city
        </label>
        <select
          value={data.preferred_city || ""}
          onChange={(e) => onChange({ preferred_city: e.target.value || null })}
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 8,
            border: `1px solid ${colors.border}`,
            background: colors.surface,
            fontSize: 14,
            color: data.preferred_city ? colors.text : colors.textMuted,
            outline: "none",
            boxSizing: "border-box",
            appearance: "none",
          }}
        >
          <option value="">Select a city</option>
          {CITY_OPTIONS.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>

      <RadioGroup
        label="Work preference"
        options={WORK_PREFERENCES}
        value={data.work_preference || "any"}
        onChange={(v) => onChange({ work_preference: v as Profile["work_preference"] })}
      />
    </div>
  );
}
