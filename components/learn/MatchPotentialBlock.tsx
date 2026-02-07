"use client";

import type { MatchProgression, MatchPotentialData } from "@/lib/learn-page-helpers";

const MONO = "'Space Mono', monospace";

interface MatchPotentialBlockProps {
  items: MatchProgression[];
  currentPct: number;
  fullPotentialPct: number;
  matchPotential: MatchPotentialData | null;
}

export function MatchPotentialBlock({
  items,
  currentPct,
  fullPotentialPct,
  matchPotential,
}: MatchPotentialBlockProps) {
  // Use real match counts when available, fall back to percentage heuristic
  const useRealCounts = matchPotential !== null;

  return (
    <div
      style={{
        background: "#0A0A0A",
        color: "#F5F5F0",
        border: "2px solid #0A0A0A",
        padding: 24,
        marginBottom: -2,
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      <div
        style={{
          fontFamily: MONO,
          fontSize: 10,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: ".06em",
          color: "rgba(255,255,255,.3)",
          marginBottom: 0,
        }}
      >
        Match Potential
      </div>

      {/* Current */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "8px 0",
          borderBottom: "1px solid rgba(255,255,255,.06)",
        }}
      >
        <span style={{ fontSize: 12, color: "rgba(255,255,255,.5)" }}>
          Current
        </span>
        <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700 }}>
          {useRealCounts
            ? `${matchPotential.currentMatches} matches`
            : `${currentPct}%`}
        </span>
      </div>

      {/* Progression rows */}
      {useRealCounts
        ? matchPotential.progression.map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "8px 0",
                borderBottom:
                  i < matchPotential.progression.length - 1
                    ? "1px solid rgba(255,255,255,.06)"
                    : "none",
              }}
            >
              <span style={{ fontSize: 12, color: "rgba(255,255,255,.5)" }}>
                + {item.skill.charAt(0).toUpperCase() + item.skill.slice(1)}
              </span>
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#FBBF24",
                }}
              >
                {item.matchesBefore}
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 10,
                    color: "rgba(255,255,255,.2)",
                    margin: "0 6px",
                  }}
                >
                  →
                </span>
                {item.matchesAfter}
              </span>
            </div>
          ))
        : items.map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "8px 0",
                borderBottom:
                  i < items.length - 1
                    ? "1px solid rgba(255,255,255,.06)"
                    : "none",
              }}
            >
              <span style={{ fontSize: 12, color: "rgba(255,255,255,.5)" }}>
                + {item.skill.charAt(0).toUpperCase() + item.skill.slice(1)}
              </span>
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#FBBF24",
                }}
              >
                {item.fromPct}%
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 10,
                    color: "rgba(255,255,255,.2)",
                    margin: "0 6px",
                  }}
                >
                  →
                </span>
                {item.toPct}%
              </span>
            </div>
          ))}

      {/* Full potential */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "8px 0",
        }}
      >
        <span style={{ fontSize: 12, color: "#F5F5F0", fontWeight: 600 }}>
          Full potential
        </span>
        <span
          style={{
            fontFamily: MONO,
            fontSize: 16,
            fontWeight: 700,
            color: "#FBBF24",
          }}
        >
          {useRealCounts
            ? `${matchPotential.fullPotentialMatches} matches`
            : `${fullPotentialPct}%`}
        </span>
      </div>
    </div>
  );
}
