"use client";

import { colors } from "@/lib/constants/colors";
import { InputHTMLAttributes } from "react";

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function AuthInput({ label, error, style, ...props }: AuthInputProps) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label
        style={{
          display: "block",
          fontSize: 13,
          fontWeight: 500,
          color: colors.text,
          marginBottom: 6,
        }}
      >
        {label}
      </label>
      <input
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: 8,
          border: `1px solid ${error ? colors.live : colors.border}`,
          background: colors.surface,
          fontSize: 14,
          color: colors.text,
          outline: "none",
          boxSizing: "border-box",
          ...style,
        }}
        {...props}
      />
      {error && (
        <p
          style={{
            fontSize: 12,
            color: colors.live,
            marginTop: 4,
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
