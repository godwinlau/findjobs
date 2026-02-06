"use client";

import { Card } from "@/components/ui";
import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: number | string;
  trend?: {
    delta: number;
    label?: string;
  };
  progress?: {
    current: number;
    max: number;
    label?: string;
  };
  suffix?: string;
  footer?: ReactNode;
  animationDelay?: number;
}

export function StatCard({
  label,
  value,
  trend,
  progress,
  suffix = "",
  footer,
  animationDelay = 0,
}: StatCardProps) {
  const getTrendColor = (delta: number): string => {
    if (delta > 0) return "#6EE7B7";
    if (delta < 0) return "#EF4444";
    return "#888";
  };

  const getTrendArrow = (delta: number): string => {
    if (delta > 0) return "↑";
    if (delta < 0) return "↓";
    return "";
  };

  const getTrendText = (delta: number, customLabel?: string): string => {
    if (delta === 0) return "No change";
    const prefix = delta > 0 ? "+" : "";
    const label = customLabel ?? "from last week";
    return `${prefix}${delta} ${label}`;
  };

  return (
    <Card
      style={{
        padding: 20,
        minHeight: 140,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
      animationDelay={animationDelay}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          fontFamily: "var(--font-mono)",
          textTransform: "uppercase" as const,
          letterSpacing: "0.06em",
          color: "#888",
        }}
      >
        {label}
      </div>

      <div>
        <div
          style={{
            fontSize: 36,
            fontWeight: 800,
            lineHeight: 1,
            color: "#0A0A0A",
            letterSpacing: "-0.04em",
            margin: "8px 0",
          }}
        >
          {value}
          {suffix && (
            <span style={{ fontSize: 18, fontWeight: 700 }}>{suffix}</span>
          )}
        </div>

        {trend !== undefined && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              fontSize: 11,
              fontWeight: 700,
              fontFamily: "var(--font-mono)",
              textTransform: "uppercase" as const,
              color: getTrendColor(trend.delta),
            }}
          >
            {getTrendArrow(trend.delta)} {getTrendText(trend.delta, trend.label)}
          </div>
        )}

        {progress && (
          <div style={{ marginTop: 8 }}>
            <div
              style={{
                height: 6,
                background: "rgba(10,10,10,0.08)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${Math.min((progress.current / progress.max) * 100, 100)}%`,
                  height: "100%",
                  background: "#FBBF24",
                  transition: "width 0.3s ease",
                }}
              />
            </div>
            {progress.label && (
              <div
                style={{
                  fontSize: 11,
                  fontFamily: "var(--font-mono)",
                  textTransform: "uppercase" as const,
                  color: "#888",
                  marginTop: 4,
                }}
              >
                {progress.label}
              </div>
            )}
          </div>
        )}
      </div>

      {footer && <div style={{ marginTop: 8 }}>{footer}</div>}
    </Card>
  );
}
