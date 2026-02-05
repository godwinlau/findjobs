"use client";

import { useState, useCallback } from "react";
import { colors } from "@/lib/constants/colors";
import { Button } from "@/components/ui";
import { saveAssessmentResult } from "@/lib/actions/assessments";
import type { SkillAssessment, QuizResult } from "@/lib/types/learn";

interface AssessmentQuizModalProps {
  assessment: SkillAssessment;
  onClose: () => void;
  onComplete: (result: QuizResult) => void;
}

export function AssessmentQuizModal({
  assessment,
  onClose,
  onComplete,
}: AssessmentQuizModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [answers, setAnswers] = useState<number[]>([]);

  const questions = assessment.questions;
  const current = questions[currentIndex];
  const total = questions.length;
  const progress = ((currentIndex + (finished ? 1 : 0)) / total) * 100;

  const handleSelect = useCallback(
    (optIndex: number) => {
      if (showExplanation) return;
      setSelectedOption(optIndex);
      setShowExplanation(true);
      setAnswers((prev) => [...prev, optIndex]);
      if (optIndex === current.correctIndex) {
        setScore((s) => s + 1);
      }
    },
    [showExplanation, current.correctIndex]
  );

  const handleNext = useCallback(() => {
    if (currentIndex < total - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      const finalScore = score;
      setFinished(true);

      const questionIds = questions.map((q) => q.id);
      const result: QuizResult = {
        score: finalScore,
        total,
        completedAt: new Date().toISOString(),
        questionIds,
        answers: [...answers],
      };

      // Save to Supabase (fire-and-forget)
      saveAssessmentResult({
        categoryId: assessment.categoryId,
        score: finalScore,
        total,
        questionIds,
        answers: [...answers],
      });

      onComplete(result);
    }
  }, [currentIndex, total, score, answers, questions, assessment.categoryId, onComplete]);

  const getScoreMessage = (s: number, t: number) => {
    const pct = (s / t) * 100;
    if (pct === 100) return "Perfect score!";
    if (pct >= 80) return "Great job!";
    if (pct >= 60) return "Good effort!";
    return "Keep learning!";
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        animation: "fadeIn 0.2s ease both",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: colors.surface,
          borderRadius: 16,
          width: "100%",
          maxWidth: 480,
          maxHeight: "90vh",
          overflow: "auto",
          animation: "fadeUp 0.3s ease both",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: `1px solid ${colors.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 16 }}>{assessment.icon}</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: colors.text }}>
              {assessment.categoryName} Assessment
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: 18,
              color: colors.textMuted,
              cursor: "pointer",
              padding: 4,
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        {/* Progress bar */}
        <div style={{ padding: "0 20px", marginTop: 16 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 6,
            }}
          >
            <span style={{ fontSize: 11, color: colors.textMuted, fontWeight: 600 }}>
              {finished
                ? "Complete"
                : `Question ${currentIndex + 1} of ${total}`}
            </span>
            <span style={{ fontSize: 11, color: colors.textMuted }}>
              {Math.round(progress)}%
            </span>
          </div>
          <div
            style={{
              height: 4,
              borderRadius: 2,
              background: colors.surfaceAlt,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${progress}%`,
                borderRadius: 2,
                background: assessment.color,
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: 20 }}>
          {finished ? (
            /* Score summary */
            <div
              style={{
                textAlign: "center",
                padding: "20px 0",
              }}
            >
              <div
                style={{
                  fontSize: 48,
                  fontWeight: 800,
                  color: colors.text,
                  lineHeight: 1.2,
                }}
              >
                {score}/{total}
              </div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: score === total ? colors.success : colors.primary,
                  marginTop: 8,
                }}
              >
                {getScoreMessage(score, total)}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: colors.textMuted,
                  marginTop: 8,
                  lineHeight: 1.5,
                }}
              >
                You answered {score} out of {total} questions correctly in{" "}
                {assessment.categoryName}.
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  justifyContent: "center",
                  marginTop: 24,
                }}
              >
                <Button variant="outline" size="md" onClick={onClose}>
                  Done
                </Button>
              </div>
            </div>
          ) : (
            /* Question */
            <>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: colors.text,
                  lineHeight: 1.5,
                  marginBottom: 16,
                }}
              >
                {current.question}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {current.options.map((option, i) => {
                  const isSelected = selectedOption === i;
                  const isCorrect = i === current.correctIndex;

                  let bg: string = colors.surface;
                  let border: string = colors.border;
                  let textColor: string = colors.text;

                  if (showExplanation) {
                    if (isCorrect) {
                      bg = colors.successBg;
                      border = colors.successBorder;
                      textColor = colors.success;
                    } else if (isSelected && !isCorrect) {
                      bg = "#FEF2F2";
                      border = "#FECACA";
                      textColor = "#DC2626";
                    }
                  } else if (isSelected) {
                    bg = colors.primaryBg;
                    border = colors.primaryBorder;
                    textColor = colors.primary;
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => handleSelect(i)}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 10,
                        padding: "10px 14px",
                        borderRadius: 8,
                        border: `1px solid ${border}`,
                        background: bg,
                        cursor: showExplanation ? "default" : "pointer",
                        textAlign: "left",
                        fontSize: 13,
                        color: textColor,
                        fontWeight: isSelected || (showExplanation && isCorrect) ? 600 : 400,
                        lineHeight: 1.4,
                        transition: "all 0.15s ease",
                      }}
                    >
                      <span
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          border: `2px solid ${border}`,
                          background:
                            isSelected || (showExplanation && isCorrect)
                              ? showExplanation
                                ? isCorrect
                                  ? colors.success
                                  : "#DC2626"
                                : colors.primary
                              : "transparent",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          fontSize: 10,
                          color: "#fff",
                          fontWeight: 700,
                          marginTop: 1,
                        }}
                      >
                        {showExplanation && isCorrect
                          ? "✓"
                          : showExplanation && isSelected && !isCorrect
                            ? "✕"
                            : ""}
                      </span>
                      {option}
                    </button>
                  );
                })}
              </div>

              {/* Explanation */}
              {showExplanation && (
                <div
                  style={{
                    marginTop: 14,
                    padding: "10px 14px",
                    borderRadius: 8,
                    background: colors.surfaceAlt,
                    fontSize: 12,
                    color: colors.textSec,
                    lineHeight: 1.5,
                    animation: "fadeUp 0.2s ease both",
                  }}
                >
                  <strong style={{ color: colors.text }}>Explanation:</strong>{" "}
                  {current.explanation}
                </div>
              )}

              {/* Next button */}
              {showExplanation && (
                <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
                  <Button variant="primary" size="md" onClick={handleNext}>
                    {currentIndex < total - 1 ? "Next →" : "See Results"}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
