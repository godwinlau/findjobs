"use client";

import { useRef, useEffect } from "react";
import { EMPLOYMENT_TYPE_CARDS } from "@/lib/constants/onboardingRoles";

interface StepWelcomeProps {
  firstName: string;
  employmentType: string;
  onFirstNameChange: (name: string) => void;
  onEmploymentTypeChange: (type: string) => void;
}

export function StepWelcome({
  firstName,
  employmentType,
  onFirstNameChange,
  onEmploymentTypeChange,
}: StepWelcomeProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const trimmed = firstName.trim();

  return (
    <div className="ob-main">
      <div className="ob-content">
        <div className="ob-welcome-tag">Welcome to bigmovv</div>
        <div className="ob-title">
          Let&apos;s set up <span>your feed</span>
        </div>
        <p className="ob-desc">
          Two quick questions so we can show you relevant jobs right away.
        </p>

        {/* Name */}
        <div className="ob-field">
          <div className="ob-field-label">
            <span className="ob-field-label-num">1</span> Your first name
          </div>
          <input
            ref={inputRef}
            className="ob-name-input"
            type="text"
            placeholder="e.g. Godwin"
            maxLength={30}
            value={firstName}
            onChange={(e) => onFirstNameChange(e.target.value)}
          />
          <div className={`ob-greeting${trimmed ? " visible" : ""}`}>
            {trimmed ? (
              <>
                Hey <span>{trimmed}</span> — let&apos;s find you some great jobs
              </>
            ) : null}
          </div>
        </div>

        {/* Employment type */}
        <div className="ob-field">
          <div className="ob-field-label">
            <span className="ob-field-label-num">2</span> I&apos;m looking for
          </div>
          <div className="ob-type-grid">
            {EMPLOYMENT_TYPE_CARDS.map((card) => (
              <div
                key={card.value}
                className={`ob-type-card${employmentType === card.value ? " selected" : ""}`}
                onClick={() => onEmploymentTypeChange(card.value)}
              >
                <div className="ob-type-check">{"\u2713"}</div>
                <div className="ob-type-emoji">{card.emoji}</div>
                <div className="ob-type-name">{card.label}</div>
                <div className="ob-type-sub">{card.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
