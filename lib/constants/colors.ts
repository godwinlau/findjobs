// HanapBuhay Design System - Colors
// Values reference CSS custom properties so they respond to dark mode.
// The actual hex values live in globals.css :root / [data-theme="dark"].
export const colors = {
  bg: "var(--hb-bg)",
  surface: "var(--hb-surface)",
  surfaceAlt: "var(--hb-surface-alt)",
  border: "var(--hb-border)",
  borderHover: "var(--hb-border-hover)",
  primary: "var(--hb-primary)",
  primarySoft: "var(--hb-primary-soft)",
  primaryBg: "var(--hb-primary-bg)",
  primaryBorder: "var(--hb-primary-border)",
  success: "var(--hb-success)",
  successSoft: "var(--hb-success-soft)",
  successBg: "var(--hb-success-bg)",
  successBorder: "var(--hb-success-border)",
  accent: "var(--hb-accent)",
  accentBg: "var(--hb-accent-bg)",
  accentBorder: "var(--hb-accent-border)",
  warning: "var(--hb-warning)",
  warningBg: "var(--hb-warning-bg)",
  warningBorder: "var(--hb-warning-border)",
  text: "var(--hb-text)",
  textSec: "var(--hb-text-sec)",
  textMuted: "var(--hb-text-muted)",
  inv: "var(--hb-inv)",
  live: "var(--hb-live)",
} as const;

export type ColorKey = keyof typeof colors;
