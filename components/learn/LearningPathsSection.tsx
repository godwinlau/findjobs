"use client";

import { colors } from "@/lib/constants/colors";
import { LearningPathCard } from "./LearningPathCard";
import type { LearningPath, ScoredLearningPath } from "@/lib/types/learn";

interface LearningPathsSectionProps {
  paths: LearningPath[] | ScoredLearningPath[];
}

function isScoredPath(path: LearningPath): path is ScoredLearningPath {
  return "relevanceScore" in path;
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
          <div key={path.id} style={{ position: "relative" }}>
            {isScoredPath(path) && path.isTopPick && (
              <div
                style={{
                  position: "absolute",
                  top: -8,
                  right: 12,
                  zIndex: 1,
                  padding: "3px 10px",
                  borderRadius: 6,
                  fontSize: 10,
                  fontWeight: 700,
                  background: colors.primary,
                  color: colors.inv,
                  boxShadow: `0 2px 6px ${colors.primary}30`,
                }}
              >
                Recommended
              </div>
            )}
            <LearningPathCard
              path={path}
              animationDelay={0.06 + i * 0.06}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
