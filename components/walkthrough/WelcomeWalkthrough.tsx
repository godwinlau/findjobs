"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { WelcomeModal } from "./WelcomeModal";
import { SpotlightOverlay } from "./SpotlightOverlay";
import { jobSeekerSteps, employerSteps } from "./tour-config";

type Phase = "idle" | "welcome" | "tour" | "done";

const STORAGE_KEY = "hb_walkthrough_seen";
const INITIAL_DELAY = 600;

interface WelcomeWalkthroughProps {
  firstName: string;
  isEmployer: boolean;
}

export function WelcomeWalkthrough({
  firstName,
  isEmployer,
}: WelcomeWalkthroughProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("idle");

  useEffect(() => {
    const hasWelcomeParam = searchParams.get("welcome") === "1";
    const alreadySeen = localStorage.getItem(STORAGE_KEY) === "true";

    if (hasWelcomeParam && !alreadySeen) {
      const timer = setTimeout(() => {
        setPhase("welcome");
        document.body.classList.add("walkthrough-active");
      }, INITIAL_DELAY);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const cleanUp = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "true");
    document.body.classList.remove("walkthrough-active");

    // Remove ?welcome=1 from URL without triggering navigation
    const url = new URL(window.location.href);
    url.searchParams.delete("welcome");
    router.replace(url.pathname + url.search, { scroll: false });
  }, [router]);

  const handleStartTour = useCallback(() => {
    setPhase("tour");
  }, []);

  const handleDismiss = useCallback(() => {
    setPhase("done");
    cleanUp();
  }, [cleanUp]);

  const handleTourComplete = useCallback(() => {
    setPhase("done");
    cleanUp();
  }, [cleanUp]);

  if (phase === "idle" || phase === "done") return null;

  const steps = isEmployer ? employerSteps : jobSeekerSteps;

  return (
    <>
      {phase === "welcome" && (
        <WelcomeModal
          firstName={firstName}
          onStartTour={handleStartTour}
          onDismiss={handleDismiss}
        />
      )}
      {phase === "tour" && (
        <SpotlightOverlay steps={steps} onComplete={handleTourComplete} />
      )}
    </>
  );
}
