"use client";

interface TopBarProps {
  onSkip?: () => void;
}

export function TopBar({ onSkip }: TopBarProps) {
  return (
    <div className="ob-topbar">
      <div className="ob-topbar-left">
        <div className="ob-topbar-logo">HB</div>
        <span className="ob-topbar-wordmark">HanapBuhay</span>
      </div>
      {onSkip && (
        <button className="ob-topbar-skip" onClick={onSkip}>
          Skip
        </button>
      )}
    </div>
  );
}
