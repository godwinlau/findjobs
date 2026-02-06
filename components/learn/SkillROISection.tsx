"use client";

import { colors } from "@/lib/constants/colors";
import { Card } from "@/components/ui";
import { SkillROIItem } from "./SkillROIItem";
import type { SkillROI } from "@/lib/types/learn";

interface SkillROISectionProps {
  skills: SkillROI[];
  youtubeMaps?: { clusters: Record<string, { url: string; channel: string }>; skills: Record<string, { url: string; channel: string }> };
}

export function SkillROISection({ skills, youtubeMaps }: SkillROISectionProps) {
  if (skills.length === 0) return null;

  const displaySkills = skills.slice(0, 8);
  const maxMatches = Math.max(...displaySkills.map((s) => s.estimatedNewMatches), 1);

  return (
    <div id="skills-that-unlock-jobs" style={{ marginBottom: 20 }}>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: colors.text }}>
          Skills That Unlock Jobs
        </div>
        <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
          Missing skills ranked by how many jobs they open in your target industries
        </div>
      </div>

      <Card padding="md" animationDelay={0.06}>
        {displaySkills.map((skill) => (
          <SkillROIItem
            key={skill.skill}
            item={skill}
            maxMatches={maxMatches}
            youtubeMaps={youtubeMaps}
          />
        ))}
        {/* Remove last border */}
        <style>{`
          #skills-that-unlock-jobs [style*="border-bottom"]:last-child {
            border-bottom: none !important;
          }
        `}</style>
      </Card>
    </div>
  );
}
