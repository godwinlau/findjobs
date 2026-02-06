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
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div
        style={{
          width: s.box,
          height: s.box,
          background: "#FBBF24",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: s.fontSize,
          color: "#0A0A0A",
          fontWeight: 700,
          fontFamily: "var(--font-mono)",
        }}
      >
        HB
      </div>
      <span
        style={{
          fontSize: s.textSize,
          fontWeight: 800,
          letterSpacing: "-0.03em",
          textTransform: "uppercase" as const,
        }}
      >
        HanapBuhay
      </span>
    </div>
  );
}
