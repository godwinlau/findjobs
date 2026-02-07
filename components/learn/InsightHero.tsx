"use client";

import type { InsightHeroData, MatchPotentialData } from "@/lib/learn-page-helpers";

const MONO = "'Space Mono', monospace";

interface InsightHeroProps {
  data: InsightHeroData;
  matchPotential: MatchPotentialData | null;
}

export function InsightHero({ data, matchPotential }: InsightHeroProps) {
  const useRealCounts = matchPotential !== null && data.currentMatches !== null;
  const jobsUnlocked = data.jobsUnlocked;

  return (
    <div className="learn-insight-hero">
      {/* Left panel - dark with grid texture */}
      <div className="ih-left-panel">
        <div
          style={{
            fontFamily: MONO,
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: ".08em",
            color: "rgba(255,255,255,.3)",
            position: "relative",
            zIndex: 1,
          }}
        >
          {"// your skill analysis"}
        </div>
        <div
          style={{
            fontSize: 36,
            fontWeight: 800,
            letterSpacing: "-.04em",
            lineHeight: 1.05,
            position: "relative",
            zIndex: 1,
          }}
        >
          You&apos;re{" "}
          <span style={{ color: "#FBBF24" }}>
            {data.skillsAwayCount} skill{data.skillsAwayCount !== 1 ? "s" : ""}
          </span>{" "}
          away from {jobsUnlocked}+ more matches
        </div>
        <p
          style={{
            fontSize: 14,
            lineHeight: 1.6,
            color: "rgba(255,255,255,.4)",
            position: "relative",
            zIndex: 1,
            maxWidth: 380,
          }}
        >
          {useRealCounts
            ? `We scored ${data.totalJobsAnalyzed} active jobs against your profile. Here's what the market wants — and where you can level up.`
            : "We analyzed jobs matching your profile. Here's what the market wants — and where you can level up."}
        </p>
        <div style={{ marginTop: "auto", position: "relative", zIndex: 1 }}>
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              letterSpacing: "-.06em",
              lineHeight: 0.85,
              color: "#FBBF24",
            }}
          >
            {useRealCounts ? data.currentMatches : `${data.overallPercentage}%`}
          </div>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: ".05em",
              color: "rgba(255,255,255,.25)",
              marginTop: 4,
            }}
          >
            {useRealCounts ? "Current Job Matches" : "Current Avg. Match Score"}
          </div>
        </div>
      </div>

      {/* Right panel - 2x2 stat grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 0,
        }}
      >
        {/* Yellow accent box */}
        <div
          style={{
            border: "2px solid #0A0A0A",
            marginTop: -2,
            marginLeft: -2,
            padding: 28,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: 8,
            background: "#FBBF24",
          }}
        >
          <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-.03em" }}>
            +{jobsUnlocked}
          </div>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 9,
              textTransform: "uppercase",
              letterSpacing: ".05em",
              color: "rgba(10,10,10,.5)",
              lineHeight: 1.4,
            }}
          >
            {useRealCounts
              ? "Jobs unlocked with top 3 skills"
              : "Jobs unlocked if you add top 3 skills"}
          </div>
        </div>

        {/* Skills count */}
        <div
          style={{
            border: "2px solid #0A0A0A",
            marginTop: -2,
            marginLeft: -2,
            padding: 28,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-.03em" }}>
            {data.skillsCount}
          </div>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 9,
              textTransform: "uppercase",
              letterSpacing: ".05em",
              color: "#888",
              lineHeight: 1.4,
            }}
          >
            Skills on your profile
          </div>
        </div>

        {/* Potential match / skill coverage */}
        <div
          style={{
            border: "2px solid #0A0A0A",
            marginTop: -2,
            marginLeft: -2,
            padding: 28,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          <div
            style={{
              fontSize: 28,
              fontWeight: 800,
              letterSpacing: "-.03em",
              color: "#FBBF24",
            }}
          >
            {useRealCounts
              ? matchPotential!.fullPotentialMatches
              : `${data.potentialMatchPct}%`}
          </div>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 9,
              textTransform: "uppercase",
              letterSpacing: ".05em",
              color: "#888",
              lineHeight: 1.4,
            }}
          >
            {useRealCounts
              ? "Full potential matches"
              : "Potential match score with top skills"}
          </div>
        </div>

        {/* Skills away */}
        <div
          style={{
            border: "2px solid #0A0A0A",
            marginTop: -2,
            marginLeft: -2,
            padding: 28,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-.03em" }}>
            {data.skillsAwayCount}
          </div>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 9,
              textTransform: "uppercase",
              letterSpacing: ".05em",
              color: "#888",
              lineHeight: 1.4,
            }}
          >
            Key skills to close the gap
          </div>
        </div>
      </div>
    </div>
  );
}
