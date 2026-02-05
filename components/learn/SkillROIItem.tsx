"use client";

import { colors } from "@/lib/constants/colors";
import { Badge, Button } from "@/components/ui";
import type { SkillROI } from "@/lib/types/learn";

interface SkillROIItemProps {
  item: SkillROI;
  maxMatches: number;
}

export function SkillROIItem({ item, maxMatches }: SkillROIItemProps) {
  const barWidth = maxMatches > 0 ? (item.estimatedNewMatches / maxMatches) * 100 : 0;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 0",
        borderBottom: `1px solid ${colors.border}`,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 6,
          }}
        >
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: colors.text,
              textTransform: "capitalize",
            }}
          >
            {item.skill}
          </span>
          <Badge variant="primary" size="sm">
            +{item.estimatedNewMatches} jobs
          </Badge>
        </div>

        {/* Demand bar */}
        <div
          style={{
            height: 6,
            borderRadius: 3,
            background: colors.surfaceAlt,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${barWidth}%`,
              borderRadius: 3,
              background: `linear-gradient(90deg, ${colors.primary}, ${colors.primarySoft})`,
              transition: "width 0.5s ease",
              minWidth: barWidth > 0 ? 8 : 0,
            }}
          />
        </div>

        {item.topIndustries.length > 0 && (
          <div
            style={{
              fontSize: 10,
              color: colors.textMuted,
              marginTop: 4,
            }}
          >
            In demand: {item.topIndustries.slice(0, 2).join(", ")}
          </div>
        )}
      </div>

      {item.recommendedCourse ? (
        <a
          href={item.recommendedCourse.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: "none", flexShrink: 0 }}
        >
          <Button variant="ghost" size="sm">
            Learn →
          </Button>
        </a>
      ) : (
        <div style={{ width: 70 }} />
      )}
    </div>
  );
}
