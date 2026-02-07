"use client";

const TOTAL_STEPS = 4;

interface ProgressBarNewProps {
  currentStep: number;
  label?: string;
}

export function ProgressBarNew({ currentStep, label }: ProgressBarNewProps) {
  return (
    <div className="ob-progress-wrap">
      <div className="ob-progress-inner">
        <div className="ob-progress-steps">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => {
            let cls = "ob-prog-seg";
            if (i < currentStep) cls += " done";
            else if (i === currentStep) cls += " active";
            return <div key={i} className={cls} />;
          })}
        </div>
        <div className="ob-prog-label">
          {label || `Step ${currentStep + 1} of ${TOTAL_STEPS}`}
        </div>
      </div>
    </div>
  );
}
