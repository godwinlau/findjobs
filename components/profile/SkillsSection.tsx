"use client";

import type { Profile, SkillProficiency } from "@/lib/types";

const PROFICIENCY_PCT: Record<SkillProficiency, number> = {
  beginner: 33,
  intermediate: 66,
  advanced: 100,
};

interface SkillsSectionProps {
  profile: Profile;
}

export function SkillsSection({ profile }: SkillsSectionProps) {
  const skills = profile.skills || [];
  const proficiencies = profile.skill_proficiencies || {};

  if (skills.length === 0) {
    return (
      <div className="profile-section">
        <div className="profile-section-label">Skills</div>
        <div className="profile-empty-state">
          <div className="profile-empty-icon">+</div>
          <div className="profile-empty-title">Add your skills</div>
          <div className="profile-empty-desc">
            Skills are the #1 factor in job matching. Add at least 5 to see
            better results.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-section">
      <div className="profile-section-label">Skills</div>
      <div className="skills-grid">
        {skills.map((skill) => {
          const level = proficiencies[skill];
          const pct = level ? PROFICIENCY_PCT[level] : 50;
          const isAccent = pct >= 80;

          return (
            <div key={skill} className="skill-row">
              <span className="skill-name">{skill}</span>
              <div className="skill-track">
                <div
                  className={`skill-fill${isAccent ? " accent" : ""}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="skill-pct">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
