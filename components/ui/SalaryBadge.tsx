"use client";

import { colors } from "@/lib/constants/colors";

interface SalaryBadgeProps {
  salary: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  userSalaryMin?: number | null;
  userSalaryMax?: number | null;
  isEstimate?: boolean;
}

type SalaryAlignment = "within" | "above" | "below" | "unknown";

function getSalaryAlignment(
  jobMin?: number | null,
  jobMax?: number | null,
  userMin?: number | null,
  userMax?: number | null
): SalaryAlignment {
  if (!jobMin && !jobMax) return "unknown";
  if (!userMin && !userMax) return "unknown";

  const jobMid = jobMin && jobMax ? (jobMin + jobMax) / 2 : jobMin || jobMax || 0;
  const uMin = userMin || 0;
  const uMax = userMax || Infinity;

  if (jobMid >= uMin && jobMid <= uMax) return "within";
  if (jobMid > uMax) return "above";
  return "below";
}

export function SalaryBadge({
  salary,
  salaryMin,
  salaryMax,
  userSalaryMin,
  userSalaryMax,
  isEstimate,
}: SalaryBadgeProps) {
  const alignment = getSalaryAlignment(salaryMin, salaryMax, userSalaryMin, userSalaryMax);
  const isDisclosed = salary !== "Salary not disclosed";

  const getAlignmentStyle = () => {
    switch (alignment) {
      case "within":
        return { color: colors.success, icon: "✓", label: "In range" };
      case "above":
        return { color: colors.success, icon: "↑", label: "Above min" };
      case "below":
        return { color: colors.warning, icon: "↓", label: "Below range" };
      default:
        return null;
    }
  };

  const alignmentStyle = getAlignmentStyle();

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ fontSize: 14, fontWeight: 700, color: isDisclosed ? colors.success : colors.textMuted }}>
        {salary}
        {isDisclosed && (
          <span style={{ fontWeight: 400, fontSize: 11, color: colors.textMuted }}>/mo</span>
        )}
      </span>
      {isEstimate && isDisclosed && (
        <span
          style={{
            fontSize: 9,
            color: colors.textMuted,
            background: colors.surfaceAlt,
            padding: "1px 4px",
            borderRadius: 3,
          }}
        >
          est.
        </span>
      )}
      {alignmentStyle && (
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: alignmentStyle.color,
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <span>{alignmentStyle.icon}</span>
          <span>{alignmentStyle.label}</span>
        </span>
      )}
    </div>
  );
}
