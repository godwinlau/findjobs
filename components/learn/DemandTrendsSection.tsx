"use client";

import { DemandCard } from "./DemandCard";
import type { DemandTrend } from "@/lib/learn-page-helpers";

const MONO = "'Space Mono', monospace";

export function DemandTrendsSection({ trends }: { trends: DemandTrend[] }) {
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
            {"// ph market"}
          </span>
          <div
            style={{
              fontSize: 24,
              fontWeight: 800,
              letterSpacing: "-.04em",
              lineHeight: 1,
            }}
          >
            Skill Demand Trends
          </div>
        </div>
      </div>

      <div className="learn-demand-grid">
        {trends.map((trend) => (
          <DemandCard key={trend.skill} trend={trend} />
        ))}
      </div>
    </div>
  );
}
