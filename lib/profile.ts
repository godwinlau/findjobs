import type { Profile } from "@/lib/types";

export function calculateCompletion(data: Partial<Profile>): number {
  let filled = 0;
  let total = 0;

  const checks: [unknown, number][] = [
    [data.full_name, 15],
    [data.headline, 10],
    [data.preferred_city, 10],
    [data.work_preference && data.work_preference !== "any", 5],
    [(data.skills || []).length > 0, 15],
    [data.experience_level, 10],
    [data.education, 10],
    [data.field_of_study, 5],
    [data.desired_salary_min || data.desired_salary_max, 10],
    [data.employment_type && data.employment_type !== "full_time", 5],
    [(data.preferred_industries || []).length > 0, 5],
  ];

  for (const [value, weight] of checks) {
    total += weight;
    if (value) filled += weight;
  }

  return Math.round((filled / total) * 100);
}

// ─── Profile gap analysis ───
// Maps missing profile fields to their match-scoring impact.
// Ordered by how many scoring points the field controls.

export interface ProfileGap {
  field: string;
  label: string;
  description: string;
  impact: "high" | "medium" | "low";
}

export function analyzeProfileGaps(profile: Profile | null): ProfileGap[] {
  if (!profile) {
    return [
      { field: "skills", label: "Add your skills", description: "Skills drive 30% of match scoring and determine which jobs surface for you", impact: "high" },
      { field: "salary", label: "Set your salary range", description: "Filters out jobs outside your expectations — 20% of the scoring algorithm", impact: "high" },
      { field: "location", label: "Set your preferred city", description: "Matches you with local opportunities — 15% of scoring", impact: "high" },
    ];
  }

  const gaps: ProfileGap[] = [];

  // Skills — 30pts in scoring + relevance gate (highest impact by far)
  if (!profile.skills || profile.skills.length === 0) {
    gaps.push({
      field: "skills",
      label: "Add your skills",
      description: "Skills drive 30% of match scoring and determine which jobs surface for you",
      impact: "high",
    });
  } else if (profile.skills.length < 3) {
    gaps.push({
      field: "skills",
      label: `Add more skills (${profile.skills.length} added)`,
      description: "More skills improve match accuracy — aim for at least 5",
      impact: "high",
    });
  }

  // Salary — 20pts
  if (profile.desired_salary_min === null && profile.desired_salary_max === null) {
    gaps.push({
      field: "salary",
      label: "Set your salary range",
      description: "Filters out jobs outside your expectations — 20% of the scoring algorithm",
      impact: "high",
    });
  }

  // Location — 15pts
  if (!profile.preferred_city) {
    gaps.push({
      field: "location",
      label: "Set your preferred city",
      description: "Matches you with local opportunities — 15% of scoring",
      impact: "high",
    });
  }

  // Headline — indirect impact via skill inference from role title
  if (!profile.headline) {
    gaps.push({
      field: "headline",
      label: "Add a professional headline",
      description: "Your headline is used to infer additional skills for better matching",
      impact: "medium",
    });
  }

  // Work preference — 10pts
  if (!profile.work_preference || profile.work_preference === "any") {
    gaps.push({
      field: "work_preference",
      label: "Set work setup preference",
      description: "Prioritizes onsite, hybrid, or remote roles you actually want",
      impact: "medium",
    });
  }

  // Education — 5pts
  if (!profile.education) {
    gaps.push({
      field: "education",
      label: "Add your education level",
      description: "Some employers filter by education — helps match accuracy",
      impact: "low",
    });
  }

  // Field of study — completion weight only
  if (!profile.field_of_study) {
    gaps.push({
      field: "field_of_study",
      label: "Add your field of study",
      description: "Helps match with roles that value specific academic backgrounds",
      impact: "low",
    });
  }

  // Preferred industries — completion weight only
  if (!profile.preferred_industries || profile.preferred_industries.length === 0) {
    gaps.push({
      field: "industries",
      label: "Select preferred industries",
      description: "Helps surface jobs in industries you're interested in",
      impact: "low",
    });
  }

  return gaps;
}
