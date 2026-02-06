"use client";

import { colors } from "@/lib/constants/colors";
import { RadioGroup } from "./RadioGroup";
import { CITY_OPTIONS, WORK_PREFERENCES } from "@/lib/constants/onboarding";
import type { Profile } from "@/lib/types";

interface StepLocationProps {
  data: Partial<Profile>;
  onChange: (updates: Partial<Profile>) => void;
}

export function StepLocation({ data, onChange }: StepLocationProps) {
  const isRemote = data.work_preference === "remote";

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
        Where do you want to work?
      </h2>
      <p
        style={{
          fontSize: 13,
          color: colors.textSec,
          marginBottom: 24,
        }}
      >
        We&apos;ll prioritize jobs in your area
      </p>

      <RadioGroup
        label="Work setup"
        options={WORK_PREFERENCES}
        value={data.work_preference || "any"}
        onChange={(v) => onChange({ work_preference: v as Profile["work_preference"] })}
      />

      {!isRemote && (
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
            Preferred city *
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
      )}

      <div style={{ marginBottom: 16 }}>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            cursor: "pointer",
            fontSize: 13,
            color: colors.text,
          }}
        >
          <input
            type="checkbox"
            checked={data.willing_to_relocate ?? false}
            onChange={(e) => onChange({ willing_to_relocate: e.target.checked })}
            style={{
              width: 18,
              height: 18,
              accentColor: colors.primary,
              cursor: "pointer",
            }}
          />
          I&apos;m willing to relocate for the right opportunity
        </label>
      </div>
    </div>
  );
}
