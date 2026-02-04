"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { colors } from "@/lib/constants/colors";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AuthInput } from "@/components/auth/AuthInput";
import { RadioGroup } from "@/components/onboarding/RadioGroup";
import { SkillChipSelector } from "@/components/onboarding/SkillChipSelector";
import { SalaryRangeInput } from "@/components/onboarding/SalaryRangeInput";
import { CITY_OPTIONS } from "@/lib/constants/onboarding";
import { WORK_SETUP_OPTIONS, JOB_TYPE_OPTIONS, JOB_EXPERIENCE_LEVELS } from "@/lib/constants/employer";
import { createJobPosting, updateJobPosting } from "@/app/employer/actions";
import type { JobFormData } from "@/lib/types";

interface JobPostFormProps {
  initialData?: Partial<JobFormData>;
  jobId?: string;
  mode?: "create" | "edit";
}

export function JobPostForm({ initialData, jobId, mode = "create" }: JobPostFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<JobFormData>({
    company_name: initialData?.company_name ?? "",
    company_logo_url: initialData?.company_logo_url ?? "",
    title: initialData?.title ?? "",
    description: initialData?.description ?? "",
    apply_url: initialData?.apply_url ?? "",
    experience_level: initialData?.experience_level ?? "",
    skills_required: initialData?.skills_required ?? [],
    salary_min: initialData?.salary_min ?? null,
    salary_max: initialData?.salary_max ?? null,
    location_city: initialData?.location_city ?? "",
    location_area: initialData?.location_area ?? "",
    work_setup: initialData?.work_setup ?? "",
    job_type: initialData?.job_type ?? "",
    expires_at: initialData?.expires_at ?? "",
  });

  function update(updates: Partial<JobFormData>) {
    setForm((prev) => ({ ...prev, ...updates }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.title.trim()) {
      setError("Job title is required.");
      return;
    }
    if (!form.company_name.trim()) {
      setError("Company name is required.");
      return;
    }
    if (!form.description.trim()) {
      setError("Job description is required.");
      return;
    }
    if (!form.apply_url.trim()) {
      setError("Application URL is required.");
      return;
    }

    setSaving(true);

    try {
      const result =
        mode === "edit" && jobId
          ? await updateJobPosting(jobId, form)
          : await createJobPosting(form);

      if (result?.error) {
        setError(result.error);
        setSaving(false);
        return;
      }

      router.push("/employer");
    } catch {
      setError("Something went wrong. Please try again.");
      setSaving(false);
    }
  }

  const sectionStyle = {
    marginBottom: 28,
    paddingBottom: 24,
    borderBottom: `1px solid ${colors.border}`,
  };

  const sectionTitle = (text: string) => (
    <div
      style={{
        fontSize: 14,
        fontWeight: 600,
        color: colors.text,
        marginBottom: 16,
      }}
    >
      {text}
    </div>
  );

  return (
    <Card padding="lg" style={{ maxWidth: 680, margin: "0 auto" }}>
      <div
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: colors.text,
          marginBottom: 24,
        }}
      >
        {mode === "edit" ? "Edit Job Posting" : "Create Job Posting"}
      </div>

      {error && (
        <div
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            background: "#FEF2F2",
            border: "1px solid #FECACA",
            color: colors.live,
            fontSize: 13,
            marginBottom: 16,
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Company Info */}
        <div style={sectionStyle}>
          {sectionTitle("Company Info")}
          <AuthInput
            label="Company name"
            value={form.company_name}
            onChange={(e) => update({ company_name: e.target.value })}
            placeholder="e.g. Accenture Philippines"
          />
          <AuthInput
            label="Company logo URL (optional)"
            value={form.company_logo_url}
            onChange={(e) => update({ company_logo_url: e.target.value })}
            placeholder="https://example.com/logo.png"
          />
        </div>

        {/* Job Details */}
        <div style={sectionStyle}>
          {sectionTitle("Job Details")}
          <AuthInput
            label="Job title"
            value={form.title}
            onChange={(e) => update({ title: e.target.value })}
            placeholder="e.g. Customer Support Representative"
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
              Job description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => update({ description: e.target.value })}
              placeholder="Describe the role, responsibilities, and what a typical day looks like..."
              rows={8}
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
                resize: "vertical",
                fontFamily: "inherit",
              }}
            />
          </div>
          <AuthInput
            label="Application URL"
            value={form.apply_url}
            onChange={(e) => update({ apply_url: e.target.value })}
            placeholder="https://careers.company.com/apply"
          />
        </div>

        {/* Requirements */}
        <div style={sectionStyle}>
          {sectionTitle("Requirements")}
          <RadioGroup
            label="Experience level"
            options={JOB_EXPERIENCE_LEVELS}
            value={form.experience_level}
            onChange={(v) => update({ experience_level: v })}
          />
          <SkillChipSelector
            selected={form.skills_required}
            onChange={(skills) => update({ skills_required: skills })}
          />
        </div>

        {/* Compensation & Location */}
        <div style={sectionStyle}>
          {sectionTitle("Compensation & Location")}
          <SalaryRangeInput
            label="Salary range (monthly)"
            min={form.salary_min}
            max={form.salary_max}
            onMinChange={(v) => update({ salary_min: v })}
            onMaxChange={(v) => update({ salary_max: v })}
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
              City
            </label>
            <select
              value={form.location_city}
              onChange={(e) => update({ location_city: e.target.value })}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: `1px solid ${colors.border}`,
                background: colors.surface,
                fontSize: 14,
                color: form.location_city ? colors.text : colors.textMuted,
                outline: "none",
                boxSizing: "border-box",
              }}
            >
              <option value="">Select a city</option>
              {CITY_OPTIONS.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
          <AuthInput
            label="Area / Address (optional)"
            value={form.location_area}
            onChange={(e) => update({ location_area: e.target.value })}
            placeholder="e.g. 5th Ave, BGC"
          />
        </div>

        {/* Work Setup & Type */}
        <div style={sectionStyle}>
          {sectionTitle("Work Setup & Type")}
          <RadioGroup
            label="Work setup"
            options={WORK_SETUP_OPTIONS}
            value={form.work_setup}
            onChange={(v) => update({ work_setup: v })}
          />
          <RadioGroup
            label="Job type"
            options={JOB_TYPE_OPTIONS}
            value={form.job_type}
            onChange={(v) => update({ job_type: v })}
          />
        </div>

        {/* Expiration */}
        <div style={{ marginBottom: 28 }}>
          {sectionTitle("Expiration (optional)")}
          <AuthInput
            label="Expires on"
            type="date"
            value={form.expires_at}
            onChange={(e) => update({ expires_at: e.target.value })}
          />
        </div>

        {/* Actions */}
        <div
          className="responsive-row-reverse"
          style={{
            justifyContent: "flex-end",
            gap: 12,
            paddingTop: 20,
            borderTop: `1px solid ${colors.border}`,
          }}
        >
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => router.push("/employer")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={saving}
            style={saving ? { opacity: 0.6, cursor: "not-allowed" } : undefined}
          >
            {saving ? "Saving..." : mode === "edit" ? "Update Job" : "Publish Job"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
