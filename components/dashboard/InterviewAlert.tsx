"use client";

import { colors } from "@/lib/constants/colors";
import { Button } from "@/components/ui";

interface InterviewAlertProps {
  company: string;
  role: string;
  date: string;
  time: string;
  format: string;
  daysUntil: number;
}

export function InterviewAlert({
  company,
  role,
  date,
  time,
  format,
  daysUntil,
}: InterviewAlertProps) {
  return (
    <div
      style={{
        background: colors.primaryBg,
        borderRadius: 12,
        border: `1px solid ${colors.primaryBorder}`,
        padding: 16,
        animation: "fadeUp 0.3s ease 0.32s both",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 6,
        }}
      >
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: colors.primary,
            animation: "pulse 2s infinite",
          }}
        />
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: colors.primary,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          Interview in {daysUntil} day{daysUntil !== 1 ? "s" : ""}
        </span>
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: colors.text }}>
        {company} — {role}
      </div>
      <div style={{ fontSize: 11, color: colors.textSec, marginTop: 3 }}>
        {date}, {time} · {format}
      </div>
      <Button
        variant="primary"
        style={{
          marginTop: 12,
          width: "100%",
          padding: "8px 0",
        }}
      >
        Practice for this interview
      </Button>
    </div>
  );
}
