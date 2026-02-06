"use client";

export function RecentActivity() {
  return (
    <div className="sb-activity">
      <div className="sb-title">Recent Activity</div>
      <div className="profile-empty-state" style={{ padding: "16px 0" }}>
        <div className="profile-empty-desc" style={{ marginBottom: 0 }}>
          No recent activity yet. Start exploring jobs, taking assessments, or
          updating your profile to build your activity feed.
        </div>
      </div>
    </div>
  );
}
