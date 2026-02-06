"use client";

interface ExperienceSectionProps {
  onEditClick: () => void;
}

export function ExperienceSection({ onEditClick }: ExperienceSectionProps) {
  return (
    <div className="profile-section">
      <div className="profile-section-label">Experience</div>
      <div className="profile-empty-state">
        <div className="profile-empty-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
          </svg>
        </div>
        <div className="profile-empty-title">Add your work experience</div>
        <div className="profile-empty-desc">
          Employers want to see your background. Add roles, companies, and what
          you accomplished.
        </div>
        <button className="profile-empty-cta" onClick={onEditClick}>
          Coming Soon
        </button>
      </div>
    </div>
  );
}
