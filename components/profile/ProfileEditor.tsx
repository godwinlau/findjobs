"use client";

import { useState } from "react";
import { colors } from "@/lib/constants/colors";
import { Avatar, Badge, Card, Button } from "@/components/ui";
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
} from "@/lib/constants/onboarding";
import { updateProfile } from "@/app/profile/actions";
import type { Profile, SkillProficiency } from "@/lib/types";

// Map old INDUSTRIES label strings → new WORK_CATEGORIES slug values.
// Profiles created before the switch still store labels like "IT / Software".
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
  // Deduplicate and drop unmapped values
  return [...new Set(mapped.filter(Boolean))] as string[];
}

type SectionKey = "work_location" | "skills_proficiency" | "compensation_identity";

interface ProfileEditorProps {
  profile: Profile;
  email: string;
}

function getInitials(name: string): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getLabelForValue(
  options: readonly { value: string; label: string }[],
  value: string | null
): string {
  if (!value) return "—";
  return options.find((o) => o.value === value)?.label ?? value;
}

function formatSalary(amount: number | null): string {
  if (!amount) return "—";
  return `₱${amount.toLocaleString()}`;
}

// ─── Section wrapper ───

function Section({
  title,
  sectionKey,
  editingSection,
  onEdit,
  onCancel,
  onSave,
  saving,
  children,
  editContent,
}: {
  title: string;
  sectionKey: SectionKey;
  editingSection: SectionKey | null;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  saving: boolean;
  children: React.ReactNode;
  editContent: React.ReactNode;
}) {
  const isEditing = editingSection === sectionKey;

  return (
    <Card style={{ marginBottom: 16 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: isEditing ? 16 : 0,
        }}
      >
        <h2
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: colors.text,
            margin: 0,
          }}
        >
          {title}
        </h2>
        {!isEditing && editingSection === null && (
          <Button variant="ghost" size="sm" onClick={onEdit}>
            Edit
          </Button>
        )}
        {isEditing && (
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="outline" size="sm" onClick={onCancel} disabled={saving}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={onSave} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        )}
      </div>
      {isEditing ? editContent : children}
    </Card>
  );
}

// ─── View row ───

function ViewRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div
      className="view-row"
      style={{
        padding: "8px 0",
        borderBottom: `1px solid ${colors.border}`,
      }}
    >
      <span className="view-row-label" style={{ fontSize: 13, color: colors.textMuted }}>
        {label}
      </span>
      <span
        className="view-row-value"
        style={{
          fontSize: 13,
          color: colors.text,
          fontWeight: 500,
        }}
      >
        {value || "—"}
      </span>
    </div>
  );
}

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
          borderRadius: 8,
          border: `1px solid ${colors.border}`,
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
        {WORK_CATEGORIES.map((cat) => {
          const isSelected = selected.includes(cat.value);
          return (
            <button
              key={cat.value}
              type="button"
              onClick={() => toggle(cat.value)}
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
              {cat.icon} {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main component ───

export function ProfileEditor({ profile, email }: ProfileEditorProps) {
  const [editingSection, setEditingSection] = useState<SectionKey | null>(null);
  const [draft, setDraft] = useState<Partial<Profile>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [currentProfile, setCurrentProfile] = useState<Profile>(() => ({
    ...profile,
    preferred_industries: normalizeIndustries(profile.preferred_industries || []),
  }));

  const initials = getInitials(currentProfile.full_name);

  function startEditing(section: SectionKey) {
    setError("");
    setEditingSection(section);

    if (section === "work_location") {
      setDraft({
        preferred_industries: currentProfile.preferred_industries || [],
        employment_type: currentProfile.employment_type,
        preferred_city: currentProfile.preferred_city,
        work_preference: currentProfile.work_preference,
        willing_to_relocate: currentProfile.willing_to_relocate,
      });
    } else if (section === "skills_proficiency") {
      setDraft({
        skills: currentProfile.skills || [],
        skills_learning: currentProfile.skills_learning || [],
        skill_proficiencies: currentProfile.skill_proficiencies || {},
        experience_level: currentProfile.experience_level,
        education: currentProfile.education,
        school: currentProfile.school,
        field_of_study: currentProfile.field_of_study,
      });
    } else if (section === "compensation_identity") {
      setDraft({
        desired_salary_min: currentProfile.desired_salary_min,
        desired_salary_max: currentProfile.desired_salary_max,
        full_name: currentProfile.full_name,
        headline: currentProfile.headline,
      });
    }
  }

  function cancelEditing() {
    setEditingSection(null);
    setDraft({});
    setError("");
  }

  async function saveSection() {
    setSaving(true);
    setError("");

    const result = await updateProfile(draft);

    if (result.error) {
      setError(result.error);
      setSaving(false);
      return;
    }

    // Merge draft into current profile and recalculate completion locally
    setCurrentProfile((prev) => ({ ...prev, ...draft }));
    setEditingSection(null);
    setDraft({});
    setSaving(false);
  }

  // Profile completion bar
  const completionPct = currentProfile.profile_completion ?? 0;

  // Resolve work category labels for view mode
  function getCategoryLabel(value: string): string {
    return WORK_CATEGORIES.find((c) => c.value === value)?.label ?? value;
  }

  return (
    <div
      className="profile-editor-container"
      style={{
        maxWidth: 640,
        margin: "0 auto",
      }}
    >
      {/* ─── Header card ─── */}
      <Card style={{ marginBottom: 24, textAlign: "center", padding: "28px 24px" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          <Avatar initials={initials} size={64} />
          <div>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: colors.text,
                margin: 0,
              }}
            >
              {currentProfile.full_name || "Your Name"}
            </h1>
            {currentProfile.headline && (
              <p
                style={{
                  fontSize: 14,
                  color: colors.textSec,
                  margin: "4px 0 0",
                }}
              >
                {currentProfile.headline}
              </p>
            )}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
            {currentProfile.preferred_city && (
              <Badge variant="muted" size="md">
                {currentProfile.preferred_city}
              </Badge>
            )}
            {currentProfile.work_preference && currentProfile.work_preference !== "any" && (
              <Badge variant="primary" size="md">
                {getLabelForValue(WORK_PREFERENCES, currentProfile.work_preference)}
              </Badge>
            )}
          </div>
          <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
            {email}
          </div>

          {/* Completion bar */}
          <div style={{ width: "100%", maxWidth: 300, marginTop: 8 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 11,
                color: colors.textMuted,
                marginBottom: 4,
              }}
            >
              <span>Profile completion</span>
              <span style={{ fontWeight: 600, color: colors.text }}>{completionPct}%</span>
            </div>
            <div
              style={{
                height: 6,
                borderRadius: 3,
                background: colors.surfaceAlt,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${completionPct}%`,
                  borderRadius: 3,
                  background: colors.primary,
                  transition: "width 0.3s ease",
                }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* ─── Error banner ─── */}
      {error && (
        <div
          style={{
            padding: "10px 14px",
            marginBottom: 16,
            borderRadius: 8,
            background: "#FEF2F2",
            border: `1px solid #FECACA`,
            color: colors.live,
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      {/* ─── Section 1: Work & Location ─── */}
      <Section
        title="Work & Location"
        sectionKey="work_location"
        editingSection={editingSection}
        onEdit={() => startEditing("work_location")}
        onCancel={cancelEditing}
        onSave={saveSection}
        saving={saving}
        editContent={
          <>
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
                    setDraft((d) => ({ ...d, willing_to_relocate: e.target.checked }))
                  }
                  style={{ accentColor: colors.primary }}
                />
                Willing to relocate
              </label>
            </div>
          </>
        }
      >
        <div style={{ marginTop: 8 }}>
          {(currentProfile.preferred_industries || []).length > 0 ? (
            <div style={{ padding: "8px 0", borderBottom: `1px solid ${colors.border}` }}>
              <span
                style={{
                  fontSize: 13,
                  color: colors.textMuted,
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Work categories
              </span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {currentProfile.preferred_industries.map((cat) => (
                  <Badge key={cat} variant="accent" size="sm">
                    {getCategoryLabel(cat)}
                  </Badge>
                ))}
              </div>
            </div>
          ) : (
            <ViewRow label="Work categories" value="—" />
          )}
          <ViewRow
            label="Employment type"
            value={getLabelForValue(EMPLOYMENT_TYPES, currentProfile.employment_type)}
          />
          <ViewRow label="Preferred city" value={currentProfile.preferred_city} />
          <ViewRow
            label="Work preference"
            value={getLabelForValue(WORK_PREFERENCES, currentProfile.work_preference)}
          />
          <ViewRow
            label="Willing to relocate"
            value={currentProfile.willing_to_relocate ? "Yes" : "No"}
          />
        </div>
      </Section>

      {/* ─── Section 2: Skills & Proficiency ─── */}
      <Section
        title="Skills & Proficiency"
        sectionKey="skills_proficiency"
        editingSection={editingSection}
        onEdit={() => startEditing("skills_proficiency")}
        onCancel={cancelEditing}
        onSave={saveSection}
        saving={saving}
        editContent={
          <>
            <SkillChipSelector
              selected={(draft.skills as string[]) || []}
              onChange={(skills) => setDraft((d) => ({ ...d, skills }))}
              proficiencies={(draft.skill_proficiencies as Record<string, SkillProficiency>) ?? {}}
              onProficiencyChange={(proficiencies) =>
                setDraft((d) => ({ ...d, skill_proficiencies: proficiencies }))
              }
              selectedCategories={(draft.preferred_industries as string[]) || currentProfile.preferred_industries || []}
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
                <span style={{ fontSize: 11, fontWeight: 400, color: colors.textMuted, marginLeft: 6 }}>
                  (Track skills you&apos;re developing)
                </span>
              </label>
              <SkillChipSelector
                selected={(draft.skills_learning as string[]) || []}
                onChange={(skills) => setDraft((d) => ({ ...d, skills_learning: skills }))}
                selectedCategories={(draft.preferred_industries as string[]) || currentProfile.preferred_industries || []}
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
                setDraft((d) => ({ ...d, field_of_study: e.target.value || null }))
              }
            />
          </>
        }
      >
        <div style={{ marginTop: 8 }}>
          {(currentProfile.skills || []).length > 0 ? (
            <div style={{ padding: "8px 0", borderBottom: `1px solid ${colors.border}` }}>
              <span
                style={{
                  fontSize: 13,
                  color: colors.textMuted,
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Skills
              </span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {currentProfile.skills.map((skill) => {
                  const proficiency = currentProfile.skill_proficiencies?.[skill];
                  const profLabel = proficiency
                    ? ` (${proficiency[0].toUpperCase()})`
                    : "";
                  return (
                    <Badge key={skill} variant="primary" size="sm">
                      {skill}{profLabel}
                    </Badge>
                  );
                })}
              </div>
            </div>
          ) : (
            <ViewRow label="Skills" value="—" />
          )}
          {(currentProfile.skills_learning || []).length > 0 && (
            <div style={{ padding: "8px 0", borderBottom: `1px solid ${colors.border}` }}>
              <span
                style={{
                  fontSize: 13,
                  color: colors.textMuted,
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Skills I&apos;m Learning
              </span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {(currentProfile.skills_learning || []).map((skill) => (
                  <Badge key={skill} variant="warning" size="sm">
                    📚 {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          <ViewRow
            label="Experience level"
            value={getLabelForValue(EXPERIENCE_LEVELS, currentProfile.experience_level)}
          />
          <ViewRow
            label="Education"
            value={getLabelForValue(EDUCATION_LEVELS, currentProfile.education)}
          />
          <ViewRow label="School" value={currentProfile.school} />
          <ViewRow label="Field of study" value={currentProfile.field_of_study} />
        </div>
      </Section>

      {/* ─── Section 3: Compensation & Identity ─── */}
      <Section
        title="Compensation & Identity"
        sectionKey="compensation_identity"
        editingSection={editingSection}
        onEdit={() => startEditing("compensation_identity")}
        onCancel={cancelEditing}
        onSave={saveSection}
        saving={saving}
        editContent={
          <>
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
          </>
        }
      >
        <div style={{ marginTop: 8 }}>
          <ViewRow
            label="Salary range"
            value={
              currentProfile.desired_salary_min || currentProfile.desired_salary_max
                ? `${formatSalary(currentProfile.desired_salary_min)} – ${formatSalary(currentProfile.desired_salary_max)}`
                : "—"
            }
          />
          <ViewRow label="Name" value={currentProfile.full_name} />
          <ViewRow label="Headline" value={currentProfile.headline} />
        </div>
      </Section>
    </div>
  );
}
