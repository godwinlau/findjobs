import type { TrendingRole } from "@/lib/types/home";

interface TrendingRoleCardProps {
  role: TrendingRole;
}

export function TrendingRoleCard({ role }: TrendingRoleCardProps) {
  const isDown = role.growthPercent < 0;

  return (
    <div className="trend-card">
      <div className="trend-left">
        <div className="trend-title">{role.title}</div>
        <div className="trend-meta">{role.openCount} open roles</div>
        <div className="trend-salary">{role.salaryRange}</div>
      </div>
      <div className="trend-right">
        <span className={`trend-growth${isDown ? " down" : ""}`}>
          {isDown ? "" : "+"}{role.growthPercent}%
        </span>
        <div className="trend-bar">
          {role.barHeights.map((h, i) => (
            <span
              key={i}
              style={{
                height: `${h}%`,
                background: i === role.barHeights.length - 1 && !isDown
                  ? "var(--hb-accent)"
                  : undefined,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
