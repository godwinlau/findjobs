export interface TourStep {
  target: string; // data-tour attribute value
  title: string;
  description: string;
  position: "top" | "bottom" | "left" | "right";
  highlight?: string; // What makes this different
}

export const tourSteps: TourStep[] = [
  {
    target: "weekly-progress",
    title: "Your Dashboard Stats",
    description:
      "Track your applications, job views, skills progress, and streak all in one place. Stay consistent and watch your progress grow!",
    position: "bottom",
    highlight: "All your metrics at a glance",
  },
  {
    target: "top-matches",
    title: "Jobs Matched to YOUR Skills",
    description:
      "Every job shows exactly WHY it matches you — skills overlap, salary fit, and location preference. No more guessing.",
    position: "top",
    highlight: "See why each job matches you",
  },
  {
    target: "profile-completion",
    title: "Complete Your Profile",
    description:
      "Unlike other job sites, we match based on your actual skills — not just keywords. Complete your profile for better matches.",
    position: "bottom",
    highlight: "Skills-first matching, not keyword spam",
  },
];

// Tour step for Learn page (used when navigating there)
export const learnTourStep: TourStep = {
  target: "learn-section",
  title: "Grow Your Skills",
  description:
    "Take assessments to discover skill gaps, then get personalized course recommendations to level up and unlock more jobs.",
  position: "top",
  highlight: "Skill gaps → Learning paths → Better jobs",
};
