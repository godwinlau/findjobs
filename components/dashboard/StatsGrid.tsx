"use client";

import { colors } from "@/lib/constants/colors";
import type { DashboardStats } from "@/lib/actions/dashboard-stats";
import type { WeekActivity } from "@/lib/types";

interface StatsGridProps {
  stats: DashboardStats;
}

function StreakHeatmap({ days }: { days: WeekActivity[] }) {
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      {days.map((dayData, i) => {
        const level = dayData.actions;
        return (
          <div
            key={i}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                background: dayData.isFuture
                  ? "rgba(10,10,10,0.04)"
                  : level === 0
                  ? "rgba(10,10,10,0.04)"
                  : level === 1
                  ? "rgba(251,191,36,0.15)"
                  : level >= 2
                  ? "#FBBF24"
                  : "rgba(10,10,10,0.04)",
                border: dayData.isToday
                  ? "2px solid #0A0A0A"
                  : "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {level > 0 && !dayData.isFuture && (
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    fontFamily: "var(--font-mono)",
                    color: level >= 2 ? "#0A0A0A" : "#FBBF24",
                  }}
                >
                  {level}
                </span>
              )}
            </div>
            <span
              style={{
                fontSize: 10,
                fontFamily: "var(--font-mono)",
                fontWeight: dayData.isToday ? 700 : 400,
                color: dayData.isToday ? "#0A0A0A" : "#888",
                textTransform: "uppercase" as const,
              }}
            >
              {dayData.day}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function TrendBadge({ delta, label }: { delta: number; label?: string }) {
  const color: string =
    delta > 0 ? "#6EE7B7" : delta < 0 ? "#EF4444" : "#888";
  const arrow = delta > 0 ? "↑" : delta < 0 ? "↓" : "";
  const text =
    delta === 0
      ? "No change"
      : `${delta > 0 ? "+" : ""}${delta} ${label ?? "from last week"}`;

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontSize: 11,
        fontFamily: "var(--font-mono)",
        fontWeight: 700,
        color,
        textTransform: "uppercase" as const,
      }}
    >
      {arrow} {text}
    </div>
  );
}

function BentoCard({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <div
      className={className}
      style={{
        background: "#F5F5F0",
        border: "2px solid #0A0A0A",
        padding: 24,
        marginTop: -2,
        marginLeft: -2,
        animation: `slam 0.4s cubic-bezier(.22,1,.36,1) ${delay}s both`,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {children}
    </div>
  );
}

function StatLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: 10,
        fontWeight: 700,
        textTransform: "uppercase" as const,
        letterSpacing: "0.06em",
        color: "#888",
        marginBottom: 8,
      }}
    >
      {children}
    </div>
  );
}

function StatValue({
  children,
  size = "lg",
}: {
  children: React.ReactNode;
  size?: "md" | "lg" | "xl";
}) {
  const sizes = {
    md: 24,
    lg: 36,
    xl: 48,
  };
  return (
    <div
      style={{
        fontSize: sizes[size],
        fontWeight: 800,
        lineHeight: 1,
        color: "#0A0A0A",
        letterSpacing: "-0.04em",
      }}
    >
      {children}
    </div>
  );
}

export function StatsGrid({ stats }: StatsGridProps) {
  const applicationsDelta =
    stats.applications.current - stats.applications.previous;
  const viewsDelta = stats.jobsViewed.current - stats.jobsViewed.previous;

  return (
    <div className="bento-grid" style={{ marginBottom: 20 }}>
      {/* Applications */}
      <BentoCard className="bento-applications" delay={0}>
        <StatLabel>Applications</StatLabel>
        <StatValue size="lg">{stats.applications.current}</StatValue>
        <div style={{ marginTop: 8 }}>
          <TrendBadge delta={applicationsDelta} />
        </div>
      </BentoCard>

      {/* Streak */}
      <BentoCard className="bento-streak" delay={0.03}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <div>
            <StatLabel>Weekly Streak</StatLabel>
            <StatValue size="lg">
              {stats.streak.current}
              <span style={{ fontSize: 14, fontWeight: 700, fontFamily: "var(--font-mono)", marginLeft: 4, textTransform: "uppercase" as const }}>
                days
              </span>
            </StatValue>
          </div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "#888",
              textAlign: "right",
              textTransform: "uppercase" as const,
            }}
          >
            <span style={{ color: "#FBBF24", fontWeight: 700 }}>
              {stats.streak.longest}
            </span>{" "}
            longest
          </div>
        </div>
        <div style={{ marginTop: "auto" }}>
          <StreakHeatmap days={stats.streak.days} />
        </div>
      </BentoCard>

      {/* Jobs Viewed */}
      <BentoCard className="bento-views" delay={0.06}>
        <StatLabel>Jobs Viewed</StatLabel>
        <StatValue size="lg">{stats.jobsViewed.current}</StatValue>
        <div style={{ marginTop: 8 }}>
          <TrendBadge delta={viewsDelta} />
        </div>
      </BentoCard>

      {/* Skills */}
      <BentoCard className="bento-skills" delay={0.09}>
        <StatLabel>Your Skills</StatLabel>
        <StatValue size="lg">{stats.skillsCount}</StatValue>
        <div style={{ marginTop: 8, fontSize: 11, fontFamily: "var(--font-mono)", color: "#888", textTransform: "uppercase" as const }}>
          {stats.inDemandSkillsCount > 0 ? (
            <>
              <span style={{ color: "#FBBF24", fontWeight: 700 }}>
                {stats.inDemandSkillsCount} in-demand
              </span>{" "}
              for your roles
            </>
          ) : (
            "Add skills to improve matches"
          )}
        </div>
      </BentoCard>

      {/* Assessment */}
      <BentoCard className="bento-assessment" delay={0.12}>
        <StatLabel>Assessment Score</StatLabel>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <div>
            <StatValue size="lg">
              {stats.assessmentAverage ?? "—"}
              {stats.assessmentAverage !== null && (
                <span style={{ fontSize: 18, fontWeight: 700 }}>%</span>
              )}
            </StatValue>
            <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "#888", marginTop: 4, textTransform: "uppercase" as const }}>
              {stats.categoriesAssessed}/{stats.totalCategories} categories
            </div>
          </div>
          {stats.assessmentAverage !== null && (
            <div style={{ flex: 1, maxWidth: 120 }}>
              <div
                style={{
                  height: 6,
                  background: "rgba(10,10,10,0.08)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${stats.assessmentAverage}%`,
                    height: "100%",
                    background: "#FBBF24",
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </BentoCard>

      {/* Match Quality */}
      <BentoCard className="bento-match" delay={0.15}>
        <StatLabel>Match Quality</StatLabel>
        <StatValue size="lg">
          {stats.avgMatchPercent ?? "—"}
          {stats.avgMatchPercent !== null && (
            <span style={{ fontSize: 18, fontWeight: 700 }}>%</span>
          )}
        </StatValue>
        <div style={{ marginTop: 8, fontSize: 11, fontFamily: "var(--font-mono)", color: "#888", textTransform: "uppercase" as const }}>
          {stats.avgMatchPercent !== null
            ? "Avg of applied jobs"
            : "Apply to see avg match"}
        </div>
      </BentoCard>
    </div>
  );
}
