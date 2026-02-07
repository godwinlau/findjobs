"use client";

import { useState, useEffect } from "react";
import { colors } from "@/lib/constants/colors";
import { AuthInput } from "@/components/auth/AuthInput";
import { RadioGroup } from "@/components/onboarding/RadioGroup";
import { SkillChipSelector } from "@/components/onboarding/SkillChipSelector";
import { SalaryRangeInput } from "@/components/onboarding/SalaryRangeInput";
import {
  CITY_OPTIONS,
  WORK_PREFERENCES,
  EXPERIENCE_LEVELS,
  EDUCATION_LEVELS,
  EMPLOYMENT_TYPES,
  WORK_CATEGORIES,
  VISIBLE_WORK_CATEGORIES,
} from "@/lib/constants/onboarding";
import { updateProfile } from "@/app/profile/actions";
import type { Profile, SkillProficiency } from "@/lib/types";

// ─── Select input ───
function SelectInput({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly (string | { value: string; label: string })[];
  onChange: (value: string) => void;
}) {
  return (
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
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: 0,
          border: `2px solid ${colors.border}`,
          background: colors.surface,
          fontSize: 14,
          color: colors.text,
          outline: "none",
          boxSizing: "border-box",
        }}
      >
        <option value="">Select...</option>
        {options.map((opt) => {
          const optValue = typeof opt === "string" ? opt : opt.value;
          const optLabel = typeof opt === "string" ? opt : opt.label;
          return (
            <option key={optValue} value={optValue}>
              {optLabel}
            </option>
          );
        })}
      </select>
    </div>
  );
}

