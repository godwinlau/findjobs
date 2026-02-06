"use client";

import { colors } from "@/lib/constants/colors";

interface AvatarProps {
  initials: string;
  size?: number;
  bgColor?: string;
}

export function Avatar({ initials, size = 28, bgColor = "#FBBF24" }: AvatarProps) {
  return (
    <div
      style={{
        width: size,
        height: size,
        background: bgColor,
        color: "#0A0A0A",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.38,
        fontWeight: 700,
        fontFamily: "var(--font-mono)",
        cursor: "pointer",
      }}
    >
      {initials}
    </div>
  );
}
