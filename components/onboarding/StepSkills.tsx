"use client";

import { colors } from "@/lib/constants/colors";
import { SkillChipSelector } from "./SkillChipSelector";
import type { Profile, SkillProficiency } from "@/lib/types";

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
        What are your skills?
      </h2>
      <p
        style={{
          fontSize: 13,
          color: colors.textSec,
          marginBottom: 4,
        }}
      >
        Select at least 5 skills and rate your proficiency level
      </p>
      <p
        style={{
          fontSize: 11,
          color: colors.textMuted,
          marginBottom: 24,
        }}
      >
        B = Beginner · I = Intermediate · A = Advanced
      </p>

      <SkillChipSelector
        selected={data.skills || []}
        onChange={(skills) => onChange({ skills })}
        proficiencies={(data.skill_proficiencies as Record<string, SkillProficiency>) ?? {}}
        onProficiencyChange={(proficiencies) => onChange({ skill_proficiencies: proficiencies })}
        selectedCategories={data.preferred_industries || []}
        maxSkills={10}
        minSkills={5}
        showProficiency
      />
    </div>
  );
}
