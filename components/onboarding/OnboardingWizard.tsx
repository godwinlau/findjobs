"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { TopBar } from "./TopBar";
import { ProgressBarNew } from "./ProgressBarNew";
import { BottomBar } from "./BottomBar";
import { StepWelcome } from "./StepWelcome";
import { StepSkillsNew } from "./StepSkillsNew";
import { StepPreferences } from "./StepPreferences";
import { StepMatches } from "./StepMatches";
import { rolesToIndustries } from "@/lib/constants/onboardingRoles";
import { saveOnboardingStep, completeOnboarding } from "@/app/onboarding/actions";
import type { Profile, WorkPreference, EmploymentType } from "@/lib/types";

const TOTAL_STEPS = 4;

interface OnboardingWizardProps {
  initialProfile: Partial<Profile>;
}

export function OnboardingWizard({ initialProfile }: OnboardingWizardProps) {
  const router = useRouter();

  // Clamp initial step to 0-3
  const initialStep = Math.min(initialProfile.onboarding_step || 0, TOTAL_STEPS - 1);
  const [step, setStep] = useState(initialStep);

  // Step 0: Welcome
  const [firstName, setFirstName] = useState(
    initialProfile.full_name?.split(" ")[0] || ""
  );
  const [employmentType, setEmploymentType] = useState(
    initialProfile.employment_type || ""
  );

  // Step 1: Skills
  const [skills, setSkills] = useState<string[]>(initialProfile.skills || []);

  // Step 2: Preferences
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [workSetup, setWorkSetup] = useState(
    initialProfile.work_preference || ""
  );
  const [salaryMin, setSalaryMin] = useState(
    initialProfile.desired_salary_min
      ? Math.round(initialProfile.desired_salary_min / 1000)
      : 30
  );
  const [salaryMax, setSalaryMax] = useState(
    initialProfile.desired_salary_max
      ? Math.round(initialProfile.desired_salary_max / 1000)
      : 80
  );
  const [salarySkipped, setSalarySkipped] = useState(false);

  // UI state
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Build profile data for API calls
  const profileData = useMemo(
    () => ({
      ...initialProfile,
      full_name: firstName.trim(),
      employment_type: (employmentType || "full_time") as EmploymentType,
      skills,
      preferred_industries: rolesToIndustries(selectedRoles),
      work_preference: (workSetup || "any") as WorkPreference,
      desired_salary_min: salarySkipped ? null : salaryMin * 1000,
      desired_salary_max: salarySkipped ? null : salaryMax * 1000,
      user_role: "job_seeker" as const,
    }),
    [initialProfile, firstName, employmentType, skills, selectedRoles, workSetup, salaryMin, salaryMax, salarySkipped]
  );

  // ─── Validation ───

  function validate(): string | null {
    if (step === 0) {
      if (!firstName.trim()) return "Enter your first name to continue.";
      if (!employmentType) return "Pick what you're looking for.";
    }
    if (step === 1) {
      if (skills.length < 3) return "Select at least 3 skills.";
    }
    if (step === 2) {
      if (selectedRoles.length === 0) return "Select at least one role.";
      if (!workSetup) return "Pick a work setup.";
    }
    return null;
  }

  // ─── Navigation ───

  async function handleNext() {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setError("");
    setSaving(true);

    try {
      const result = await saveOnboardingStep(step, profileData);
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

  async function handleComplete() {
    setSaving(true);
    setError("");

    try {
      const result = await completeOnboarding(profileData);
      if (result?.error) {
        setError(result.error);
        setSaving(false);
        return;
      }
      router.push("/?welcome=1");
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

  // ─── Bottom bar config per step ───

  function getBottomBarProps() {
    if (step === 0) {
      const hasName = !!firstName.trim();
      const hasType = !!employmentType;
      const ready = hasName && hasType;
      let hint = "Fill in both to continue";
      if (hasName && !hasType) hint = "Pick one below";
      else if (!hasName && hasType) hint = "Enter your name";
      else if (ready) hint = "Ready!";

      return {
        variant: "dots" as const,
        dots: [hasName, hasType],
        hint,
        hintReady: ready,
        nextDisabled: !ready,
        nextLabel: "Continue \u2192",
      };
    }

    if (step === 1) {
      return {
        variant: "dots" as const,
        onBack: handleBack,
        dots: [skills.length >= 1, skills.length >= 2, skills.length >= 3],
        count: skills.length,
        nextDisabled: skills.length < 3,
        nextLabel: "Continue",
      };
    }

    if (step === 2) {
      return {
        variant: "checks" as const,
        onBack: handleBack,
        checks: [selectedRoles.length > 0, !!workSetup],
        nextDisabled: selectedRoles.length === 0 || !workSetup,
        nextLabel: "See My Matches \u2192",
      };
    }

    return null; // Step 3 has its own bar
  }

  // ─── Progress label ───

  function getProgressLabel() {
    if (step === 3) {
      return "Finding your matches\u2026";
    }
    return undefined;
  }

  // ─── Show skip on steps 1 & 2 ───

  const showSkip = step === 1 || step === 2;

  // ─── Render ───

  return (
    <div className="ob-page">
      <TopBar onSkip={showSkip ? handleNext : undefined} />
      <ProgressBarNew currentStep={step} label={getProgressLabel()} />

      {error && <div className="ob-error" style={{ maxWidth: 520, margin: "16px auto 0", padding: "10px 24px" }}>{error}</div>}

      {step === 0 && (
        <StepWelcome
          firstName={firstName}
          employmentType={employmentType}
          onFirstNameChange={setFirstName}
          onEmploymentTypeChange={setEmploymentType}
        />
      )}
      {step === 1 && (
        <StepSkillsNew
          skills={skills}
          onSkillsChange={setSkills}
        />
      )}
      {step === 2 && (
        <StepPreferences
          selectedRoles={selectedRoles}
          onRolesChange={setSelectedRoles}
          workSetup={workSetup}
          onWorkSetupChange={setWorkSetup}
          salaryMin={salaryMin}
          salaryMax={salaryMax}
          onSalaryMinChange={setSalaryMin}
          onSalaryMaxChange={setSalaryMax}
          salarySkipped={salarySkipped}
          onSalarySkipToggle={() => setSalarySkipped(!salarySkipped)}
        />
      )}
      {step === 3 && (
        <StepMatches
          firstName={firstName}
          profileData={profileData}
          onComplete={handleComplete}
          saving={saving}
        />
      )}

      {/* Bottom bar for steps 0-2 */}
      {step < 3 && (() => {
        const props = getBottomBarProps();
        if (!props) return null;
        return (
          <BottomBar
            {...props}
            onNext={handleNext}
            saving={saving}
          />
        );
      })()}
    </div>
  );
}
