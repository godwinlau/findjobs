"use client";

import type { Profile } from "@/lib/types";
import {
  WORK_PREFERENCES,
  EXPERIENCE_LEVELS,
  EMPLOYMENT_TYPES,
  WORK_CATEGORIES,
} from "@/lib/constants/onboarding";

function getLabelForValue(
  options: readonly { value: string; label: string }[],
  value: string | null
): string {
  if (!value) return "\u2014";
  return options.find((o) => o.value === value)?.label ?? value;
}

function formatSalary(amount: number | null): string {
  if (!amount) return "\u2014";
  return `\u20B1${amount.toLocaleString()}`;
}

interface JobPreferencesProps {
  profile: Profile;
}

export function JobPreferences({ profile }: JobPreferencesProps) {
  const categoryLabels = (profile.preferred_industries || [])
    .map((v) => WORK_CATEGORIES.find((c) => c.value === v)?.label ?? v)
    .join(", ");

  const salaryRange =
    profile.desired_salary_min || profile.desired_salary_max
      ? `${formatSalary(profile.desired_salary_min)} \u2013 ${formatSalary(profile.desired_salary_max)}`
      : "\u2014";

  return (
    <div className="sb-prefs">
      <div className="sb-title">Job Preferences</div>
      <div className="sb-pref-row">
        <span className="sb-pref-key">Categories</span>
        <span className="sb-pref-val">{categoryLabels || "\u2014"}</span>
      </div>
      <div className="sb-pref-row">
        <span className="sb-pref-key">Location</span>
        <span className="sb-pref-val">{profile.preferred_city || "\u2014"}</span>
      </div>
      <div className="sb-pref-row">
        <span className="sb-pref-key">Type</span>
        <span className="sb-pref-val">
          {getLabelForValue(EMPLOYMENT_TYPES, profile.employment_type)}
        </span>
      </div>
      <div className="sb-pref-row">
        <span className="sb-pref-key">Salary</span>
        <span className="sb-pref-val">{salaryRange}</span>
      </div>
      <div className="sb-pref-row">
        <span className="sb-pref-key">Work Pref</span>
        <span className="sb-pref-val">
          {getLabelForValue(WORK_PREFERENCES, profile.work_preference)}
        </span>
      </div>
      <div className="sb-pref-row">
        <span className="sb-pref-key">Experience</span>
        <span className="sb-pref-val">
          {getLabelForValue(EXPERIENCE_LEVELS, profile.experience_level)}
        </span>
      </div>
    </div>
  );
}
