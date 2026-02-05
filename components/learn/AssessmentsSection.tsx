"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { colors } from "@/lib/constants/colors";
import { AssessmentCard } from "./AssessmentCard";
import { AssessmentQuizModal } from "./AssessmentQuizModal";
import type { SkillAssessment, QuizResult } from "@/lib/types/learn";

interface AssessmentsSectionProps {
  assessments: SkillAssessment[];
  initialResults: Record<string, QuizResult>;
}

export function AssessmentsSection({
  assessments,
  initialResults,
}: AssessmentsSectionProps) {
  const router = useRouter();
  const [activeQuiz, setActiveQuiz] = useState<SkillAssessment | null>(null);
  const [results, setResults] = useState<Record<string, QuizResult>>(initialResults);

  const handleComplete = useCallback(
    (result: QuizResult) => {
      if (!activeQuiz) return;
      setResults((prev) => ({ ...prev, [activeQuiz.categoryId]: result }));
    },
    [activeQuiz]
  );

  const handleRetake = useCallback(
    (assessment: SkillAssessment) => {
      // Refresh to get new question selection from server, then open quiz
      router.refresh();
      setActiveQuiz(assessment);
    },
    [router]
  );

  return (
    <div id="skill-assessments" style={{ marginBottom: 20 }}>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: colors.text }}>
          Skill Assessments
        </div>
        <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
          Test your knowledge and track your progress
        </div>
      </div>

      <div
        className="learn-assessments-scroll"
        style={{
          display: "flex",
          gap: 12,
          overflowX: "auto",
          paddingBottom: 4,
        }}
      >
        {assessments.map((a, i) => (
          <AssessmentCard
            key={a.id}
            assessment={a}
            result={results[a.categoryId] ?? null}
            onStart={() =>
              results[a.categoryId] ? handleRetake(a) : setActiveQuiz(a)
            }
            animationDelay={0.12 + i * 0.06}
          />
        ))}
      </div>

      {activeQuiz && (
        <AssessmentQuizModal
          assessment={activeQuiz}
          onClose={() => setActiveQuiz(null)}
          onComplete={handleComplete}
        />
      )}
    </div>
  );
}
