"use client";

import { colors } from "@/lib/constants/colors";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "primary" | "accent" | "warning" | "muted";
  size?: "sm" | "md";
}

export function Badge({ children, variant = "primary", size = "sm" }: BadgeProps) {
  const variants = {
    primary: { bg: colors.primaryBg, color: colors.primary, border: colors.primaryBorder },
    accent: { bg: colors.accentBg, color: colors.accent, border: colors.accentBorder },
    warning: { bg: colors.warningBg, color: colors.warning, border: colors.warningBorder },
    muted: { bg: colors.surfaceAlt, color: colors.textMuted, border: colors.border },
  };

  const sizes = {
    sm: { padding: "3px 9px", fontSize: 10 },
    md: { padding: "5px 10px", fontSize: 11 },
  };

  const v = variants[variant];
  const s = sizes[size];

  return (
    <span
      style={{
        padding: s.padding,
        fontSize: s.fontSize,
        fontWeight: 700,
        fontFamily: "var(--font-mono)",
        textTransform: "uppercase" as const,
        letterSpacing: "0.04em",
        background: "transparent",
        color: v.color,
        border: `1.5px solid ${v.border}`,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}
