"use client";

import Link from "next/link";
import type { PublicProfile, PublicSections } from "@/lib/types";
import {
  WORK_PREFERENCES,
  EXPERIENCE_LEVELS,
  EMPLOYMENT_TYPES,
  EDUCATION_LEVELS,
} from "@/lib/constants/onboarding";

function getInitials(name: string): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getLabel(
  options: readonly { value: string; label: string }[],
  value: string | null
): string | null {
  if (!value) return null;
  return options.find((o) => o.value === value)?.label ?? null;
}

interface PublicProfileViewProps {
  profile: PublicProfile;
}

export function PublicProfileView({ profile }: PublicProfileViewProps) {
  const sections: PublicSections = profile.public_sections;
  const initials = getInitials(profile.full_name);
  const topSkills = (profile.skills || []).slice(0, 8);

  const workPrefLabel = getLabel(WORK_PREFERENCES, profile.work_preference);
  const expLabel = getLabel(EXPERIENCE_LEVELS, profile.experience_level);
  const employmentLabel = getLabel(EMPLOYMENT_TYPES, profile.employment_type);
  const educationLabel = getLabel(
    EDUCATION_LEVELS,
    profile.education
  );

  function handleShare() {
    const url = `${window.location.origin}/u/${profile.username}`;
    navigator.clipboard.writeText(url);
  }

  return (
    <div className="ppv-page">
      {/* Header bar */}
      <div className="ppv-topbar">
        <Link href="/" className="ppv-brand">
          bigmovv
        </Link>
        <button className="ppv-share-btn" onClick={handleShare}>
          Share
        </button>
      </div>

      {/* Hero */}
      <div className="ppv-hero">
        <div className="ppv-avatar">{initials}</div>
        <h1 className="ppv-name">{profile.full_name}</h1>

        {sections.headline && profile.headline && (
          <p className="ppv-headline">{profile.headline}</p>
        )}

        <div className="ppv-meta">
          {sections.city && profile.preferred_city && (
            <span>{profile.preferred_city}</span>
          )}
          {sections.work_preference && workPrefLabel && workPrefLabel !== "Any" && (
            <span>{workPrefLabel}</span>
          )}
          {sections.experience_level && expLabel && <span>{expLabel}</span>}
          {sections.employment_type && employmentLabel && employmentLabel !== "Any" && (
            <span>{employmentLabel}</span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="ppv-content">
        {/* Skills */}
        {sections.skills && topSkills.length > 0 && (
          <div className="ppv-section">
            <div className="ppv-section-title">Skills</div>
            <div className="ppv-tags">
              {topSkills.map((skill) => (
                <span key={skill} className="ppv-tag">
                  {skill}
                </span>
              ))}
              {(profile.skills || []).length > 8 && (
                <span className="ppv-tag ppv-tag-more">
                  +{(profile.skills || []).length - 8} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Industries */}
        {sections.preferred_industries &&
          (profile.preferred_industries || []).length > 0 && (
            <div className="ppv-section">
              <div className="ppv-section-title">Industries</div>
              <div className="ppv-tags">
                {profile.preferred_industries.map((ind) => (
                  <span key={ind} className="ppv-tag">
                    {ind}
                  </span>
                ))}
              </div>
            </div>
          )}

        {/* Education */}
        {sections.education && (profile.education || profile.school) && (
          <div className="ppv-section">
            <div className="ppv-section-title">Education</div>
            <div className="ppv-edu">
              {educationLabel && (
                <div className="ppv-edu-degree">{educationLabel}</div>
              )}
              {profile.field_of_study && (
                <div className="ppv-edu-field">{profile.field_of_study}</div>
              )}
              {profile.school && (
                <div className="ppv-edu-school">{profile.school}</div>
              )}
            </div>
          </div>
        )}

        {/* Salary */}
        {sections.salary &&
          (profile.desired_salary_min || profile.desired_salary_max) && (
            <div className="ppv-section">
              <div className="ppv-section-title">Expected Salary</div>
              <div className="ppv-salary">
                {profile.desired_salary_min && profile.desired_salary_max
                  ? `PHP ${profile.desired_salary_min.toLocaleString()} — ${profile.desired_salary_max.toLocaleString()}`
                  : profile.desired_salary_min
                  ? `From PHP ${profile.desired_salary_min.toLocaleString()}`
                  : `Up to PHP ${profile.desired_salary_max!.toLocaleString()}`}
              </div>
            </div>
          )}
      </div>

      {/* CTA */}
      <div className="ppv-cta">
        <div className="ppv-cta-text">
          Find jobs that match your skills on bigmovv
        </div>
        <Link href="/signup" className="ppv-cta-btn">
          Join bigmovv
        </Link>
      </div>
    </div>
  );
}
