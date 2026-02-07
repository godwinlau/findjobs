"use client";

import type { UserSkillBar } from "@/lib/learn-page-helpers";

const MONO = "'Space Mono', monospace";

export function YourSkillsBlock({ skills }: { skills: UserSkillBar[] }) {
  return (
    <div
      style={{
        border: "2px solid #0A0A0A",
        marginBottom: -2,
        padding: 24,
      }}
    >
      <div
        style={{
          fontFamily: MONO,
          fontSize: 10,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: ".06em",
          color: "#888",
          marginBottom: 14,
        }}
      >
        Your Skills
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {skills.map((skill) => (
          <div
            key={skill.name}
            style={{ display: "flex", alignItems: "center", gap: 10 }}
          >
            <span
              style={{
                fontFamily: MONO,
                fontSize: 10,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: ".03em",
                width: 90,
                flexShrink: 0,
                color: "#555",
              }}
            >
              {skill.name}
            </span>
            <div style={{ flex: 1, height: 8, background: "#E0DDD8" }}>
              <div
                style={{
                  height: "100%",
                  width: `${skill.score}%`,
                  background: skill.isAccent ? "#FBBF24" : "#0A0A0A",
                }}
              />
            </div>
            <span
              style={{
                fontFamily: MONO,
                fontSize: 9,
                fontWeight: 700,
                width: 28,
                textAlign: "right",
                flexShrink: 0,
              }}
            >
              {skill.score}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
