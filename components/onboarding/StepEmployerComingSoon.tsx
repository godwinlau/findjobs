"use client";

import { colors } from "@/lib/constants/colors";

const features = [
  { icon: "📝", text: "Post jobs and reach qualified candidates" },
  { icon: "📊", text: "Track views and applicants from your dashboard" },
  { icon: "✏️", text: "Edit and manage your job listings anytime" },
  { icon: "🔍", text: "Your postings appear in the job seeker feed" },
];

export function StepEmployerComingSoon() {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🏢</div>
      <h2
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: colors.text,
          marginBottom: 8,
        }}
      >
        You&apos;re All Set to Hire
      </h2>
      <p
        style={{
          fontSize: 14,
          color: colors.textSec,
          marginBottom: 28,
          maxWidth: 380,
          marginLeft: "auto",
          marginRight: "auto",
          lineHeight: 1.6,
        }}
      >
        Here&apos;s what you can do as an employer:
      </p>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          textAlign: "left",
          maxWidth: 360,
          margin: "0 auto 24px",
        }}
      >
        {features.map((feature) => (
          <div
            key={feature.text}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 16px",
              borderRadius: 8,
              background: colors.surfaceAlt,
            }}
          >
            <span style={{ fontSize: 20 }}>{feature.icon}</span>
            <span style={{ fontSize: 14, color: colors.text }}>{feature.text}</span>
          </div>
        ))}
      </div>

      <p
        style={{
          fontSize: 13,
          color: colors.textMuted,
          lineHeight: 1.5,
        }}
      >
        Click <strong>Get Started</strong> to go to your employer dashboard.
      </p>
    </div>
  );
}
