"use client";

import { colors } from "@/lib/constants/colors";
import { SkillChipSelector } from "./SkillChipSelector";
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
        Select your skills — we&apos;ll match them against active job listings
      </p>

      <SkillChipSelector
        selected={data.skills || []}
        onChange={(skills) => onChange({ skills })}
        maxSkills={10}
        minSkills={3}
      />
    </div>
  );
}
