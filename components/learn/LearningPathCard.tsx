"use client";

import { colors } from "@/lib/constants/colors";
import { Card, Badge, Button } from "@/components/ui";
import type { LearningPath } from "@/lib/types/learn";

interface LearningPathCardProps {
  path: LearningPath;
  animationDelay?: number;
}

export function LearningPathCard({ path, animationDelay = 0 }: LearningPathCardProps) {
  const completedSteps = path.steps.filter((s) => s.completed).length;
  const progress =
    path.steps.length > 0
      ? Math.round((completedSteps / path.steps.length) * 100)
      : 0;

  return (
    <Card
      style={{ display: "flex", flexDirection: "column", gap: 14 }}
      animationDelay={animationDelay}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: path.colorBg,
            border: `1px solid ${path.colorBorder}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            flexShrink: 0,
          }}
        >
          {path.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: colors.text,
              lineHeight: 1.3,
            }}
          >
            {path.title}
          </div>
          <div
            style={{
              fontSize: 12,
              color: colors.textSec,
              marginTop: 3,
              lineHeight: 1.4,
            }}
          >
            {path.description}
          </div>
        </div>
      </div>

      {/* Meta info */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        <Badge variant="primary">
          {path.steps.length} steps
        </Badge>
        <Badge variant="accent">
          Unlocks {path.jobsUnlocked} jobs
        </Badge>
        <Badge variant="muted">
          ~{path.estimatedHours}h
        </Badge>
      </div>

      {/* Progress bar */}
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 5,
          }}
        >
          <span style={{ fontSize: 11, color: colors.textMuted }}>
            {completedSteps}/{path.steps.length} completed
          </span>
          <span style={{ fontSize: 11, fontWeight: 600, color: path.color }}>
            {progress}%
          </span>
        </div>
        <div
          style={{
            height: 5,
            borderRadius: 3,
            background: colors.surfaceAlt,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              borderRadius: 3,
              background: path.color,
              transition: "width 0.3s ease",
            }}
          />
        </div>
      </div>

      <Button variant="secondary" size="sm">
        View Path →
      </Button>
    </Card>
  );
}
