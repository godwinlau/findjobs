"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { colors } from "@/lib/constants/colors";
import type { TourStep } from "./tour-config";

interface SpotlightOverlayProps {
  steps: TourStep[];
  onComplete: () => void;
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const PADDING = 8;
const TOOLTIP_GAP = 12;
const TRANSITION_DURATION = 150;

export function SpotlightOverlay({ steps, onComplete }: SpotlightOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState<Rect | null>(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [validSteps, setValidSteps] = useState<TourStep[]>([]);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Filter to only steps whose target elements exist
  useEffect(() => {
    const available = steps.filter(
      (s) => document.querySelector(`[data-tour="${s.target}"]`) !== null
    );
    setValidSteps(available);
    if (available.length === 0) {
      onComplete();
    }
  }, [steps, onComplete]);

  const positionSpotlight = useCallback(() => {
    if (validSteps.length === 0) return;
    const step = validSteps[currentStep];
    if (!step) return;

    const el = document.querySelector(`[data-tour="${step.target}"]`);
    if (!el) {
      // Skip to next step if element not found
      if (currentStep < validSteps.length - 1) {
        setCurrentStep((s) => s + 1);
      } else {
        onComplete();
      }
      return;
    }

    el.scrollIntoView({ behavior: "smooth", block: "nearest" });

    // Small delay to let scroll finish
    requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      setSpotlightRect({
        top: rect.top - PADDING + window.scrollY,
        left: rect.left - PADDING,
        width: rect.width + PADDING * 2,
        height: rect.height + PADDING * 2,
      });
    });
  }, [currentStep, validSteps, onComplete]);

  // Position spotlight when step changes
  useEffect(() => {
    if (validSteps.length === 0) return;

    setTooltipVisible(false);
    positionSpotlight();

    const timer = setTimeout(() => {
      setTooltipVisible(true);
    }, TRANSITION_DURATION);

    return () => clearTimeout(timer);
  }, [currentStep, validSteps, positionSpotlight]);

  // Reposition on resize/scroll
  useEffect(() => {
    const handleReposition = () => positionSpotlight();
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);
    return () => {
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [positionSpotlight]);

  function handleNext() {
    if (currentStep < validSteps.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      onComplete();
    }
  }

  if (validSteps.length === 0 || !spotlightRect) return null;

  const step = validSteps[currentStep];
  const isLast = currentStep === validSteps.length - 1;

  // Calculate tooltip position
  const tooltipStyle = getTooltipPosition(
    spotlightRect,
    step.position,
    tooltipRef.current
  );

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9998,
        pointerEvents: "none",
      }}
    >
      {/* Overlay with cutout */}
      <div
        style={{
          position: "absolute",
          top: spotlightRect.top - window.scrollY,
          left: spotlightRect.left,
          width: spotlightRect.width,
          height: spotlightRect.height,
          borderRadius: 12,
          boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.5)",
          transition: `all ${TRANSITION_DURATION}ms linear`,
          willChange: "top, left, width, height",
          pointerEvents: "none",
        }}
      />

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        style={{
          position: "absolute",
          ...tooltipStyle,
          background: colors.surface,
          borderRadius: 12,
          padding: 20,
          maxWidth: 320,
          width: "calc(100vw - 32px)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
          pointerEvents: "auto",
          opacity: tooltipVisible ? 1 : 0,
          transition: `opacity 0.1s linear`,
        }}
      >
        <div
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: colors.text,
            marginBottom: 6,
          }}
        >
          {step.title}
        </div>
        <div
          style={{
            fontSize: 13,
            color: colors.textSec,
            lineHeight: 1.6,
            marginBottom: 16,
          }}
        >
          {step.description}
        </div>

        {/* Controls */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {validSteps.map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === currentStep ? 16 : 6,
                  height: 6,
                  borderRadius: 3,
                  background:
                    i === currentStep ? colors.primary : colors.border,
                  transition: "all 0.15s linear",
                }}
              />
            ))}
            <span
              style={{
                fontSize: 12,
                color: colors.textMuted,
                marginLeft: 8,
              }}
            >
              {currentStep + 1}/{validSteps.length}
            </span>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            {!isLast && (
              <button
                type="button"
                onClick={onComplete}
                style={{
                  padding: "6px 12px",
                  borderRadius: 8,
                  border: "none",
                  background: "transparent",
                  color: colors.textMuted,
                  fontSize: 13,
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                Skip tour
              </button>
            )}
            <button
              type="button"
              onClick={handleNext}
              style={{
                padding: "6px 16px",
                borderRadius: 8,
                border: "none",
                background: colors.primary,
                color: colors.inv,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {isLast ? "Got it!" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function getTooltipPosition(
  rect: Rect,
  position: TourStep["position"],
  tooltipEl: HTMLDivElement | null
): React.CSSProperties {
  const scrollY = window.scrollY;
  const viewportH = window.innerHeight;
  const viewportW = window.innerWidth;
  const tooltipH = tooltipEl?.offsetHeight ?? 160;
  const tooltipW = Math.min(320, viewportW - 32);

  const spotTop = rect.top - scrollY;
  const spotBottom = spotTop + rect.height;
  const spotCenterX = rect.left + rect.width / 2;

  // Clamp horizontal position to keep tooltip within viewport
  let left = spotCenterX - tooltipW / 2;
  left = Math.max(16, Math.min(left, viewportW - tooltipW - 16));

  // Prefer requested position, fall back if not enough space
  if (position === "bottom" && spotBottom + TOOLTIP_GAP + tooltipH <= viewportH) {
    return { top: spotBottom + TOOLTIP_GAP, left };
  }

  if (position === "top" && spotTop - TOOLTIP_GAP - tooltipH >= 0) {
    return { top: spotTop - TOOLTIP_GAP - tooltipH, left };
  }

  // Fallback: place below if space, else above
  if (spotBottom + TOOLTIP_GAP + tooltipH <= viewportH) {
    return { top: spotBottom + TOOLTIP_GAP, left };
  }

  return { top: Math.max(16, spotTop - TOOLTIP_GAP - tooltipH), left };
}
