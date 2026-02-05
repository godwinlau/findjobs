"use client";

import { colors } from "@/lib/constants/colors";
import { Card, Badge, Button } from "@/components/ui";
import type { SkillAssessment, QuizResult } from "@/lib/types/learn";

interface AssessmentCardProps {
  assessment: SkillAssessment;
  result: QuizResult | null;
  onStart: () => void;
  animationDelay?: number;
}

export function AssessmentCard({
  assessment,
  result,
  onStart,
  animationDelay = 0,
}: AssessmentCardProps) {
  const completed = result !== null;

  return (
    <Card
      style={{
        minWidth: 200,
        maxWidth: 220,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        scrollSnapAlign: "start",
      }}
      animationDelay={animationDelay}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 9,
            background: assessment.colorBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            flexShrink: 0,
          }}
        >
          {assessment.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: colors.text,
              lineHeight: 1.3,
            }}
          >
            {assessment.categoryName}
          </div>
          <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 1 }}>
            {assessment.skillCount} skills · {assessment.questions.length} questions
          </div>
        </div>
      </div>

      {completed ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Badge variant={result.score === result.total ? "accent" : "primary"}>
              {result.score}/{result.total}
            </Badge>
            <span style={{ fontSize: 11, color: colors.textMuted }}>
              Completed
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={onStart}>
            Retake
          </Button>
        </div>
      ) : (
        <Button variant="secondary" size="sm" onClick={onStart}>
          Take Assessment
        </Button>
      )}
    </Card>
  );
}
