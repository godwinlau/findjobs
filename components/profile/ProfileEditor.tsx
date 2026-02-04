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
  INDUSTRIES,
} from "@/lib/constants/onboarding";
import { updateProfile } from "@/app/profile/actions";
import type { Profile } from "@/lib/types";

type SectionKey = "basics" | "skills" | "preferences";

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

// ─── Industry chip selector ───

function IndustryChipSelector({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (industries: string[]) => void;
}) {
  function toggle(industry: string) {
    if (selected.includes(industry)) {
      onChange(selected.filter((i) => i !== industry));
    } else {
      onChange([...selected, industry]);
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
        Preferred industries
      </label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {INDUSTRIES.map((industry) => {
          const isSelected = selected.includes(industry);
          return (
            <button
              key={industry}
              type="button"
              onClick={() => toggle(industry)}
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
              {industry}
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
  const [currentProfile, setCurrentProfile] = useState<Profile>(profile);

  const initials = getInitials(currentProfile.full_name);

  function startEditing(section: SectionKey) {
    setError("");
    setEditingSection(section);

    if (section === "basics") {
      setDraft({
        full_name: currentProfile.full_name,
        headline: currentProfile.headline,
        preferred_city: currentProfile.preferred_city,
        work_preference: currentProfile.work_preference,
      });
    } else if (section === "skills") {
      setDraft({
        skills: currentProfile.skills || [],
        experience_level: currentProfile.experience_level,
        years_of_experience: currentProfile.years_of_experience,
        education: currentProfile.education,
        field_of_study: currentProfile.field_of_study,
      });
    } else if (section === "preferences") {
      setDraft({
        desired_salary_min: currentProfile.desired_salary_min,
        desired_salary_max: currentProfile.desired_salary_max,
        employment_type: currentProfile.employment_type,
        preferred_industries: currentProfile.preferred_industries || [],
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

      {/* ─── Personal Info ─── */}
      <Section
        title="Personal Info"
        sectionKey="basics"
        editingSection={editingSection}
        onEdit={() => startEditing("basics")}
        onCancel={cancelEditing}
        onSave={saveSection}
        saving={saving}
        editContent={
          <>
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
          </>
        }
      >
        <div style={{ marginTop: 8 }}>
          <ViewRow label="Name" value={currentProfile.full_name} />
          <ViewRow label="Headline" value={currentProfile.headline} />
          <ViewRow label="Preferred city" value={currentProfile.preferred_city} />
          <ViewRow
            label="Work preference"
            value={getLabelForValue(WORK_PREFERENCES, currentProfile.work_preference)}
          />
        </div>
      </Section>

      {/* ─── Skills & Experience ─── */}
      <Section
        title="Skills & Experience"
        sectionKey="skills"
        editingSection={editingSection}
        onEdit={() => startEditing("skills")}
        onCancel={cancelEditing}
        onSave={saveSection}
        saving={saving}
        editContent={
          <>
            <SkillChipSelector
              selected={(draft.skills as string[]) || []}
              onChange={(skills) => setDraft((d) => ({ ...d, skills }))}
            />
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
            <AuthInput
              label="Years of experience"
              type="number"
              min={0}
              max={50}
              value={draft.years_of_experience ?? ""}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  years_of_experience: e.target.value
                    ? Number(e.target.value)
                    : 0,
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
          {(currentProfile.skills || []).length > 0 && (
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
                {currentProfile.skills.map((skill) => (
                  <Badge key={skill} variant="primary" size="sm">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {(currentProfile.skills || []).length === 0 && (
            <ViewRow label="Skills" value="—" />
          )}
          <ViewRow
            label="Experience level"
            value={getLabelForValue(EXPERIENCE_LEVELS, currentProfile.experience_level)}
          />
          <ViewRow
            label="Years of experience"
            value={
              currentProfile.years_of_experience != null
                ? `${currentProfile.years_of_experience} year${currentProfile.years_of_experience !== 1 ? "s" : ""}`
                : null
            }
          />
          <ViewRow
            label="Education"
            value={getLabelForValue(EDUCATION_LEVELS, currentProfile.education)}
          />
          <ViewRow label="Field of study" value={currentProfile.field_of_study} />
        </div>
      </Section>

      {/* ─── Job Preferences ─── */}
      <Section
        title="Job Preferences"
        sectionKey="preferences"
        editingSection={editingSection}
        onEdit={() => startEditing("preferences")}
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
            <IndustryChipSelector
              selected={(draft.preferred_industries as string[]) || []}
              onChange={(industries) =>
                setDraft((d) => ({ ...d, preferred_industries: industries }))
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
          <ViewRow
            label="Employment type"
            value={getLabelForValue(EMPLOYMENT_TYPES, currentProfile.employment_type)}
          />
          {(currentProfile.preferred_industries || []).length > 0 ? (
            <div style={{ padding: "8px 0" }}>
              <span
                style={{
                  fontSize: 13,
                  color: colors.textMuted,
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Preferred industries
              </span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {currentProfile.preferred_industries.map((industry) => (
                  <Badge key={industry} variant="accent" size="sm">
                    {industry}
                  </Badge>
                ))}
              </div>
            </div>
          ) : (
            <ViewRow label="Preferred industries" value="—" />
          )}
        </div>
      </Section>
    </div>
  );
}
