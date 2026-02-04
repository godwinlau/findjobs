import { colors } from "@/lib/constants/colors";
import { Card } from "@/components/ui";
import type { WeeklyProgressData } from "@/lib/types";

interface WeeklyProgressProps {
  data: WeeklyProgressData | null;
}

export function WeeklyProgress({ data }: WeeklyProgressProps) {
  if (!data) return null;

  const streakText =
    data.currentStreak === 0
      ? "No streak"
      : data.currentStreak === 1
      ? "1-day streak"
      : `${data.currentStreak}-day streak`;

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
          <span style={{ fontSize: 16 }}>
            {data.currentStreak > 0 ? "🔥" : "💤"}
          </span>
          <span style={{ fontSize: 13, fontWeight: 700, color: colors.text }}>
            {streakText}
          </span>
        </div>
        <span style={{ color: colors.border }}>|</span>
        <div style={{ display: "flex", gap: 6, alignItems: "flex-end" }}>
          {data.days.map((dayData, i) => {
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
                    width: 20,
                    height: 20,
                    borderRadius: 5,
                    background: dayData.isFuture
                      ? colors.surfaceAlt
                      : level === 0
                      ? colors.surfaceAlt
                      : level === 1
                      ? colors.primaryBg
                      : level >= 2
                      ? colors.primary
                      : colors.surfaceAlt,
                    border: dayData.isToday
                      ? `2px solid ${colors.primary}`
                      : `1px solid ${dayData.isFuture ? colors.border : level > 0 ? "transparent" : colors.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {level > 0 && !dayData.isFuture && (
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
                    fontWeight: dayData.isToday ? 700 : 400,
                    color: dayData.isToday ? colors.text : colors.textMuted,
                  }}
                >
                  {dayData.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ fontSize: 12, color: colors.textSec }}>
        <span style={{ fontWeight: 600, color: colors.primary }}>
          {data.totalActions} action{data.totalActions !== 1 ? "s" : ""}
        </span>{" "}
        this week{data.totalActions > 0 ? " · Keep it up!" : ""}
      </div>
    </Card>
  );
}
