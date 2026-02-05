"use client";

import { colors } from "@/lib/constants/colors";
import { LearningPathCard } from "./LearningPathCard";
import type { LearningPath } from "@/lib/types/learn";

interface LearningPathsSectionProps {
  paths: LearningPath[];
}

export function LearningPathsSection({ paths }: LearningPathsSectionProps) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: colors.text }}>
          Recommended Learning Paths
        </div>
        <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
          Curated paths to help you land your target role
        </div>
      </div>
      <div className="responsive-grid-2">
        {paths.map((path, i) => (
          <LearningPathCard
            key={path.id}
            path={path}
            animationDelay={0.06 + i * 0.06}
          />
        ))}
      </div>
    </div>
  );
}
