import { colors } from "@/lib/constants/colors";
import { Card } from "@/components/ui/Card";
import type { EmployerStats } from "@/lib/types";

interface StatsRowProps {
  stats: EmployerStats;
}

export function StatsRow({ stats }: StatsRowProps) {
  const items = [
    { label: "Active Jobs", value: stats.activeJobs, color: colors.success },
    { label: "Total Views", value: stats.totalViews, color: colors.primary },
    { label: "Total Applicants", value: stats.totalApplicants, color: colors.accent },
  ];

  return (
    <div
      className="responsive-grid-3"
      style={{ marginBottom: 24 }}
    >
      {items.map((item) => (
        <Card key={item.label} padding="lg">
          <div style={{ fontSize: 12, color: colors.textMuted, marginBottom: 4 }}>
            {item.label}
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: item.color }}>
            {item.value}
          </div>
        </Card>
      ))}
    </div>
  );
}
