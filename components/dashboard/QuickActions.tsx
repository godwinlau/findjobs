"use client";

import Link from "next/link";
import { PencilSimple, Exam, MagnifyingGlass, BookOpen, ArrowRight } from "@phosphor-icons/react";

interface QuickActionsProps {
  profileComplete: boolean;
  hasAssessments: boolean;
  animationDelay?: number;
}

interface ActionItem {
  href: string;
  icon: React.ReactNode;
  label: string;
  description: string;
}

export function QuickActions({
  profileComplete,
  hasAssessments,
  animationDelay = 0,
}: QuickActionsProps) {
  const actions: ActionItem[] = [
    ...(!profileComplete
      ? [
          {
            href: "/profile",
            icon: <PencilSimple size={18} weight="fill" />,
            label: "Complete Profile",
            description: "Unlock better job matches",
          },
        ]
      : []),
    {
      href: "/learn#skill-assessments",
      icon: <Exam size={18} weight="fill" />,
      label: hasAssessments ? "Take Another Assessment" : "Take Assessment",
      description: "Validate your skills",
    },
    {
      href: "/explore",
      icon: <MagnifyingGlass size={18} weight="fill" />,
      label: "Browse Jobs",
      description: "Explore all opportunities",
    },
    {
      href: "/learn",
      icon: <BookOpen size={18} weight="fill" />,
      label: "Learn New Skills",
      description: "Boost your career",
    },
  ];

  return (
    <div
      style={{
        background: "#F5F5F0",
        border: "2px solid #0A0A0A",
        overflow: "hidden",
        animation: `slam 0.4s cubic-bezier(.22,1,.36,1) ${animationDelay}s both`,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "14px 20px",
          borderBottom: "2px solid #0A0A0A",
        }}
      >
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            fontFamily: "var(--font-mono)",
            textTransform: "uppercase" as const,
            letterSpacing: "0.06em",
            color: "#888",
          }}
        >
          Quick Actions
        </span>
      </div>

      {/* Action items */}
      <div>
        {actions.map((action, i) => (
          <Link
            key={action.href + action.label}
            href={action.href}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "14px 20px",
              textDecoration: "none",
              transition: "all 0.15s ease",
              borderBottom: i < actions.length - 1 ? "1px solid rgba(10,10,10,0.08)" : "none",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(10,10,10,0.04)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            {/* Icon */}
            <div
              style={{
                width: 40,
                height: 40,
                background: "#0A0A0A",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                color: "#FBBF24",
              }}
            >
              {action.icon}
            </div>

            {/* Text */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#0A0A0A",
                  lineHeight: 1.3,
                }}
              >
                {action.label}
              </div>
              <div
                style={{
                  fontSize: 11,
                  fontFamily: "var(--font-mono)",
                  textTransform: "uppercase" as const,
                  color: "#888",
                  marginTop: 2,
                }}
              >
                {action.description}
              </div>
            </div>

            {/* Arrow */}
            <ArrowRight
              size={16}
              weight="bold"
              color="#0A0A0A"
              style={{ flexShrink: 0 }}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
