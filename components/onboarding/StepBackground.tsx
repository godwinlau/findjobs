"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { colors } from "@/lib/constants/colors";
import { AuthInput } from "@/components/auth/AuthInput";
import { RadioGroup } from "./RadioGroup";
import { EXPERIENCE_LEVELS, EDUCATION_LEVELS } from "@/lib/constants/onboarding";
import { PH_SCHOOLS } from "@/lib/constants/schools";
import type { Profile } from "@/lib/types";

interface StepBackgroundProps {
  data: Partial<Profile>;
  onChange: (updates: Partial<Profile>) => void;
}

export function StepBackground({ data, onChange }: StepBackgroundProps) {
  const [schoolInput, setSchoolInput] = useState(data.school || "");
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filteredSchools = useMemo(() => {
    if (!schoolInput.trim()) return [];
    const query = schoolInput.toLowerCase();
    return PH_SCHOOLS.filter((s) => s.toLowerCase().includes(query)).slice(0, 8);
  }, [schoolInput]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function selectSchool(school: string) {
    setSchoolInput(school);
    onChange({ school });
    setShowDropdown(false);
  }

  function handleSchoolChange(value: string) {
    setSchoolInput(value);
    onChange({ school: value || null });
    setShowDropdown(true);
  }

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
        Background
      </h2>
      <p
        style={{
          fontSize: 13,
          color: colors.textSec,
          marginBottom: 24,
        }}
      >
        Help employers understand your experience
      </p>

      <RadioGroup
        label="Experience level"
        options={EXPERIENCE_LEVELS}
        value={data.experience_level || "fresh_graduate"}
        onChange={(v) => onChange({ experience_level: v as Profile["experience_level"] })}
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
          Education level *
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

      <div ref={wrapperRef} style={{ position: "relative", marginBottom: 16 }}>
        <label
          style={{
            display: "block",
            fontSize: 13,
            fontWeight: 500,
            color: colors.text,
            marginBottom: 6,
          }}
        >
          School
        </label>
        <input
          type="text"
          value={schoolInput}
          onChange={(e) => handleSchoolChange(e.target.value)}
          onFocus={() => schoolInput.trim() && setShowDropdown(true)}
          placeholder="Search or type your school"
          style={{
            width: "100%",
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
        {showDropdown && filteredSchools.length > 0 && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              background: colors.surface,
              border: `1px solid ${colors.border}`,
              borderRadius: 8,
              marginTop: 4,
              maxHeight: 200,
              overflowY: "auto",
              zIndex: 10,
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
          >
            {filteredSchools.map((school) => (
              <button
                key={school}
                type="button"
                onClick={() => selectSchool(school)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "none",
                  background: "transparent",
                  textAlign: "left",
                  fontSize: 13,
                  color: colors.text,
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.surfaceAlt;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                {school}
              </button>
            ))}
          </div>
        )}
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
