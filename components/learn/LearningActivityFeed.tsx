"use client";

import { colors } from "@/lib/constants/colors";
import { Card } from "@/components/ui";
import type { LearningActivity } from "@/lib/types/learn";

interface LearningActivityFeedProps {
  activities: LearningActivity[];
}

export function LearningActivityFeed({ activities }: LearningActivityFeedProps) {
  return (
    <div style={{ marginBottom: 20 }}>
      <Card padding="sm" style={{ padding: 0 }} animationDelay={0.3}>
        <div
          style={{
            padding: "12px 16px",
            borderBottom: `1px solid ${colors.border}`,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: colors.primary,
            }}
          />
          <span style={{ fontSize: 13, fontWeight: 600, color: colors.text }}>
            Learning Activity
          </span>
        </div>
        {activities.map((activity, i) => (
          <div
            key={i}
            style={{
              padding: "10px 16px",
              borderBottom:
                i < activities.length - 1 ? `1px solid ${colors.border}` : "none",
              display: "flex",
              gap: 10,
              alignItems: "flex-start",
              animation: `slideIn 0.25s ease ${0.32 + i * 0.04}s both`,
            }}
          >
            <span
              style={{
                fontSize: 13,
                marginTop: 1,
                flexShrink: 0,
                width: 18,
                textAlign: "center",
              }}
            >
              {activity.icon}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 12,
                  color: colors.text,
                  fontWeight: 500,
                  lineHeight: 1.4,
                }}
              >
                {activity.text}
              </div>
              <div style={{ fontSize: 10, color: colors.textMuted, marginTop: 2 }}>
                {activity.time}
              </div>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
