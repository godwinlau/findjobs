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
    default: { background: colors.surface },
    highlighted: { background: colors.surface },
    success: { background: colors.successBg },
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
        border: "2px solid #0A0A0A",
        padding: paddings[padding],
        animation: animated ? `slam 0.4s cubic-bezier(.22,1,.36,1) ${animationDelay}s both` : undefined,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
