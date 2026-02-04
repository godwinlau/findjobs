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
      background: colors.primary,
      color: colors.inv,
      border: "none",
      boxShadow: `0 2px 8px ${colors.primary}20`,
    },
    secondary: {
      background: colors.primaryBg,
      color: colors.primary,
      border: `1px solid ${colors.primaryBorder}`,
      boxShadow: "none",
    },
    outline: {
      background: colors.surface,
      color: colors.textSec,
      border: `1px solid ${colors.border}`,
      boxShadow: "none",
    },
    ghost: {
      background: "transparent",
      color: colors.textSec,
      border: "none",
      boxShadow: "none",
    },
  };

  const sizes = {
    sm: { padding: "6px 12px", fontSize: 11, borderRadius: 6 },
    md: { padding: "8px 16px", fontSize: 12, borderRadius: 7 },
    lg: { padding: "10px 24px", fontSize: 13, borderRadius: 8 },
  };

  const v = variants[variant];
  const s = sizes[size];

  return (
    <button
      style={{
        padding: s.padding,
        borderRadius: s.borderRadius,
        fontSize: s.fontSize,
        fontWeight: 600,
        cursor: "pointer",
        whiteSpace: "nowrap",
        ...v,
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
}
