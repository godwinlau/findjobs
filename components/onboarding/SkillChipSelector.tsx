"use client";

import { useState, useMemo } from "react";
import { colors } from "@/lib/constants/colors";
import { VISIBLE_SKILL_CATEGORIES } from "@/lib/constants/onboarding";
import { SKILL_AFFINITIES } from "@/lib/constants/skillAffinities";
import { CATEGORY_SKILL_MAP } from "@/lib/constants/categorySkillMap";
import { SKILL_CLUSTERS } from "@/lib/constants/skillTaxonomy";
import { normalizeSkill } from "@/lib/matching/skills";
import type { SkillProficiency } from "@/lib/types";

interface SkillChipSelectorProps {
  selected: string[];
  onChange: (skills: string[]) => void;
  proficiencies?: Record<string, SkillProficiency>;
  onProficiencyChange?: (proficiencies: Record<string, SkillProficiency>) => void;
  selectedCategories?: string[];
  maxSkills?: number;
  minSkills?: number;
  showProficiency?: boolean;
  excludeSkills?: string[];
  variant?: "default" | "learning";
}

const PROFICIENCY_OPTIONS: { value: SkillProficiency; label: string; short: string }[] = [
  { value: "beginner", label: "Beginner", short: "B" },
  { value: "intermediate", label: "Intermediate", short: "I" },
  { value: "advanced", label: "Advanced", short: "A" },
];

const DEFAULT_VISIBLE = 8;

// Build a lookup from cluster name → icon
const clusterIconMap: Record<string, string> = {};
for (const c of SKILL_CLUSTERS) {
  clusterIconMap[c.name] = c.icon;
}

