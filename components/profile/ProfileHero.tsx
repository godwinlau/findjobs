"use client";

import type { Profile } from "@/lib/types";
import {
  WORK_PREFERENCES,
  EXPERIENCE_LEVELS,
  EMPLOYMENT_TYPES,
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

function getLabelForValue(
  options: readonly { value: string; label: string }[],
  value: string | null
): string | null {
  if (!value) return null;
  return options.find((o) => o.value === value)?.label ?? null;
}

interface ProfileHeroProps {
  profile: Profile;
  onEditClick: () => void;
  onPrivacyClick?: () => void;
  onShareClick?: () => void;
}

export function ProfileHero({
  profile,
  onEditClick,
  onPrivacyClick,
  onShareClick,
}: ProfileHeroProps) {
  const initials = getInitials(profile.full_name);
  const workPrefLabel = getLabelForValue(WORK_PREFERENCES, profile.work_preference);
  const expLabel = getLabelForValue(EXPERIENCE_LEVELS, profile.experience_level);
  const employmentLabel = getLabelForValue(EMPLOYMENT_TYPES, profile.employment_type);
  const topSkills = (profile.skills || []).slice(0, 5);
  const completionPct = profile.profile_completion ?? 0;
  const skillCount = (profile.skills || []).length;

  return (
    <div className="profile-hero">
      <div className="ph-left">
        <div className="ph-top">
          <div className="ph-avatar">{initials}</div>
          <div className="ph-info">
            <div className="ph-name">{profile.full_name || "Your Name"}</div>
            {profile.headline && (
              <div className="ph-title-line">{profile.headline}</div>
            )}
            {profile.username && (
              <div className="ph-username-badge">
                bigmovv.com/u/{profile.username}
              </div>
            )}
            <div className="ph-meta">
              {profile.preferred_city && (
                <>
                  {profile.preferred_city}
                  <span className="dot" />
                </>
              )}
              {workPrefLabel && workPrefLabel !== "Any" && (
                <>
                  {workPrefLabel}
                  <span className="dot" />
                </>
              )}
              {expLabel && expLabel}
            </div>
          </div>
        </div>

        {!profile.headline && (
          <p className="ph-bio">
            Add a headline to tell employers about yourself and what you do.
          </p>
        )}

        <div className="ph-tags">
          {employmentLabel && employmentLabel !== "Any" && (
            <span className="ph-tag ph-tag-primary">{employmentLabel}</span>
          )}
          {!employmentLabel || employmentLabel === "Any" ? (
            <span className="ph-tag ph-tag-primary">Open to Work</span>
          ) : null}
          {topSkills.map((skill) => (
            <span key={skill} className="ph-tag">
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div className="ph-right">
        <div className="ph-actions">
          <button className="ph-edit" onClick={onEditClick}>
            Edit Profile
          </button>
          {profile.username && onPrivacyClick && (
            <button className="ph-edit ph-edit-secondary" onClick={onPrivacyClick}>
              Privacy
            </button>
          )}
          {profile.username && profile.is_profile_public && onShareClick && (
            <button className="ph-edit ph-edit-accent" onClick={onShareClick}>
              Share
            </button>
          )}
        </div>
        <div className="ph-stat-row">
          <div className="ph-stat">
            <div className="ph-stat-val yellow">{completionPct}%</div>
            <div className="ph-stat-label">Complete</div>
          </div>
          <div className="ph-stat">
            <div className="ph-stat-val">{skillCount}</div>
            <div className="ph-stat-label">Skills</div>
          </div>
          <div className="ph-stat">
            <div className="ph-stat-val">{expLabel ? expLabel.split(" ")[0] : "—"}</div>
            <div className="ph-stat-label">Experience</div>
          </div>
          <div className="ph-stat">
            <div className="ph-stat-val">{profile.current_streak || 0}</div>
            <div className="ph-stat-label">Streak</div>
          </div>
        </div>
      </div>
    </div>
  );
}
