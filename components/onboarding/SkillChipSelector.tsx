"use client";

import { useState } from "react";
import { colors } from "@/lib/constants/colors";
import { SKILL_CATEGORIES } from "@/lib/constants/onboarding";

interface SkillChipSelectorProps {
  selected: string[];
  onChange: (skills: string[]) => void;
}

export function SkillChipSelector({ selected, onChange }: SkillChipSelectorProps) {
  const [search, setSearch] = useState("");

  function toggleSkill(skill: string) {
    if (selected.includes(skill)) {
      onChange(selected.filter((s) => s !== skill));
    } else {
      onChange([...selected, skill]);
    }
  }

  const searchLower = search.toLowerCase();

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
        Skills
      </label>

      <input
        type="text"
        placeholder="Search skills..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          padding: "8px 12px",
          borderRadius: 8,
          border: `1px solid ${colors.border}`,
          background: colors.surface,
          fontSize: 13,
          color: colors.text,
          outline: "none",
          marginBottom: 16,
          boxSizing: "border-box",
        }}
      />

      {selected.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <span style={{ fontSize: 11, color: colors.textMuted, marginBottom: 4, display: "block" }}>
            Selected ({selected.length})
          </span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {selected.map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => toggleSkill(skill)}
                style={{
                  padding: "5px 10px",
                  borderRadius: 6,
                  border: `1px solid ${colors.primary}`,
                  background: colors.primaryBg,
                  color: colors.primary,
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                {skill}
                <span style={{ fontSize: 14, lineHeight: 1 }}>×</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {Object.entries(SKILL_CATEGORIES).map(([category, skills]) => {
        const filteredSkills = search
          ? skills.filter((s) => s.toLowerCase().includes(searchLower))
          : skills;

        if (filteredSkills.length === 0) return null;

        return (
          <div key={category} style={{ marginBottom: 14 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: colors.textMuted,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                marginBottom: 6,
                display: "block",
              }}
            >
              {category}
            </span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {filteredSkills.map((skill) => {
                const isSelected = selected.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    style={{
                      padding: "5px 10px",
                      borderRadius: 6,
                      border: `1px solid ${isSelected ? colors.primary : colors.border}`,
                      background: isSelected ? colors.primaryBg : colors.surface,
                      color: isSelected ? colors.primary : colors.textSec,
                      fontSize: 12,
                      fontWeight: isSelected ? 500 : 400,
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {skill}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
