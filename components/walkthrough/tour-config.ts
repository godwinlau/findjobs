export interface TourStep {
  target: string; // data-tour attribute value
  title: string;
  description: string;
  position: "top" | "bottom" | "left" | "right";
}

export const jobSeekerSteps: TourStep[] = [
  {
    target: "weekly-progress",
    title: "Weekly Progress",
    description:
      "Track your job search activity at a glance — applications sent, interviews scheduled, and more.",
    position: "bottom",
  },
  {
    target: "profile-completion",
    title: "Profile Completion",
    description:
      "Complete your profile to unlock better job matches. The more you fill in, the smarter our recommendations get.",
    position: "bottom",
  },
  {
    target: "applications-tracker",
    title: "Applications Tracker",
    description:
      "See the status of every application in one place — pending, reviewed, interview, or hired.",
    position: "bottom",
  },
  {
    target: "top-matches",
    title: "Top Matches",
    description:
      "These are jobs handpicked for you based on your skills, experience, and preferences.",
    position: "top",
  },
];

export const employerSteps: TourStep[] = [
  {
    target: "post-job-button",
    title: "Post a Job",
    description:
      "Ready to hire? Click here to create a new job posting and start receiving applications.",
    position: "bottom",
  },
  {
    target: "stats-row",
    title: "Your Stats",
    description:
      "Monitor your hiring performance — total postings, views, applications, and more at a glance.",
    position: "bottom",
  },
  {
    target: "posted-jobs-list",
    title: "Job Postings",
    description:
      "Manage all your active and past job postings here. Edit, close, or review applicants anytime.",
    position: "top",
  },
];
