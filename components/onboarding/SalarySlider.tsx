"use client";

import { useState, useCallback } from "react";

interface SalarySliderProps {
  min: number;
  max: number;
  onMinChange: (val: number) => void;
  onMaxChange: (val: number) => void;
  skipped: boolean;
  onSkipToggle: () => void;
}

const RANGE_MAX = 200;
const MIN_GAP = 10;

export function SalarySlider({
  min,
  max,
  onMinChange,
  onMaxChange,
  skipped,
  onSkipToggle,
}: SalarySliderProps) {
  const [dragging, setDragging] = useState(false);

  const handleMinChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseInt(e.target.value);
      if (val <= max - MIN_GAP) {
        onMinChange(val);
      }
      if (skipped) onSkipToggle();
    },
    [max, onMinChange, skipped, onSkipToggle]
  );

  const handleMaxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseInt(e.target.value);
      if (val >= min + MIN_GAP) {
        onMaxChange(val);
      }
      if (skipped) onSkipToggle();
    },
    [min, onMaxChange, skipped, onSkipToggle]
  );

  const fillLeft = (min / RANGE_MAX) * 100;
  const fillWidth = ((max - min) / RANGE_MAX) * 100;

  const formatVal = (lo: number, hi: number) => {
    if (hi >= RANGE_MAX) return `\u20B1${lo}K \u2013 \u20B1200K+`;
    return `\u20B1${lo}K \u2013 \u20B1${hi}K`;
  };

  return (
    <div className="ob-salary-section">
      <div className="ob-salary-display">
        <div>
          {skipped ? (
            <div className="ob-salary-val skipped">No preference</div>
          ) : (
            <div className="ob-salary-val">
              {formatVal(min, max).split("\u2013")[0]}
              <span>&ndash;</span>
              {formatVal(min, max).split("\u2013")[1]}
            </div>
          )}
          <div className="ob-salary-period">Monthly &middot; before tax</div>
        </div>
        <button
          className={`ob-salary-skip${skipped ? " active" : ""}`}
          onClick={onSkipToggle}
        >
          {skipped ? "Skipped \u2713" : "Skip this"}
        </button>
      </div>

      <div className="ob-slider-wrap">
        <div className="ob-slider-track">
          <div
            className={`ob-slider-fill${skipped ? " disabled" : ""}`}
            style={{ left: `${fillLeft}%`, width: `${fillWidth}%` }}
          />
        </div>
        <input
          type="range"
          min="0"
          max={RANGE_MAX}
          value={min}
          className={skipped ? "disabled" : ""}
          onChange={handleMinChange}
          onMouseDown={() => setDragging(true)}
          onMouseUp={() => setDragging(false)}
          onTouchStart={() => setDragging(true)}
          onTouchEnd={() => setDragging(false)}
        />
        <input
          type="range"
          min="0"
          max={RANGE_MAX}
          value={max}
          className={skipped ? "disabled" : ""}
          onChange={handleMaxChange}
          onMouseDown={() => setDragging(true)}
          onMouseUp={() => setDragging(false)}
          onTouchStart={() => setDragging(true)}
          onTouchEnd={() => setDragging(false)}
        />
      </div>

      <div className="ob-salary-ticks">
        <span>{"\u20B1"}0</span>
        <span>{"\u20B1"}50K</span>
        <span>{"\u20B1"}100K</span>
        <span>{"\u20B1"}150K</span>
        <span>{"\u20B1"}200K+</span>
      </div>
    </div>
  );
}
