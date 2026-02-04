"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { colors } from "@/lib/constants/colors";
import { ProgressBar } from "./ProgressBar";
import { StepRoleSelect } from "./StepRoleSelect";
import { StepBasics } from "./StepBasics";
import { StepSkills } from "./StepSkills";
import { StepPreferences } from "./StepPreferences";
import { StepEmployerComingSoon } from "./StepEmployerComingSoon";
import { SALARY_PRESETS } from "@/lib/constants/onboarding";
import { saveOnboardingStep, completeOnboarding } from "@/app/onboarding/actions";
import type { Profile, UserRole } from "@/lib/types";

const JOB_SEEKER_LABELS = ["Your Role", "About You", "Your Skills", "Job Preferences"];
const EMPLOYER_LABELS = ["Your Role", "Almost There"];

interface OnboardingWizardProps {
  initialProfile: Partial<Profile>;
}

export function OnboardingWizard({ initialProfile }: OnboardingWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(initialProfile.onboarding_step || 0);
  const [data, setData] = useState<Partial<Profile>>(initialProfile);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const role: UserRole | null = data.user_role || null;
  const isEmployer = role === "employer";
  const totalSteps = isEmployer ? 2 : 4;
  const labels = isEmployer ? EMPLOYER_LABELS : JOB_SEEKER_LABELS;

  function updateData(updates: Partial<Profile>) {
    const newData = { ...data, ...updates };

    // Auto-fill salary when experience level changes
    if (updates.experience_level && updates.experience_level !== data.experience_level) {
      const preset = SALARY_PRESETS[updates.experience_level];
      if (preset && !data.desired_salary_min && !data.desired_salary_max) {
        newData.desired_salary_min = preset.min;
        newData.desired_salary_max = preset.max;
      }
    }

    setData(newData);
  }

  async function handleNext() {
    // Step 0 validation: role must be selected
    if (step === 0 && !data.user_role) {
      setError("Please select how you'd like to use HanapBuhay.");
      return;
    }

    // Step 1 (job seeker basics) validation: full name required
    if (step === 1 && !isEmployer && !data.full_name?.trim()) {
      setError("Full name is required.");
      return;
    }

    setError("");
    setSaving(true);

    try {
      if (step < totalSteps - 1) {
        const result = await saveOnboardingStep(step, data);
        if (result?.error) {
          setError(result.error);
          setSaving(false);
          return;
        }
        setStep(step + 1);
      } else {
        const result = await completeOnboarding(data);
        if (result?.error) {
          setError(result.error);
          setSaving(false);
          return;
        }
        router.push(isEmployer ? "/employer" : "/");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }

    setSaving(false);
  }

  async function handleSkip() {
    setSaving(true);
    setError("");

    try {
      if (step < totalSteps - 1) {
        const result = await saveOnboardingStep(step, data);
        if (result?.error) {
          setError(result.error);
          setSaving(false);
          return;
        }
        setStep(step + 1);
      } else {
        const result = await completeOnboarding(data);
        if (result?.error) {
          setError(result.error);
          setSaving(false);
          return;
        }
        router.push(isEmployer ? "/employer" : "/");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }

    setSaving(false);
  }

  function handleBack() {
    if (step > 0) {
      setStep(step - 1);
      setError("");
    }
  }

  // Determine which step content to render
  function renderStep() {
    if (step === 0) {
      return (
        <StepRoleSelect
          selected={role}
          onSelect={(r) => updateData({ user_role: r })}
        />
      );
    }

    if (isEmployer) {
      return <StepEmployerComingSoon />;
    }

    // Job seeker steps (shifted by 1)
    if (step === 1) return <StepBasics data={data} onChange={updateData} />;
    if (step === 2) return <StepSkills data={data} onChange={updateData} />;
    if (step === 3) return <StepPreferences data={data} onChange={updateData} />;

    return null;
  }

  // Hide skip on step 0 (role is mandatory) and for employers
  const showSkip = step > 0 && !isEmployer;
  // Hide back on step 0 (no previous step)
  const showBack = step > 0;

  return (
    <div
      className="onboarding-outer"
      style={{
        minHeight: "100vh",
        background: colors.bg,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
      }}
    >
      <div
        className="onboarding-inner"
        style={{
          width: "100%",
          maxWidth: 560,
          background: colors.surface,
          borderRadius: 12,
          border: `1px solid ${colors.border}`,
        }}
      >
        <ProgressBar currentStep={step} totalSteps={totalSteps} labels={labels} />

        {error && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              background: "#FEF2F2",
              border: "1px solid #FECACA",
              color: colors.live,
              fontSize: 13,
              marginBottom: 16,
            }}
          >
            {error}
          </div>
        )}

        {renderStep()}

        <div
          className="responsive-row-reverse onboarding-footer-gap"
          style={{
            justifyContent: "space-between",
            marginTop: 28,
            paddingTop: 20,
            borderTop: `1px solid ${colors.border}`,
          }}
        >
          <div style={{ display: "flex", gap: 12 }}>
            {showBack && (
              <button
                type="button"
                onClick={handleBack}
                disabled={saving}
                className="onboarding-back-btn"
                style={{
                  padding: "10px 20px",
                  borderRadius: 8,
                  border: `1px solid ${colors.border}`,
                  background: colors.surface,
                  color: colors.textSec,
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Back
              </button>
            )}
          </div>

          <div className="responsive-row" style={{ gap: 12 }}>
            <button
              type="button"
              onClick={handleNext}
              disabled={saving}
              style={{
                padding: "10px 24px",
                borderRadius: 8,
                border: "none",
                background: saving ? colors.textMuted : colors.primary,
                color: colors.inv,
                fontSize: 14,
                fontWeight: 600,
                cursor: saving ? "not-allowed" : "pointer",
              }}
            >
              {saving
                ? "Saving..."
                : step === totalSteps - 1
                  ? "Get Started"
                  : "Continue"}
            </button>
            {showSkip && (
              <button
                type="button"
                onClick={handleSkip}
                disabled={saving}
                style={{
                  padding: "10px 16px",
                  border: "none",
                  background: "transparent",
                  color: colors.textMuted,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                Skip for now
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
