"use client";

import { ONBOARDING_ROLES, WORK_SETUP_OPTIONS } from "@/lib/constants/onboardingRoles";
import { SalarySlider } from "./SalarySlider";

interface StepPreferencesProps {
  selectedRoles: string[];
  onRolesChange: (roles: string[]) => void;
  workSetup: string;
  onWorkSetupChange: (setup: string) => void;
  salaryMin: number;
  salaryMax: number;
  onSalaryMinChange: (val: number) => void;
  onSalaryMaxChange: (val: number) => void;
  salarySkipped: boolean;
  onSalarySkipToggle: () => void;
}

export function StepPreferences({
  selectedRoles,
  onRolesChange,
  workSetup,
  onWorkSetupChange,
  salaryMin,
  salaryMax,
  onSalaryMinChange,
  onSalaryMaxChange,
  salarySkipped,
  onSalarySkipToggle,
}: StepPreferencesProps) {
  function toggleRole(label: string) {
    if (selectedRoles.includes(label)) {
      onRolesChange(selectedRoles.filter((r) => r !== label));
    } else {
      onRolesChange([...selectedRoles, label]);
    }
  }

  return (
    <div className="ob-main">
      <div className="ob-content">
        <div className="ob-title">
          What are you <span>looking for</span>?
        </div>
        <p className="ob-desc">
          Quick preferences so we show you the right jobs. You can always change
          these later.
        </p>

        {/* 1. Roles */}
        <div className="ob-field">
          <div className="ob-field-label">
            <span className="ob-field-label-num">1</span> Roles you want
          </div>
          <div className="ob-field-hint">Select all that apply</div>
          <div className="ob-pills">
            {ONBOARDING_ROLES.map((role) => {
              const selected = selectedRoles.includes(role.label);
              return (
                <div
                  key={role.label}
                  className={`ob-pill${selected ? " selected" : ""}`}
                  onClick={() => toggleRole(role.label)}
                >
                  <span className="ob-pill-check">{"\u2713"}</span>
                  {role.label}
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Work Setup */}
        <div className="ob-field">
          <div className="ob-field-label">
            <span className="ob-field-label-num">2</span> Work setup
          </div>
          <div className="ob-loc-grid">
            {WORK_SETUP_OPTIONS.map((opt) => (
              <div
                key={opt.value}
                className={`ob-loc-card${workSetup === opt.value ? " selected" : ""}`}
                onClick={() => onWorkSetupChange(opt.value)}
              >
                <div className="ob-loc-radio" />
                <div className="ob-loc-emoji">{opt.emoji}</div>
                <div className="ob-loc-text">
                  <div className="ob-loc-name">{opt.label}</div>
                  <div className="ob-loc-sub">{opt.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Salary */}
        <div className="ob-field">
          <div className="ob-field-label">
            <span className="ob-field-label-num">3</span> Salary range
            <span className="ob-field-opt">Optional</span>
          </div>
          <SalarySlider
            min={salaryMin}
            max={salaryMax}
            onMinChange={onSalaryMinChange}
            onMaxChange={onSalaryMaxChange}
            skipped={salarySkipped}
            onSkipToggle={onSalarySkipToggle}
          />
        </div>
      </div>
    </div>
  );
}
