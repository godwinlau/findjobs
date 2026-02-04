"use client";

import { colors } from "@/lib/constants/colors";
import { Card } from "@/components/ui";
import { weekDays, weekActivity } from "@/lib/data/mockData";

export function WeeklyProgress() {
  const todayIndex = 3; // Thursday is today in our mock data
  const totalActions = weekActivity.reduce((sum, a) => sum + a, 0);

  return (
    <Card
      className="responsive-row weekly-progress-gap"
      style={{
        justifyContent: "space-between",
        padding: "14px 20px",
        marginBottom: 10,
      }}
      animationDelay={0}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 16 }}>🔥</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: colors.text }}>
            3-day streak
          </span>
        </div>
        <span style={{ color: colors.border }}>|</span>
        <div style={{ display: "flex", gap: 6, alignItems: "flex-end" }}>
          {weekDays.map((day, i) => {
            const isToday = i === todayIndex;
            const isFuture = i > todayIndex;
            const level = weekActivity[i];

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
                    width: 20,
                    height: 20,
                    borderRadius: 5,
                    background: isFuture
                      ? colors.surfaceAlt
                      : level === 0
                      ? colors.surfaceAlt
                      : level === 1
                      ? colors.primaryBg
                      : level >= 2
                      ? colors.primary
                      : colors.surfaceAlt,
                    border: isToday
                      ? `2px solid ${colors.primary}`
                      : `1px solid ${isFuture ? colors.border : level > 0 ? "transparent" : colors.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {level > 0 && !isFuture && (
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        color: level >= 2 ? colors.inv : colors.primary,
                      }}
                    >
                      {level}
                    </span>
                  )}
                </div>
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: isToday ? 700 : 400,
                    color: isToday ? colors.text : colors.textMuted,
                  }}
                >
                  {day}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ fontSize: 12, color: colors.textSec }}>
        <span style={{ fontWeight: 600, color: colors.primary }}>
          {totalActions} actions
        </span>{" "}
        this week · Keep it up!
      </div>
    </Card>
  );
}
