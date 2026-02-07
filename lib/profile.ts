import type { Profile } from "@/lib/types";

export function calculateCompletion(data: Partial<Profile>): number {
  let filled = 0;
  let total = 0;

  const checks: [unknown, number][] = [
    [data.full_name, 15],
    [data.headline, 5],
    [data.preferred_city, 5],
    [data.work_preference && data.work_preference !== "any", 10],
    [(data.skills || []).length >= 3, 20],
    [(data.skills || []).length > 0 && (data.skills || []).length < 3, 10],
    [data.skill_proficiencies && Object.keys(data.skill_proficiencies).length > 0, 5],
    [data.experience_level, 5],
    [data.education, 5],
    [data.field_of_study, 5],
    [data.desired_salary_min || data.desired_salary_max, 5],
    [data.employment_type && data.employment_type !== "full_time", 5],
    [(data.preferred_industries || []).length > 0, 10],
  ];

  for (const [value, weight] of checks) {
    total += weight;
    if (value) filled += weight;
  }

  return Math.round((filled / total) * 100);
}

// ─── Profile gap analysis (action-oriented) ───

export interface ProfileGap {
  field: string;
  label: string;
  description: string;
  actionText: string;
  estimatedImpact: string;
  impact: "high" | "medium" | "low";
  link: string;
}

export function analyzeProfileGaps(profile: Profile | null): ProfileGap[] {
  if (!profile) {
    return [
      {
        field: "skills",
        label: "Add your skills",
        description: "Skills are the #1 factor in job matching",
        actionText: "Add 5 skills to unlock ~20 more matches",
        estimatedImpact: "+20 matches",
        impact: "high",
        link: "/profile#skills",
      },
    ];
  }

  const gaps: ProfileGap[] = [];
  const currentSkillCount = profile.skills?.length || 0;

  // Skills — 45% in scoring + relevance gate (highest impact)
  if (currentSkillCount === 0) {
    gaps.push({
      field: "skills",
      label: "Add your skills",
      description: "Skills are the #1 factor in job matching",
      actionText: "Add 5 skills to unlock ~25 more job matches",
      estimatedImpact: "+25 matches",
      impact: "high",
      link: "/profile#skills",
    });
  } else if (currentSkillCount < 5) {
    const needed = 5 - currentSkillCount;
    const estimatedMatches = needed * 4;
    gaps.push({
      field: "skills",
      label: `Add ${needed} more skill${needed > 1 ? "s" : ""}`,
      description: `You have ${currentSkillCount} skill${currentSkillCount > 1 ? "s" : ""} — aim for 5+`,
      actionText: `Add ${needed} more to unlock ~${estimatedMatches} more matches`,
      estimatedImpact: `+${estimatedMatches} matches`,
      impact: "high",
      link: "/profile#skills",
    });
  }

  // Skill proficiency — 15%
  const proficiencyCount = profile.skill_proficiencies ? Object.keys(profile.skill_proficiencies).length : 0;
  if (currentSkillCount > 0 && proficiencyCount < currentSkillCount) {
    const unrated = currentSkillCount - proficiencyCount;
    gaps.push({
      field: "skill_proficiencies",
      label: `Rate ${unrated} skill${unrated > 1 ? "s" : ""}`,
      description: "Proficiency levels help match seniority",
      actionText: "Rate your skills to improve match accuracy by ~15%",
      estimatedImpact: "+15% accuracy",
      impact: "high",
      link: "/profile#skills",
    });
  }

  // Experience — 15%
  if (!profile.experience_level) {
    gaps.push({
      field: "experience_level",
      label: "Set experience level",
      description: "Matches you to appropriate seniority jobs",
      actionText: "Set your level to filter out mismatched roles",
      estimatedImpact: "+10 matches",
      impact: "high",
      link: "/profile#experience",
    });
  }

  // Salary — 10%
  if (profile.desired_salary_min === null && profile.desired_salary_max === null) {
    gaps.push({
      field: "salary",
      label: "Set salary range",
      description: "See only jobs that meet your expectations",
      actionText: "Set your range to filter out low-paying jobs",
      estimatedImpact: "Better matches",
      impact: "medium",
      link: "/profile#salary",
    });
  }

  // Location — 10%
  if (!profile.preferred_city) {
    gaps.push({
      field: "location",
      label: "Set your location",
      description: "Find jobs near you or fully remote",
      actionText: "Add location to see local opportunities",
      estimatedImpact: "+8 local jobs",
      impact: "medium",
      link: "/profile#location",
    });
  }

  // Headline — indirect impact
  if (!profile.headline) {
    gaps.push({
      field: "headline",
      label: "Add a headline",
      description: "We use it to infer additional skills",
      actionText: "Add a headline like 'React Developer'",
      estimatedImpact: "+5 matches",
      impact: "medium",
      link: "/profile#headline",
    });
  }

  // Work categories
  if (!profile.preferred_industries || profile.preferred_industries.length === 0) {
    gaps.push({
      field: "industries",
      label: "Select industries",
      description: "See jobs in fields you care about",
      actionText: "Pick industries to focus your job feed",
      estimatedImpact: "Focused feed",
      impact: "medium",
      link: "/profile#industries",
    });
  }

  // Education — 5%
  if (!profile.education) {
    gaps.push({
      field: "education",
      label: "Add education",
      description: "Some roles require specific qualifications",
      actionText: "Add education to match qualified roles",
      estimatedImpact: "+3 matches",
      impact: "low",
      link: "/profile#education",
    });
  }

  return gaps;
}

// ─── Get top priority action ───

export function getTopProfileAction(profile: Profile | null): ProfileGap | null {
  const gaps = analyzeProfileGaps(profile);
  return gaps.length > 0 ? gaps[0] : null;
}
