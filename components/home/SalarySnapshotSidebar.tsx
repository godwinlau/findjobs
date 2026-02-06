const SALARY_DATA = [
  { role: "Software Developer", min: 25, max: 80, avgPos: 52, rangeLabel: "\u20B125K \u2013 \u20B180K" },
  { role: "UI/UX Designer", min: 20, max: 65, avgPos: 45, rangeLabel: "\u20B120K \u2013 \u20B165K" },
  { role: "Virtual Assistant", min: 15, max: 40, avgPos: 38, rangeLabel: "\u20B115K \u2013 \u20B140K" },
];

export function SalarySnapshotSidebar() {
  return (
    <div className="sidebar-card">
      <div className="sb-title">Salary Snapshot</div>
      <div className="salary-snapshot">
        {SALARY_DATA.map((role) => {
          const fillLeft = (role.min / 100) * 100;
          const fillWidth = ((role.max - role.min) / 100) * 100;
          return (
            <div key={role.role} className="ss-role">
              <div className="ss-role-name">{role.role}</div>
              <div className="ss-bar">
                <div className="ss-bar-fill" style={{ left: `${fillLeft}%`, width: `${fillWidth}%` }} />
                <div className="ss-bar-avg" style={{ left: `${role.avgPos}%` }} />
              </div>
              <div className="ss-range">
                <span>{role.rangeLabel.split(" \u2013 ")[0]}</span>
                <span>{role.rangeLabel.split(" \u2013 ")[1]}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
