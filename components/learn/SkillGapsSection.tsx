"use client";

import { SkillGapCard } from "./SkillGapCard";
import type { SkillROI } from "@/lib/types/learn";
import type { GapResourceLink } from "@/lib/learn-page-helpers";
import { estimateSkillBoost } from "@/lib/learn-page-helpers";

const MONO = "'Space Mono', monospace";

interface SkillGapsSectionProps {
  skillROIs: SkillROI[];
  resourceLinksMap: Record<string, GapResourceLink[]>;
}

function makeBadge(skill: string): string {
  // Generate a 2-3 char abbreviation
  const words = skill.split(/[\s/]+/);
  if (words.length === 1) {
    return skill.slice(0, 2).toUpperCase();
  }
  return words
    .slice(0, 3)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");
}

function makeReason(roi: SkillROI): string {
  if (roi.topIndustries.length > 0) {
    return `High demand in ${roi.topIndustries[0]}`;
  }
  return `Unlocks ${roi.estimatedNewMatches} new job matches`;
}

export function SkillGapsSection({
  skillROIs,
  resourceLinksMap,
}: SkillGapsSectionProps) {
  const displayed = skillROIs.slice(0, 5);

  return (
    <div style={{ marginBottom: 32 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: 14,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <span
            style={{
              fontFamily: MONO,
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: ".08em",
              color: "#888",
            }}
          >
            {"// biggest opportunities"}
          </span>
          <div
            style={{
              fontSize: 24,
              fontWeight: 800,
              letterSpacing: "-.04em",
              lineHeight: 1,
            }}
          >
            Skill Gaps to Close
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {displayed.map((roi, i) => (
          <SkillGapCard
            key={roi.skill}
            skillName={
              roi.skill.charAt(0).toUpperCase() + roi.skill.slice(1)
            }
            reason={makeReason(roi)}
            boostPct={estimateSkillBoost(roi, skillROIs)}
            badge={makeBadge(roi.skill)}
            badgeVariant={i % 2 === 0 ? "dark" : "yellow"}
            jobsUnlocked={roi.estimatedNewMatches}
            difficulty={roi.difficulty}
            resourceLinks={resourceLinksMap[roi.skill] ?? []}
          />
        ))}
      </div>
    </div>
  );
}
