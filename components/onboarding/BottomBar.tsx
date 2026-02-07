"use client";

interface BottomBarDotProps {
  filled: boolean;
}

interface BottomBarCheckProps {
  done: boolean;
}

interface BottomBarProps {
  variant?: "default" | "dots" | "checks";
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  saving?: boolean;
  /** For dots variant: array of filled states */
  dots?: boolean[];
  /** For dots variant: hint text */
  hint?: string;
  hintReady?: boolean;
  /** For dots variant: count badge */
  count?: number;
  /** For checks variant: array of done states */
  checks?: boolean[];
}

function Dot({ filled }: BottomBarDotProps) {
  return <div className={`ob-bb-dot${filled ? " filled" : ""}`} />;
}

function Check({ done }: BottomBarCheckProps) {
  return (
    <div className={`ob-bb-check${done ? " done" : " empty"}`}>
      {done ? "\u2713" : ""}
    </div>
  );
}

export function BottomBar({
  variant = "default",
  onBack,
  onNext,
  nextLabel = "Continue",
  nextDisabled = false,
  saving = false,
  dots,
  hint,
  hintReady,
  count,
  checks,
}: BottomBarProps) {
  const disabled = nextDisabled || saving;
  const label = saving ? "Saving..." : nextLabel;

  return (
    <div className="ob-bottom-bar">
      <div className="ob-bottom-inner">
        {/* Left side */}
        {variant === "dots" ? (
          <div className="ob-bb-left">
            <div className="ob-bb-dots">
              {dots?.map((f, i) => <Dot key={i} filled={f} />)}
            </div>
            {hint && (
              <div className={`ob-bb-hint${hintReady ? " ready" : ""}`}>
                {hint}
              </div>
            )}
          </div>
        ) : onBack ? (
          <button className="ob-bb-back" onClick={onBack}>
            &larr; Back
          </button>
        ) : (
          <div />
        )}

        {/* Right side */}
        <div className="ob-bb-right">
          {variant === "checks" && checks && (
            <div className="ob-bb-progress">
              {checks.map((d, i) => <Check key={i} done={d} />)}
            </div>
          )}
          <button
            className="ob-bb-next"
            disabled={disabled}
            onClick={onNext}
          >
            {label}
            {variant === "dots" && count !== undefined && (
              <div className={`ob-bb-count${count > 0 ? " visible" : ""}`}>
                {count}
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
