"use client";

import { colors } from "@/lib/constants/colors";
import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  style,
  ...props
}: ButtonProps) {
  const variants = {
    primary: {
      background: "#0A0A0A",
      color: "#F5F5F0",
      border: "2px solid #0A0A0A",
      boxShadow: "none",
    },
    secondary: {
      background: "transparent",
      color: "#0A0A0A",
      border: "2px solid #0A0A0A",
      boxShadow: "none",
    },
    outline: {
      background: "transparent",
      color: "#0A0A0A",
      border: "2px solid #0A0A0A",
      boxShadow: "none",
    },
    ghost: {
      background: "transparent",
      color: "#0A0A0A",
      border: "2px solid transparent",
      boxShadow: "none",
    },
  };

  const sizes = {
    sm: { padding: "6px 14px", fontSize: 10 },
    md: { padding: "8px 18px", fontSize: 11 },
    lg: { padding: "10px 24px", fontSize: 12 },
  };

  const v = variants[variant];
  const s = sizes[size];

  return (
    <button
      style={{
        padding: s.padding,
        fontSize: s.fontSize,
        fontWeight: 700,
        fontFamily: "var(--font-mono)",
        textTransform: "uppercase" as const,
        letterSpacing: "0.04em",
        cursor: "pointer",
        whiteSpace: "nowrap",
        transition: "all 0.15s ease",
        ...v,
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
}
