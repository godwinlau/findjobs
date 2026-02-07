"use client";

interface TopBarProps {
  onSkip?: () => void;
}

export function TopBar({ onSkip }: TopBarProps) {
  return (
    <div className="ob-topbar">
      <div className="ob-topbar-left">
        <span className="ob-topbar-wordmark">bigmovv<span className="ob-topbar-period">.</span></span>
      </div>
      {onSkip && (
        <button className="ob-topbar-skip" onClick={onSkip}>
          Skip
        </button>
      )}
    </div>
  );
}
