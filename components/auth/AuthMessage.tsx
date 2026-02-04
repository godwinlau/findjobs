"use client";

import { colors } from "@/lib/constants/colors";

interface AuthMessageProps {
  type: "error" | "success";
  message: string;
}

export function AuthMessage({ type, message }: AuthMessageProps) {
  if (!message) return null;

  const isError = type === "error";

  return (
    <div
      style={{
        padding: "10px 14px",
        borderRadius: 8,
        background: isError ? "#FEF2F2" : colors.successBg,
        border: `1px solid ${isError ? "#FECACA" : colors.successBorder}`,
        color: isError ? colors.live : colors.success,
        fontSize: 13,
        marginBottom: 16,
      }}
    >
      {message}
    </div>
  );
}
