"use client";

import type { Profile } from "@/lib/types";

interface ChecklistItem {
  label: string;
  done: boolean;
}

function buildChecklist(profile: Profile): ChecklistItem[] {
  return [
    { label: "Full name", done: !!profile.full_name },
    { label: "Headline", done: !!profile.headline },
    { label: "Skills (5+)", done: (profile.skills || []).length >= 5 },
    {
      label: "Skill proficiencies",
      done:
        !!profile.skill_proficiencies &&
        Object.keys(profile.skill_proficiencies).length > 0,
    },
    { label: "Experience level", done: !!profile.experience_level },
    { label: "Location", done: !!profile.preferred_city },
    { label: "Education", done: !!profile.education },
    { label: "Salary range", done: !!(profile.desired_salary_min || profile.desired_salary_max) },
    {
      label: "Work categories",
      done: (profile.preferred_industries || []).length > 0,
    },
  ];
}

interface ProfileCompletenessProps {
  profile: Profile;
}

export function ProfileCompleteness({ profile }: ProfileCompletenessProps) {
  const pct = profile.profile_completion ?? 0;
  const checklist = buildChecklist(profile);

  // SVG ring: radius 54, circumference = 2 * PI * 54 ≈ 339.292
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="sb-complete">
      <div className="sb-title">Profile Strength</div>
      <div className="sb-ring">
        <svg viewBox="0 0 120 120">
          <circle className="sb-ring-bg" cx="60" cy="60" r="54" />
          <circle
            className="sb-ring-fill"
            cx="60"
            cy="60"
            r="54"
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: offset,
            }}
          />
        </svg>
        <div className="sb-ring-text">
          <div className="sb-ring-pct">{pct}%</div>
          <div className="sb-ring-label">Complete</div>
        </div>
      </div>
      <div className="sb-checklist">
        {checklist.map((item) => (
          <div
            key={item.label}
            className={`sb-check ${item.done ? "done" : "todo"}`}
          >
            <div className="sb-check-icon">{item.done ? "\u2713" : "\u2014"}</div>
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}
