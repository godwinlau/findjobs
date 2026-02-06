"use client";

import Link from "next/link";
import { colors } from "@/lib/constants/colors";
import type { NotificationItem } from "@/lib/actions/notifications";
import { Card } from "@/components/ui";

function formatRelativeTime(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHr = Math.floor(diffMs / 3_600_000);
  const diffDay = Math.floor(diffMs / 86_400_000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(timestamp).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
  });
}

function getDateGroup(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const todayStr = now.toDateString();
  const yesterdayDate = new Date(now);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);

  if (date.toDateString() === todayStr) return "Today";
  if (date.toDateString() === yesterdayDate.toDateString()) return "Yesterday";

  const diffMs = now.getTime() - date.getTime();
  if (diffMs < 7 * 86_400_000) return "This Week";
  return "Earlier";
}

interface NotificationsListProps {
  activities: NotificationItem[];
}

export function NotificationsList({ activities }: NotificationsListProps) {
  if (activities.length === 0) {
    return (
      <Card>
        <div
          style={{
            textAlign: "center",
            padding: "48px 24px",
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 12 }}>📭</div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: colors.text,
              marginBottom: 6,
            }}
          >
            No activity yet
          </div>
          <div
            style={{ fontSize: 13, color: colors.textSec, marginBottom: 16 }}
          >
            Start exploring jobs to build your activity history
          </div>
          <Link
            href="/explore"
            style={{
              display: "inline-block",
              padding: "8px 20px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              background: colors.primary,
              color: colors.inv,
              textDecoration: "none",
            }}
          >
            Explore Jobs
          </Link>
        </div>
      </Card>
    );
  }

  // Group activities by date
  const groups: Record<string, NotificationItem[]> = {};
  for (const activity of activities) {
    const group = getDateGroup(activity.timestamp);
    if (!groups[group]) groups[group] = [];
    groups[group].push(activity);
  }

  const groupOrder = ["Today", "Yesterday", "This Week", "Earlier"];
  let animIndex = 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {groupOrder.map((groupName) => {
        const items = groups[groupName];
        if (!items || items.length === 0) return null;

        return (
          <div
            key={groupName}
            style={{
              animation: `fadeUp 0.3s ease ${animIndex++ * 0.06}s both`,
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: colors.textMuted,
                textTransform: "uppercase",
                letterSpacing: "0.03em",
                marginBottom: 8,
              }}
            >
              {groupName}
            </div>
            <Card>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {items.map((item, idx) => (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "12px 16px",
                      borderBottom:
                        idx < items.length - 1
                          ? `1px solid ${colors.border}`
                          : "none",
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: colors.surfaceAlt,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 16,
                        flexShrink: 0,
                      }}
                    >
                      {item.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: colors.text,
                        }}
                      >
                        {item.title}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: colors.textSec,
                          marginTop: 1,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {item.description}
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: colors.textMuted,
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}
                    >
                      {formatRelativeTime(item.timestamp)}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        );
      })}
    </div>
  );
}
