"use client";

import Link from "next/link";
import type { NotificationItem } from "@/lib/actions/notifications";
import { Card } from "@/components/ui";

interface RecentActivityPreviewProps {
  activities: NotificationItem[];
}

export function RecentActivityPreview({
  activities,
}: RecentActivityPreviewProps) {
  return (
    <Card>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: activities.length > 0 ? 12 : 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ fontSize: 10, fontWeight: 700, fontFamily: "var(--font-mono)", textTransform: "uppercase" as const, letterSpacing: "0.06em", color: "#888" }}>
            Recent Activity
          </div>
          {activities.length > 0 && (
            <span
              style={{
                width: 8,
                height: 8,
                background: "#FBBF24",
                display: "inline-block",
              }}
            />
          )}
        </div>
        <Link
          href="/notifications"
          style={{
            fontSize: 11,
            fontWeight: 700,
            fontFamily: "var(--font-mono)",
            textTransform: "uppercase" as const,
            letterSpacing: "0.04em",
            color: "#0A0A0A",
            textDecoration: "none",
          }}
        >
          See all →
        </Link>
      </div>
      {activities.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "16px 0",
            fontSize: 12,
            fontFamily: "var(--font-mono)",
            textTransform: "uppercase" as const,
            color: "#888",
          }}
        >
          No recent activity
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {activities.map((item, idx) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 0",
                borderBottom:
                  idx < activities.length - 1
                    ? "1px solid rgba(10,10,10,0.08)"
                    : "none",
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  background: "#0A0A0A",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  flexShrink: 0,
                  color: "#FBBF24",
                }}
              >
                {item.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#0A0A0A",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {item.title}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    fontFamily: "var(--font-mono)",
                    color: "#888",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {item.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
