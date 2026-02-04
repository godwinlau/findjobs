"use client";

import { colors } from "@/lib/constants/colors";
import { Card } from "@/components/ui";
import { Application } from "@/lib/types";

interface ApplicationsTrackerProps {
  applications: Application[];
}

export function ApplicationsTracker({ applications }: ApplicationsTrackerProps) {
  return (
    <Card
      padding="sm"
      style={{ padding: 0 }}
      animationDelay={0.26}
    >
      <div
        style={{
          padding: "12px 16px",
          borderBottom: `1px solid ${colors.border}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: colors.text }}>
          Applications
        </span>
        <span
          style={{
            fontSize: 11,
            color: colors.primary,
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          All →
        </span>
      </div>
      {applications.map((app, i) => (
        <div
          key={i}
          style={{
            padding: "10px 16px",
            borderBottom:
              i < applications.length - 1 ? `1px solid ${colors.border}` : "none",
            cursor: "pointer",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: colors.text }}>
                {app.role}
              </div>
              <div style={{ fontSize: 10, color: colors.textMuted, marginTop: 1 }}>
                {app.company}
              </div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "2px 8px",
                  borderRadius: 5,
                  background: app.bg,
                }}
              >
                <div
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: app.color,
                    animation: app.urgent ? "pulse 2s infinite" : "none",
                  }}
                />
                <span style={{ fontSize: 10, fontWeight: 600, color: app.color }}>
                  {app.status}
                </span>
              </div>
              <div style={{ fontSize: 10, color: colors.textMuted, marginTop: 2 }}>
                {app.detail}
              </div>
            </div>
          </div>
        </div>
      ))}
    </Card>
  );
}
