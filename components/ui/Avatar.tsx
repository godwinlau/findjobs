"use client";

import { colors } from "@/lib/constants/colors";

interface AvatarProps {
  initials: string;
  size?: number;
  bgColor?: string;
}

export function Avatar({ initials, size = 30, bgColor = colors.primary }: AvatarProps) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: bgColor,
        color: colors.inv,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.4,
        fontWeight: 700,
        cursor: "pointer",
      }}
    >
      {initials}
    </div>
  );
}
