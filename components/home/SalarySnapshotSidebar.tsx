import type { SalarySnapshotData } from "@/lib/types/home";

const fmt = (n: number) => (n >= 1000 ? `₱${Math.round(n / 1000)}K` : `₱${n}`);

export function SalarySnapshotSidebar({ data }: { data: SalarySnapshotData }) {
  if (data.roles.length === 0) return null;

  const { roles, scaleCeiling, userDesiredSalary } = data;

  // Compute user marker midpoint position (capped at 98% to stay visible)
  const userMidPct = userDesiredSalary
    ? Math.min(((userDesiredSalary.min + userDesiredSalary.max) / 2 / scaleCeiling) * 100, 98)
    : null;

  return (
    <div className="sidebar-card">
      <div className="sb-title">Salary Snapshot</div>
      <div className="salary-snapshot">
        {roles.map((role) => {
          const fillLeft = (role.minSalary / scaleCeiling) * 100;
          const fillWidth = ((role.maxSalary - role.minSalary) / scaleCeiling) * 100;
          const avgPos = (role.avgSalary / scaleCeiling) * 100;

          return (
            <div key={role.title} className="ss-role">
              <div className="ss-role-header">
                <span className="ss-role-name">{role.title}</span>
                <span className="ss-role-count">{role.jobCount} jobs</span>
              </div>
              <div className="ss-bar">
                <div className="ss-bar-fill" style={{ left: `${fillLeft}%`, width: `${fillWidth}%` }} />
                <div className="ss-bar-avg" style={{ left: `${avgPos}%` }} />
                {userMidPct !== null && (
                  <div className="ss-bar-user" style={{ left: `${userMidPct}%` }} />
                )}
              </div>
              <div className="ss-range">
                <span>{fmt(role.minSalary)}</span>
                <span>{fmt(role.maxSalary)}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="ss-legend">
        <span className="ss-legend-item">
          <span className="ss-legend-dot ss-legend-dot--avg" />
          Avg
        </span>
        {userDesiredSalary && (
          <span className="ss-legend-item">
            <span className="ss-legend-dot ss-legend-dot--user" />
            Your target
          </span>
        )}
      </div>
    </div>
  );
}
