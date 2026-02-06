"use client";

export function PortfolioSection() {
  return (
    <div className="profile-section">
      <div className="profile-section-label">Portfolio</div>
      <div className="profile-empty-state">
        <div className="profile-empty-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </div>
        <div className="profile-empty-title">Add portfolio projects</div>
        <div className="profile-empty-desc">
          Showcase your best work. Add case studies, live projects, or links to
          demonstrate what you can do.
        </div>
        <button className="profile-empty-cta">Coming Soon</button>
      </div>
    </div>
  );
}
