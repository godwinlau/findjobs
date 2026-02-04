// HanapBuhay Design System - Colors
export const colors = {
  bg: "#F8F8F6",
  surface: "#FFFFFF",
  surfaceAlt: "#F2F1EE",
  border: "#E6E5E1",
  borderHover: "#CDCCC7",
  primary: "#0073FF",
  primarySoft: "#3391FF",
  primaryBg: "#EDF4FF",
  primaryBorder: "#B3D4FF",
  success: "#15803D",
  successSoft: "#16A34A",
  successBg: "#F0FDF4",
  successBorder: "#BBF7D0",
  accent: "#1D4ED8",
  accentBg: "#EEF3FF",
  accentBorder: "#C7D7FE",
  warning: "#B45309",
  warningBg: "#FEF9EC",
  warningBorder: "#FDE68A",
  text: "#171714",
  textSec: "#64645E",
  textMuted: "#9E9E96",
  inv: "#FFFFFF",
  live: "#EF4444",
} as const;

export type ColorKey = keyof typeof colors;
