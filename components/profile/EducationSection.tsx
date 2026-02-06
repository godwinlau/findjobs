"use client";

import type { Profile } from "@/lib/types";
import { EDUCATION_LEVELS } from "@/lib/constants/onboarding";

function getEducationLabel(value: string | null): string {
  if (!value) return "";
  return EDUCATION_LEVELS.find((e) => e.value === value)?.label ?? value;
}

function getEducationAbbrev(value: string | null): string {
  if (!value) return "?";
  const map: Record<string, string> = {
    high_school: "HS",
    vocational: "VC",
    bachelors: "BS",
    masters: "MS",
    doctorate: "PhD",
  };
  return map[value] ?? "?";
}

interface EducationSectionProps {
  profile: Profile;
}

export function EducationSection({ profile }: EducationSectionProps) {
  if (!profile.education) {
    return (
      <div className="profile-section">
        <div className="profile-section-label">Education</div>
        <div className="profile-empty-state">
          <div className="profile-empty-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          </div>
          <div className="profile-empty-title">Add your education</div>
          <div className="profile-empty-desc">
            Some roles require specific qualifications. Adding education helps
            match you to the right jobs.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-section">
      <div className="profile-section-label">Education</div>
      <div className="edu-card">
        <div className="edu-logo">{getEducationAbbrev(profile.education)}</div>
        <div className="edu-content">
          <div className="edu-degree">{getEducationLabel(profile.education)}</div>
          {profile.school && <div className="edu-school">{profile.school}</div>}
          {profile.field_of_study && (
            <div className="edu-dates">{profile.field_of_study}</div>
          )}
        </div>
      </div>
    </div>
  );
}
