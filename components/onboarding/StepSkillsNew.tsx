"use client";

import { useState, useRef, useMemo } from "react";
import { POPULAR_SKILLS_PH } from "@/lib/constants/onboardingRoles";
import { normalizeSkill } from "@/lib/matching/skills";

interface StepSkillsNewProps {
  skills: string[];
  onSkillsChange: (skills: string[]) => void;
}

export function StepSkillsNew({ skills, onSkillsChange }: StepSkillsNewProps) {
  const [customInput, setCustomInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Normalized lookup: maps normalized label → original stored string
  const normalizedMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of skills) map.set(normalizeSkill(s), s);
    return map;
  }, [skills]);

  function isSelected(skill: string): boolean {
    return normalizedMap.has(normalizeSkill(skill));
  }

  function getStoredName(skill: string): string | undefined {
    return normalizedMap.get(normalizeSkill(skill));
  }

  // Merge popular skills with any custom ones the user added
  const allPills = [
    ...POPULAR_SKILLS_PH,
    ...skills.filter((s) => !POPULAR_SKILLS_PH.some((p) => normalizeSkill(p) === normalizeSkill(s))),
  ];

  function toggleSkill(skill: string) {
    const stored = getStoredName(skill);
    if (stored) {
      onSkillsChange(skills.filter((s) => s !== stored));
    } else {
      onSkillsChange([...skills, skill]);
    }
  }

  function addCustomSkill() {
    const val = customInput.trim();
    if (!val) return;
    if (!isSelected(val)) {
      onSkillsChange([...skills, val]);
    }
    setCustomInput("");
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      addCustomSkill();
    }
  }

  return (
    <div className="ob-main">
      <div className="ob-content">
        <div className="ob-title">
          Pick your <span>skills</span>
        </div>
        <p className="ob-desc">
          Tap everything you know. We&apos;ll match you with jobs that fit.
        </p>

        <div className="ob-field-hint">Popular in the Philippines &darr;</div>

        <div className="ob-pills">
          {allPills.map((skill) => {
            const selected = isSelected(skill);
            return (
              <div
                key={skill}
                className={`ob-pill${selected ? " selected" : ""}`}
                onClick={() => toggleSkill(skill)}
              >
                <span className="ob-pill-check">{"\u2713"}</span>
                {skill}
              </div>
            );
          })}
        </div>

        <div className="ob-custom-row">
          <input
            ref={inputRef}
            className="ob-custom-input"
            type="text"
            placeholder="Don't see yours? Type a skill..."
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button className="ob-custom-add" onClick={addCustomSkill}>
            + Add
          </button>
        </div>
      </div>
    </div>
  );
}
