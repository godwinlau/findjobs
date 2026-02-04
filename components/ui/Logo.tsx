"use client";

import { colors } from "@/lib/constants/colors";

interface LogoProps {
  size?: "sm" | "md" | "lg";
}

export function Logo({ size = "md" }: LogoProps) {
  const sizes = {
    sm: { box: 20, fontSize: 9, textSize: 12 },
    md: { box: 24, fontSize: 11, textSize: 14 },
    lg: { box: 32, fontSize: 14, textSize: 18 },
  };

  const s = sizes[size];

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
      <div
        style={{
          width: s.box,
          height: s.box,
          borderRadius: 6,
          background: colors.primary,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: s.fontSize,
          color: colors.inv,
          fontWeight: 800,
        }}
      >
        H
      </div>
      <span
        style={{
          fontSize: s.textSize,
          fontWeight: 700,
          letterSpacing: "-0.03em",
        }}
      >
        Hanap<span style={{ color: colors.primary }}>Buhay</span>
      </span>
    </div>
  );
}
