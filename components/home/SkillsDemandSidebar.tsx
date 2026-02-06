import type { SkillDemandItem } from "@/lib/types/home";

interface SkillsDemandSidebarProps {
  skills: SkillDemandItem[];
}

export function SkillsDemandSidebar({ skills }: SkillsDemandSidebarProps) {
  if (skills.length === 0) return null;

  return (
    <div className="sidebar-card">
      <div className="sb-title">Your Skills {"\u00D7"} Market Demand</div>
      <div className="match-list">
        {skills.map((skill) => (
          <div key={skill.skill} className="match-item">
            <span className="match-skill">{skill.skill}</span>
            <div className="match-demand">
              <div className="match-demand-bar">
                <div
                  className={`match-demand-fill${skill.demandPercent >= 75 ? " hot" : ""}`}
                  style={{ width: `${skill.demandPercent}%` }}
                />
              </div>
              <span className="match-demand-label">{skill.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
