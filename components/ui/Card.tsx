"use client";

import { colors } from "@/lib/constants/colors";
import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "highlighted" | "success";
  padding?: "sm" | "md" | "lg";
  animated?: boolean;
  animationDelay?: number;
}

export function Card({
  children,
  variant = "default",
  padding = "md",
  animated = true,
  animationDelay = 0,
  style,
  ...props
}: CardProps) {
  const variants = {
    default: { border: colors.border, background: colors.surface },
    highlighted: { border: colors.borderHover, background: colors.surface },
    success: { border: colors.successBorder, background: colors.surface },
  };

  const paddings = {
    sm: "12px 16px",
    md: "16px 20px",
    lg: "22px 24px",
  };

  const v = variants[variant];

  return (
    <div
      style={{
        background: v.background,
        borderRadius: 12,
        border: `1px solid ${v.border}`,
        padding: paddings[padding],
        animation: animated ? `fadeUp 0.3s ease ${animationDelay}s both` : undefined,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
