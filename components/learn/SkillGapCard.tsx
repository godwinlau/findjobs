"use client";

import type { GapResourceLink } from "@/lib/learn-page-helpers";

interface SkillGapCardProps {
  skillName: string;
  reason: string;
  boostPct: number;
  badge: string;
  badgeVariant: "dark" | "yellow";
  jobsUnlocked: number;
  difficulty: string;
  resourceLinks: GapResourceLink[];
}

const MONO = "'Space Mono', monospace";

export function SkillGapCard({
  skillName,
  reason,
  boostPct,
  badge,
  badgeVariant,
  jobsUnlocked,
  difficulty,
  resourceLinks,
}: SkillGapCardProps) {
  return (
    <div
      className="gap-card"
      style={{
        border: "2px solid #0A0A0A",
        marginTop: -2,
        padding: 24,
        display: "flex",
        flexDirection: "column",
        gap: 14,
        transition: "all .15s",
        position: "relative",
      }}
    >
      {/* Top row: badge + name + boost */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start", flex: 1 }}>
          <div
            style={{
              width: 48,
              height: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: MONO,
              fontSize: 13,
              fontWeight: 700,
              flexShrink: 0,
              background: badgeVariant === "yellow" ? "#FBBF24" : "#0A0A0A",
              color: badgeVariant === "yellow" ? "#0A0A0A" : "#F5F5F0",
            }}
          >
            {badge}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div
              style={{
                fontSize: 18,
                fontWeight: 800,
                letterSpacing: "-.03em",
                lineHeight: 1.15,
              }}
            >
              {skillName}
            </div>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 10,
                color: "#888",
                textTransform: "uppercase",
                letterSpacing: ".04em",
              }}
            >
              {reason}
            </div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 4,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              fontFamily: MONO,
              fontSize: 13,
              fontWeight: 700,
              padding: "5px 12px",
              background: "#FBBF24",
              color: "#0A0A0A",
            }}
          >
            +{boostPct}% match
          </div>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 9,
              color: "#888",
              textTransform: "uppercase",
              letterSpacing: ".03em",
            }}
          >
            Est. boost
          </div>
        </div>
      </div>

      {/* Impact row */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#555" }}>
          <span
            style={{
              width: 20,
              height: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              background: "rgba(0,0,0,.04)",
            }}
          >
            💼
          </span>
          Unlocks {jobsUnlocked} new jobs
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#555" }}>
          <span
            style={{
              width: 20,
              height: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              background: "rgba(0,0,0,.04)",
            }}
          >
            📊
          </span>
          {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} level
        </div>
      </div>

      {/* Resource links */}
      {resourceLinks.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: 6,
            flexWrap: "wrap",
            paddingTop: 12,
            borderTop: "1px solid rgba(0,0,0,.06)",
          }}
        >
          {resourceLinks.map((link) => {
            const typeClass =
              link.type === "youtube"
                ? "res-link res-link-yt"
                : link.type === "fcc"
                  ? "res-link res-link-fcc"
                  : link.type === "docs"
                    ? "res-link res-link-docs"
                    : "res-link res-link-course";

            const colorMap: Record<string, string> = {
              youtube: "#cc0000",
              fcc: "#0A0A0A",
              docs: "#3B82F6",
              course: "#A45CFF",
            };

            return (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={typeClass}
                style={{
                  fontFamily: MONO,
                  fontSize: 9,
                  fontWeight: 700,
                  padding: "5px 12px",
                  border: `1.5px solid ${colorMap[link.type] ?? "rgba(0,0,0,.1)"}20`,
                  textTransform: "uppercase",
                  letterSpacing: ".04em",
                  color: colorMap[link.type] ?? "#555",
                  cursor: "pointer",
                  transition: "all .15s",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                {link.type === "youtube" && "▶ "}
                {link.label}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
