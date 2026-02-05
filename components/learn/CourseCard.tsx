"use client";

import { colors } from "@/lib/constants/colors";
import { Card, CompanyLogo, Badge, Button } from "@/components/ui";
import type { ScoredCourse } from "@/lib/types/learn";

interface CourseCardProps {
  course: ScoredCourse;
  animationDelay?: number;
}

export function CourseCard({ course, animationDelay = 0 }: CourseCardProps) {
  return (
    <Card
      style={{ display: "flex", flexDirection: "column", gap: 12 }}
      animationDelay={animationDelay}
    >
      {/* Provider + title */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <CompanyLogo
          letter={course.providerLetter}
          bgColor={course.providerLogoBg}
          textColor={course.providerLogoColor}
          size="md"
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: colors.text,
              lineHeight: 1.3,
            }}
          >
            {course.title}
          </div>
          <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>
            {course.provider}
          </div>
        </div>
      </div>

      {/* Description */}
      <div
        style={{
          fontSize: 12,
          color: colors.textSec,
          lineHeight: 1.5,
        }}
      >
        {course.description}
      </div>

      {/* Skill gap badges */}
      {course.skillGapsCovered.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {course.skillGapsCovered.slice(0, 3).map((skill) => (
            <Badge key={skill} variant="accent" size="sm">
              +{skill}
            </Badge>
          ))}
          {course.skillGapsCovered.length > 3 && (
            <Badge variant="muted" size="sm">
              +{course.skillGapsCovered.length - 3} more
            </Badge>
          )}
        </div>
      )}

      {/* Meta row */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {course.jobsUnlocked > 0 && (
          <Badge variant="primary" size="sm">
            +{course.jobsUnlocked} job matches
          </Badge>
        )}
        <Badge variant="muted" size="sm">
          ~{course.estimatedHours}h
        </Badge>
        <Badge variant="muted" size="sm">
          {course.difficulty}
        </Badge>
        {course.isFree && (
          <span
            style={{
              padding: "3px 9px",
              borderRadius: 6,
              fontSize: 10,
              fontWeight: 600,
              background: colors.successBg,
              color: colors.success,
              border: `1px solid ${colors.successBorder}`,
            }}
          >
            Free
          </span>
        )}
      </div>

      {/* Top reason */}
      {course.reasons.length > 0 && course.reasons[0] !== "You already have these skills" && (
        <div
          style={{
            fontSize: 11,
            color: colors.primary,
            fontWeight: 500,
            padding: "4px 8px",
            background: colors.primaryBg,
            borderRadius: 6,
            border: `1px solid ${colors.primaryBorder}`,
          }}
        >
          {course.reasons[0]}
        </div>
      )}

      {/* CTA */}
      <a
        href={course.url}
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: "none" }}
      >
        <Button variant="secondary" size="sm" style={{ width: "100%" }}>
          Start Learning →
        </Button>
      </a>
    </Card>
  );
}
