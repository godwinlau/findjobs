"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { colors } from "@/lib/constants/colors";
import { ProgressBar } from "./ProgressBar";
import { StepWorkType } from "./StepWorkType";
import { StepLocation } from "./StepLocation";
import { StepSkills } from "./StepSkills";
import { StepExperience } from "./StepExperience";
import { StepSalary } from "./StepSalary";
import { StepIdentity } from "./StepIdentity";
import { StepTopMatches } from "./StepTopMatches";
import { SALARY_PRESETS } from "@/lib/constants/onboarding";
import { saveOnboardingStep, completeOnboarding } from "@/app/onboarding/actions";
import type { Profile } from "@/lib/types";

const STEP_LABELS = [
  "Work Type",
  "Location",
  "Skills",
  "Experience",
  "Salary",
  "The Basics",
  "Your Matches",
];

const TOTAL_STEPS = 7;

interface OnboardingWizardProps {
  initialProfile: Partial<Profile>;
}

export function OnboardingWizard({ initialProfile }: OnboardingWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(initialProfile.onboarding_step || 0);
  const [data, setData] = useState<Partial<Profile>>({
    ...initialProfile,
    user_role: "job_seeker",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [topMatches, setTopMatches] = useState<
    { role: string; company: string; match: number; salary: string }[]
  >([]);
  const [matchesLoading, setMatchesLoading] = useState(false);

  // Auto-fill salary when experience level changes
  function updateData(updates: Partial<Profile>) {
    const newData = { ...data, ...updates };

    if (updates.experience_level && updates.experience_level !== data.experience_level) {
      const preset = SALARY_PRESETS[updates.experience_level];
      if (preset && !data.desired_salary_min && !data.desired_salary_max) {
        newData.desired_salary_min = preset.min;
        newData.desired_salary_max = preset.max;
      }
    }

    setData(newData);
  }

  // Fetch top matches when reaching the final step
  useEffect(() => {
    if (step === 6) {
      setMatchesLoading(true);
      // Use the API route to get matches based on current profile data
      fetch("/api/onboarding-matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
        .then((res) => res.json())
        .then((result) => {
          setTopMatches(result.matches || []);
        })
        .catch(() => {
          setTopMatches([]);
        })
        .finally(() => {
          setMatchesLoading(false);
        });
    }
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleNext() {
    // Step 0 (Work Type): at least 1 category
    if (step === 0) {
      if (!data.preferred_industries || data.preferred_industries.length === 0) {
        setError("Please select at least one work category.");
        return;
      }
    }

    // Step 1 (Location): city required unless remote
    if (step === 1) {
      if (data.work_preference !== "remote" && !data.preferred_city) {
        setError("Please select your preferred city.");
        return;
      }
    }

    // Step 2 (Skills): min 5 skills with proficiency
    if (step === 2) {
      if (!data.skills || data.skills.length < 5) {
        setError("Please select at least 5 skills.");
        return;
      }
    }

    // Step 3 (Experience): level required
    if (step === 3) {
      if (!data.experience_level) {
        setError("Please select your experience level.");
        return;
      }
    }

    // Step 4 (Salary): skippable — no validation

    // Step 5 (Identity): education + name required
    if (step === 5) {
      if (!data.full_name?.trim()) {
        setError("Full name is required.");
        return;
      }
      if (!data.education) {
        setError("Please select your education level.");
        return;
      }
    }

    setError("");
    setSaving(true);

    try {
      if (step < TOTAL_STEPS - 1) {
        const result = await saveOnboardingStep(step, data);
        if (result?.error) {
          setError(result.error);
          setSaving(false);
          return;
        }
        setStep(step + 1);
      } else {
        // Step 6 (final): complete onboarding
        const result = await completeOnboarding(data);
        if (result?.error) {
          setError(result.error);
          setSaving(false);
          return;
        }
        router.push("/?welcome=1");
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
      const result = await saveOnboardingStep(step, data);
      if (result?.error) {
        setError(result.error);
        setSaving(false);
        return;
      }
      setStep(step + 1);
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

  function renderStep() {
    if (step === 0) return <StepWorkType data={data} onChange={updateData} />;
    if (step === 1) return <StepLocation data={data} onChange={updateData} />;
    if (step === 2) return <StepSkills data={data} onChange={updateData} />;
    if (step === 3) return <StepExperience data={data} onChange={updateData} />;
    if (step === 4) return <StepSalary data={data} onChange={updateData} />;
    if (step === 5) return <StepIdentity data={data} onChange={updateData} />;
    if (step === 6) return <StepTopMatches matches={topMatches} loading={matchesLoading} />;
    return null;
  }

  // Skip button only on step 4 (salary)
  const showSkip = step === 4;
  const showBack = step > 0;

  // Button labels
  let nextLabel = "Continue";
  if (saving) nextLabel = "Saving...";
  else if (step === 5) nextLabel = "See Your Matches";
  else if (step === 6) nextLabel = "Start Job Hunting";

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
        <ProgressBar currentStep={step} totalSteps={TOTAL_STEPS} labels={STEP_LABELS} />

        {error && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              background: "var(--hb-warning-bg)",
              border: "1px solid var(--hb-warning-border)",
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
              {nextLabel}
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
