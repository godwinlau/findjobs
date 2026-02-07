"use client";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  color?: "light" | "dark";
}

export function Logo({ size = "md", color = "light" }: LogoProps) {
  const sizes = {
    sm: 14,
    md: 18,
    lg: 24,
  };

  const textColor = color === "light" ? "#F5F5F0" : "#0A0A0A";

  return (
    <span
      style={{
        fontSize: sizes[size],
        fontWeight: 800,
        letterSpacing: "-0.04em",
        fontStyle: "italic",
        lineHeight: 1,
        color: textColor,
      }}
    >
      bigmo
      <span style={{ color: "#FBBF24" }}>vv</span>
    </span>
  );
}