// ─── Work category chip selector ───
function WorkCategoryChipSelector({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (categories: string[]) => void;
}) {
  function toggle(value: string) {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  }

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
        Work categories
      </label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {VISIBLE_WORK_CATEGORIES.map((cat) => {
          const isSelected = selected.includes(cat.value);
          return (
            <button
              key={cat.value}
              type="button"
              onClick={() => toggle(cat.value)}
              style={{
                padding: "5px 10px",
                border: `1.5px solid ${isSelected ? "#FBBF24" : "rgba(0,0,0,.12)"}`,
                background: isSelected ? "rgba(251,191,36,.08)" : "transparent",
                color: isSelected ? "#0A0A0A" : "#666",
                fontSize: 12,
                fontWeight: isSelected ? 600 : 400,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {cat.icon} {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Legacy industry normalization ───
const LEGACY_INDUSTRY_MAP: Record<string, string> = {
  "BPO / Outsourcing": "bpo",
  "IT / Software": "tech_it",
  "Banking / Finance": "accounting",
  "Healthcare": "healthcare",
  "Education": "education",
  "Retail / E-commerce": "sales",
  "Manufacturing": "skilled_trade",
  "Real Estate": "admin",
  "Telecommunications": "tech_it",
  "Media / Advertising": "design",
  "Government": "admin",
  "Hospitality / Tourism": "other",
};

const VALID_CATEGORY_VALUES: Set<string> = new Set(WORK_CATEGORIES.map((c) => c.value));

function normalizeIndustries(industries: string[]): string[] {
  const mapped = industries.map((i) => {
    if (VALID_CATEGORY_VALUES.has(i)) return i;
    return LEGACY_INDUSTRY_MAP[i] ?? null;
  });
  return [...new Set(mapped.filter(Boolean))] as string[];
}

// ─── Main drawer ───
interface EditProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile;
  onProfileUpdate: (updated: Partial<Profile>) => void;
}

export function EditProfileDrawer({
  isOpen,
  onClose,
  profile,
  onProfileUpdate,
}: EditProfileDrawerProps) {
  const [draft, setDraft] = useState<Partial<Profile>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Reset draft when drawer opens
  useEffect(() => {
    if (isOpen) {
      setDraft({
        full_name: profile.full_name,
        headline: profile.headline,
        preferred_industries: normalizeIndustries(profile.preferred_industries || []),
        employment_type: profile.employment_type,
        preferred_city: profile.preferred_city,
        work_preference: profile.work_preference,
        willing_to_relocate: profile.willing_to_relocate,
        skills: profile.skills || [],
        skills_learning: profile.skills_learning || [],
        skill_proficiencies: profile.skill_proficiencies || {},
        experience_level: profile.experience_level,
        education: profile.education,
        school: profile.school,
        field_of_study: profile.field_of_study,
        desired_salary_min: profile.desired_salary_min,
        desired_salary_max: profile.desired_salary_max,
      });
      setError("");
    }
  }, [isOpen, profile]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  async function handleSave() {
    setSaving(true);
    setError("");

    const result = await updateProfile(draft);

    if (result.error) {
      setError(result.error);
      setSaving(false);
      return;
    }

    onProfileUpdate(draft);
    setSaving(false);
    onClose();
  }

  return (
    <>
      {/* Overlay */}
      <div
        className={`drawer-overlay${isOpen ? " open" : ""}`}
        onClick={onClose}
      />

      {/* Panel */}
      <div className={`drawer-panel${isOpen ? " open" : ""}`}>
        <div className="drawer-header">
          <span className="drawer-title">Edit Profile</span>
          <button className="drawer-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="drawer-body">
          {error && <div className="drawer-error">{error}</div>}

          {/* Section: Identity */}
          <div className="drawer-section">
            <div className="drawer-section-title">Identity</div>
            <AuthInput
              label="Full name"
              value={draft.full_name || ""}
              onChange={(e) =>
                setDraft((d) => ({ ...d, full_name: e.target.value }))
              }
            />
            <AuthInput
              label="Headline"
              placeholder="e.g. Junior Web Developer"
              value={draft.headline || ""}
              onChange={(e) =>
                setDraft((d) => ({ ...d, headline: e.target.value }))
              }
            />
          </div>

          {/* Section: Work & Location */}
          <div className="drawer-section">
            <div className="drawer-section-title">Work & Location</div>
            <WorkCategoryChipSelector
              selected={(draft.preferred_industries as string[]) || []}
              onChange={(categories) =>
                setDraft((d) => ({ ...d, preferred_industries: categories }))
              }
            />
            <RadioGroup
              label="Employment type"
              options={EMPLOYMENT_TYPES}
              value={draft.employment_type || "full_time"}
              onChange={(val) =>
                setDraft((d) => ({
                  ...d,
                  employment_type: val as Profile["employment_type"],
                }))
              }
            />
            <SelectInput
              label="Preferred city"
              value={draft.preferred_city || ""}
              options={CITY_OPTIONS}
              onChange={(val) =>
                setDraft((d) => ({ ...d, preferred_city: val || null }))
              }
            />
            <RadioGroup
              label="Work preference"
              options={WORK_PREFERENCES}
              value={draft.work_preference || "any"}
              onChange={(val) =>
                setDraft((d) => ({
                  ...d,
                  work_preference: val as Profile["work_preference"],
                }))
              }
            />
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 13,
                  color: colors.text,
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={draft.willing_to_relocate ?? false}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      willing_to_relocate: e.target.checked,
                    }))
                  }
                  style={{ accentColor: "#FBBF24" }}
                />
                Willing to relocate
              </label>
            </div>
          </div>

          {/* Section: Skills & Proficiency */}
          <div className="drawer-section">
            <div className="drawer-section-title">Skills & Proficiency</div>
            <SkillChipSelector
              selected={(draft.skills as string[]) || []}
              onChange={(skills) => setDraft((d) => ({ ...d, skills }))}
              proficiencies={
                (draft.skill_proficiencies as Record<string, SkillProficiency>) ??
                {}
              }
              onProficiencyChange={(proficiencies) =>
                setDraft((d) => ({ ...d, skill_proficiencies: proficiencies }))
              }
              selectedCategories={
                (draft.preferred_industries as string[]) ||
                profile.preferred_industries ||
                []
              }
              showProficiency
            />
            <div style={{ marginTop: 20, marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 500,
                  color: colors.text,
                  marginBottom: 8,
                }}
              >
                Skills I&apos;m Learning
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 400,
                    color: colors.textMuted,
                    marginLeft: 6,
                  }}
                >
                  (Track skills you&apos;re developing)
                </span>
              </label>
              <SkillChipSelector
                selected={(draft.skills_learning as string[]) || []}
                onChange={(skills) =>
                  setDraft((d) => ({ ...d, skills_learning: skills }))
                }
                selectedCategories={
                  (draft.preferred_industries as string[]) ||
                  profile.preferred_industries ||
                  []
                }
                excludeSkills={(draft.skills as string[]) || []}
                variant="learning"
              />
            </div>
            <RadioGroup
              label="Experience level"
              options={EXPERIENCE_LEVELS}
              value={draft.experience_level || ""}
              onChange={(val) =>
                setDraft((d) => ({
                  ...d,
                  experience_level: val as Profile["experience_level"],
                }))
              }
            />
            <SelectInput
              label="Education"
              value={draft.education || ""}
              options={EDUCATION_LEVELS}
              onChange={(val) =>
                setDraft((d) => ({
                  ...d,
                  education: (val || null) as Profile["education"],
                }))
              }
            />
            <AuthInput
              label="School"
              placeholder="e.g. University of the Philippines"
              value={draft.school || ""}
              onChange={(e) =>
                setDraft((d) => ({ ...d, school: e.target.value || null }))
              }
            />
            <AuthInput
              label="Field of study"
              placeholder="e.g. Computer Science"
              value={draft.field_of_study || ""}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  field_of_study: e.target.value || null,
                }))
              }
            />
          </div>

          {/* Section: Compensation */}
          <div className="drawer-section">
            <div className="drawer-section-title">Compensation</div>
            <SalaryRangeInput
              min={draft.desired_salary_min ?? null}
              max={draft.desired_salary_max ?? null}
              onMinChange={(val) =>
                setDraft((d) => ({ ...d, desired_salary_min: val }))
              }
              onMaxChange={(val) =>
                setDraft((d) => ({ ...d, desired_salary_max: val }))
              }
            />
          </div>
        </div>

        <div className="drawer-footer">
          <button
            className="drawer-cancel"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            className="drawer-save"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </>
  );
}
