"use client";

import { colors } from "@/lib/constants/colors";
import type { UserRole } from "@/lib/types";

interface StepRoleSelectProps {
  selected: UserRole | null;
  onSelect: (role: UserRole) => void;
}

const roles = [
  {
    value: "job_seeker" as const,
    icon: "🔍",
    title: "I'm Looking for Work",
    description: "Find jobs that match your skills, get AI-powered recommendations, and track applications.",
  },
  {
    value: "employer" as const,
    icon: "🏢",
    title: "I'm Hiring",
    description: "Post jobs, search candidates, and use AI matching to find the right talent.",
  },
];

export function StepRoleSelect({ selected, onSelect }: StepRoleSelectProps) {
  return (
    <div>
      <h2
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: colors.text,
          marginBottom: 6,
        }}
      >
        Welcome to HanapBuhay
      </h2>
      <p
        style={{
          fontSize: 14,
          color: colors.textSec,
          marginBottom: 28,
        }}
      >
        What brings you here?
      </p>

      <div style={{ display: "flex", gap: 16 }}>
        {roles.map((role) => {
          const isSelected = selected === role.value;
          return (
            <button
              key={role.value}
              type="button"
              onClick={() => onSelect(role.value)}
              style={{
                flex: 1,
                padding: 24,
                borderRadius: 12,
                border: `2px solid ${isSelected ? colors.primary : colors.border}`,
                background: isSelected ? colors.primaryBg : colors.surface,
                boxShadow: isSelected
                  ? `0 0 0 3px ${colors.primaryBorder}`
                  : "none",
                cursor: "pointer",
                textAlign: "center",
                transition: "all 0.2s ease",
              }}
            >
              <div style={{ fontSize: 36, marginBottom: 12 }}>{role.icon}</div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: isSelected ? colors.primary : colors.text,
                  marginBottom: 8,
                }}
              >
                {role.title}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: colors.textSec,
                  lineHeight: 1.5,
                }}
              >
                {role.description}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
