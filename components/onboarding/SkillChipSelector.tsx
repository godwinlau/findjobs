"use client";

import { useState, useMemo } from "react";
import { colors } from "@/lib/constants/colors";
import { SKILL_CATEGORIES } from "@/lib/constants/onboarding";
import { SKILL_AFFINITIES } from "@/lib/constants/skillAffinities";

interface SkillChipSelectorProps {
  selected: string[];
  onChange: (skills: string[]) => void;
  maxSkills?: number;
  minSkills?: number;
}

export function SkillChipSelector({
  selected,
  onChange,
  maxSkills = 10,
  minSkills = 3,
}: SkillChipSelectorProps) {
  const [search, setSearch] = useState("");

  function toggleSkill(skill: string) {
    if (selected.includes(skill)) {
      onChange(selected.filter((s) => s !== skill));
    } else if (selected.length < maxSkills) {
      onChange([...selected, skill]);
    }
  }

  const atMax = selected.length >= maxSkills;

  // Compute suggested skills based on affinity scoring
  const suggestions = useMemo(() => {
    if (selected.length === 0) return [];

    const scores: Record<string, number> = {};
    for (const skill of selected) {
      const affinities = SKILL_AFFINITIES[skill];
      if (!affinities) continue;
      for (const related of affinities) {
        if (!selected.includes(related)) {
          scores[related] = (scores[related] || 0) + 1;
        }
      }
    }

    return Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([skill]) => skill);
  }, [selected]);

  // Counter color
  let counterColor: string = colors.textMuted;
  if (selected.length < minSkills) counterColor = colors.live;
  else if (selected.length >= maxSkills) counterColor = colors.primary;

  const searchLower = search.toLowerCase();

  return (
    <div style={{ marginBottom: 20 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <label
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: colors.text,
          }}
        >
          Skills *
        </label>
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: counterColor,
          }}
        >
          {selected.length} / {maxSkills} selected
        </span>
      </div>

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

      {suggestions.length > 0 && !search && (
        <div style={{ marginBottom: 14 }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: colors.primary,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              marginBottom: 6,
              display: "block",
            }}
          >
            Suggested for you
          </span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {suggestions.map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => toggleSkill(skill)}
                disabled={atMax}
                style={{
                  padding: "5px 10px",
                  borderRadius: 6,
                  border: `1px solid ${atMax ? colors.border : colors.primaryBorder}`,
                  background: atMax ? colors.surfaceAlt : colors.primaryBg,
                  color: atMax ? colors.textMuted : colors.primary,
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: atMax ? "not-allowed" : "pointer",
                  opacity: atMax ? 0.5 : 1,
                  transition: "all 0.15s ease",
                }}
              >
                + {skill}
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
                const isDisabled = !isSelected && atMax;
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    disabled={isDisabled}
                    style={{
                      padding: "5px 10px",
                      borderRadius: 6,
                      border: `1px solid ${isSelected ? colors.primary : colors.border}`,
                      background: isSelected
                        ? colors.primaryBg
                        : isDisabled
                          ? colors.surfaceAlt
                          : colors.surface,
                      color: isSelected
                        ? colors.primary
                        : isDisabled
                          ? colors.textMuted
                          : colors.textSec,
                      fontSize: 12,
                      fontWeight: isSelected ? 500 : 400,
                      cursor: isDisabled ? "not-allowed" : "pointer",
                      opacity: isDisabled ? 0.5 : 1,
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