export function SkillChipSelector({
  selected,
  onChange,
  proficiencies = {},
  onProficiencyChange,
  selectedCategories = [],
  maxSkills = 10,
  minSkills = 5,
  showProficiency = false,
  excludeSkills = [],
  variant = "default",
}: SkillChipSelectorProps) {
  const isLearning = variant === "learning";

  // Normalized lookup: maps normalized label → original stored string
  const normalizedMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of selected) map.set(normalizeSkill(s), s);
    return map;
  }, [selected]);

  function isSelected(skill: string): boolean {
    return normalizedMap.has(normalizeSkill(skill));
  }

  function getStoredName(skill: string): string | undefined {
    return normalizedMap.get(normalizeSkill(skill));
  }

  // Colors for learning variant
  const variantColors = isLearning
    ? {
        selected: colors.warning,
        selectedBg: colors.warningBg,
        selectedBorder: colors.warningBorder,
      }
    : {
        selected: colors.primary,
        selectedBg: colors.primaryBg,
        selectedBorder: colors.primaryBorder,
      };
  const [search, setSearch] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  function toggleSkill(skill: string) {
    const stored = getStoredName(skill);
    if (stored) {
      onChange(selected.filter((s) => s !== stored));
      // Remove proficiency when deselecting
      if (onProficiencyChange) {
        const newProf = { ...proficiencies };
        delete newProf[stored];
        onProficiencyChange(newProf);
      }
    } else if (selected.length < maxSkills) {
      onChange([...selected, skill]);
      // Default to intermediate
      if (onProficiencyChange && !proficiencies[skill]) {
        onProficiencyChange({ ...proficiencies, [skill]: "intermediate" });
      }
    }
  }

  function setProficiency(skill: string, level: SkillProficiency) {
    if (onProficiencyChange) {
      onProficiencyChange({ ...proficiencies, [skill]: level });
    }
  }

  function toggleCategory(category: string) {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  }

  const atMax = selected.length >= maxSkills;

  // Compute smart defaults from selected categories
  const categoryDefaults = useMemo(() => {
    if (selectedCategories.length === 0) return [];
    const all = new Set<string>();
    for (const cat of selectedCategories) {
      const skills = CATEGORY_SKILL_MAP[cat];
      if (skills) {
        for (const s of skills) all.add(s);
      }
    }
    return Array.from(all).filter((s) => !isSelected(s)).slice(0, 8);
  }, [selectedCategories, normalizedMap]);

  // Compute suggested skills based on affinity scoring
  const suggestions = useMemo(() => {
    if (selected.length === 0) return [];

    const scores: Record<string, number> = {};
    for (const skill of selected) {
      // Try exact key first, then find by normalized match
      const affinities = SKILL_AFFINITIES[skill]
        ?? (Object.entries(SKILL_AFFINITIES)
          .find(([k]) => normalizeSkill(k) === normalizeSkill(skill))?.[1] as string[] | undefined);
      if (!affinities) continue;
      for (const related of affinities) {
        if (!isSelected(related)) {
          scores[related] = (scores[related] || 0) + 1;
        }
      }
    }

    return Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([skill]) => skill);
  }, [selected, normalizedMap]);

  // Counter color
  let counterColor: string = colors.textMuted;
  if (selected.length < minSkills) counterColor = colors.live;
  else if (selected.length >= maxSkills) counterColor = variantColors.selected;

  const searchLower = search.toLowerCase();

  // Exclude set for filtering
  const excludeSet = new Set(excludeSkills);

  return (
    <div style={{ marginBottom: 20 }}>
      {!isLearning && (
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
      )}
      {isLearning && selected.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: variantColors.selected,
            }}
          >
            {selected.length} skill{selected.length !== 1 ? "s" : ""} in progress
          </span>
        </div>
      )}

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

      {/* Selected skills with proficiency toggle */}
      {selected.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <span style={{ fontSize: 11, color: colors.textMuted, marginBottom: 4, display: "block" }}>
            Selected ({selected.length})
          </span>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {selected.map((skill) => (
              <div
                key={skill}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <button
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  style={{
                    padding: "5px 10px",
                    borderRadius: 6,
                    border: `1px solid ${variantColors.selected}`,
                    background: variantColors.selectedBg,
                    color: variantColors.selected,
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    flexShrink: 0,
                  }}
                >
                  {isLearning ? "📚 " : ""}{skill}
                  <span style={{ fontSize: 14, lineHeight: 1 }}>×</span>
                </button>
                {showProficiency && onProficiencyChange && (
                  <div style={{ display: "flex", gap: 2 }}>
                    {PROFICIENCY_OPTIONS.map((opt) => {
                      const isActive = (proficiencies[getStoredName(skill) ?? skill] ?? "intermediate") === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          title={opt.label}
                          onClick={() => setProficiency(skill, opt.value)}
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: 5,
                            border: `1px solid ${isActive ? colors.primary : colors.border}`,
                            background: isActive ? colors.primaryBg : colors.surface,
                            color: isActive ? colors.primary : colors.textMuted,
                            fontSize: 10,
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 0.1s ease",
                          }}
                        >
                          {opt.short}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category-based smart defaults */}
      {categoryDefaults.length > 0 && !search && selected.length === 0 && (
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
            Recommended for your categories
          </span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {categoryDefaults.map((skill) => (
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

      {/* Affinity suggestions */}
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

      {/* All skill categories (12 clusters, collapsible) */}
      {Object.entries(VISIBLE_SKILL_CATEGORIES).map(([category, skills]) => {
        // Filter out excluded skills first, then apply search
        const availableSkills = skills.filter((s) => !excludeSet.has(s));
        const filteredSkills = search
          ? availableSkills.filter((s) => s.toLowerCase().includes(searchLower))
          : availableSkills;

        if (filteredSkills.length === 0) return null;

        const isExpanded = expandedCategories.has(category) || !!search;
        const visibleSkills = isExpanded ? filteredSkills : filteredSkills.slice(0, DEFAULT_VISIBLE);
        const hasMore = !isExpanded && filteredSkills.length > DEFAULT_VISIBLE;
        const icon = clusterIconMap[category] ?? "";

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
              {icon && <span style={{ marginRight: 4 }}>{icon}</span>}
              {category}
              <span style={{ fontWeight: 400, textTransform: "none", marginLeft: 4 }}>
                ({filteredSkills.length})
              </span>
            </span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {visibleSkills.map((skill) => {
                const skillIsSelected = isSelected(skill);
                const isDisabled = !skillIsSelected && atMax;
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    disabled={isDisabled}
                    style={{
                      padding: "5px 10px",
                      borderRadius: 6,
                      border: `1px solid ${skillIsSelected ? variantColors.selected : colors.border}`,
                      background: skillIsSelected
                        ? variantColors.selectedBg
                        : isDisabled
                          ? colors.surfaceAlt
                          : colors.surface,
                      color: skillIsSelected
                        ? variantColors.selected
                        : isDisabled
                          ? colors.textMuted
                          : colors.textSec,
                      fontSize: 12,
                      fontWeight: skillIsSelected ? 500 : 400,
                      cursor: isDisabled ? "not-allowed" : "pointer",
                      opacity: isDisabled ? 0.5 : 1,
                      transition: "all 0.15s ease",
                    }}
                  >
                    {isLearning && skillIsSelected ? "📚 " : ""}{skill}
                  </button>
                );
              })}
              {hasMore && (
                <button
                  type="button"
                  onClick={() => toggleCategory(category)}
                  style={{
                    padding: "5px 10px",
                    borderRadius: 6,
                    border: `1px dashed ${colors.border}`,
                    background: "transparent",
                    color: colors.primary,
                    fontSize: 11,
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  +{filteredSkills.length - DEFAULT_VISIBLE} more
                </button>
              )}
              {isExpanded && !search && filteredSkills.length > DEFAULT_VISIBLE && (
                <button
                  type="button"
                  onClick={() => toggleCategory(category)}
                  style={{
                    padding: "5px 10px",
                    borderRadius: 6,
                    border: `1px dashed ${colors.border}`,
                    background: "transparent",
                    color: colors.textMuted,
                    fontSize: 11,
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  Show less
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
