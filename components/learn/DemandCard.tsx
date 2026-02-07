"use client";

import type { DemandTrend } from "@/lib/learn-page-helpers";

const MONO = "'Space Mono', monospace";

export function DemandCard({ trend }: { trend: DemandTrend }) {
  const trendBg =
    trend.trendDirection === "up"
      ? "#FBBF24"
      : trend.trendDirection === "stable"
        ? "#E0DDD8"
        : "#0A0A0A";
  const trendColor =
    trend.trendDirection === "up"
      ? "#0A0A0A"
      : trend.trendDirection === "stable"
        ? "#555"
        : "#F5F5F0";
  const trendSymbol =
    trend.trendDirection === "up"
      ? "+"
      : trend.trendDirection === "down"
        ? "-"
        : "+";

  return (
    <div
      className="demand-card"
      style={{
        border: "2px solid #0A0A0A",
        marginTop: -2,
        marginLeft: -2,
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        cursor: "default",
        transition: "background .15s",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: "-.01em" }}>
          {trend.skill}
        </div>
        <span
          style={{
            fontFamily: MONO,
            fontSize: 11,
            fontWeight: 700,
            padding: "3px 8px",
            background: trendBg,
            color: trendColor,
          }}
        >
          {trendSymbol}{trend.trendPct}%
        </span>
      </div>

      <div style={{ height: 10, background: "#E0DDD8" }}>
        <div
          style={{
            height: "100%",
            width: `${trend.demandPct}%`,
            background: trend.isHot ? "#FBBF24" : "#0A0A0A",
          }}
        />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontFamily: MONO, fontSize: 9, color: "#888", textTransform: "uppercase", letterSpacing: ".03em" }}>
          <strong style={{ color: "#0A0A0A" }}>{trend.jobCount}</strong> jobs
        </span>
      </div>

      <span
        style={{
          fontFamily: MONO,
          fontSize: 9,
          textTransform: "uppercase",
          letterSpacing: ".03em",
          padding: "3px 8px",
          display: "inline-block",
          marginTop: 2,
          alignSelf: "flex-start",
          ...(trend.isOnProfile
            ? { border: "1px solid rgba(0,0,0,.1)", color: "#0A0A0A" }
            : {
                border: "1px dashed rgba(251,191,36,.4)",
                color: "#B45309",
                background: "rgba(251,191,36,.05)",
              }),
        }}
      >
        {trend.isOnProfile ? "✓ On your profile" : "⚡ Missing — high impact"}
      </span>
    </div>
  );
}
