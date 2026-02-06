"use client";

import { colors } from "@/lib/constants/colors";
import {
  PASSWORD_REQUIREMENTS,
  validatePassword,
  getStrengthColor,
  getStrengthLabel,
} from "@/lib/validation/password";

interface PasswordStrengthIndicatorProps {
  password: string;
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const validation = validatePassword(password);

  if (!password) return null;

  return (
    <div style={{ marginTop: 8, marginBottom: 16 }}>
      {/* Strength bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <div
          style={{
            flex: 1,
            height: 4,
            background: colors.border,
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${(validation.passedCount / validation.totalCount) * 100}%`,
              height: "100%",
              background: getStrengthColor(validation.strength),
              borderRadius: 2,
              transition: "width 0.2s ease, background 0.2s ease",
            }}
          />
        </div>
        <span
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: getStrengthColor(validation.strength),
            minWidth: 50,
          }}
        >
          {getStrengthLabel(validation.strength)}
        </span>
      </div>

      {/* Requirements checklist */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {PASSWORD_REQUIREMENTS.map((req, index) => {
          const passed = req.test(password);
          return (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                color: passed ? "#22c55e" : colors.textMuted,
              }}
            >
              <span style={{ fontSize: 10 }}>{passed ? "✓" : "○"}</span>
              <span>{req.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
