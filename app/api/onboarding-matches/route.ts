import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase-server";
import { computeMatchScore, isProfileSufficient } from "@/lib/matching";
import type { Profile } from "@/lib/types";

// Lightweight scoring columns
const SCORING_COLUMNS = [
  "id", "title", "company_name", "skills_required",
  "salary_min", "salary_max",
  "location_city", "work_setup", "job_type", "experience_level",
  "posted_at",
].join(",");

export async function POST(request: Request) {
  try {
    const profileData = (await request.json()) as Partial<Profile>;

    // Build a minimal profile for scoring
    const profile = {
      ...profileData,
      id: "",
      user_role: "job_seeker" as const,
      onboarding_completed: false,
      onboarding_step: 0,
      profile_completion: 0,
      current_streak: 0,
      longest_streak: 0,
      last_activity_date: null,
      created_at: "",
      updated_at: "",
      full_name: profileData.full_name || "",
      skills: profileData.skills || [],
      skill_proficiencies: profileData.skill_proficiencies || {},
      experience_level: profileData.experience_level || "fresh_graduate",
      work_preference: profileData.work_preference || "any",
      employment_type: profileData.employment_type || "any",
      preferred_industries: profileData.preferred_industries || [],
      willing_to_relocate: profileData.willing_to_relocate ?? false,
      years_of_experience: 0,
      headline: null,
      avatar_url: null,
      preferred_city: profileData.preferred_city || null,
      education: profileData.education || null,
      school: profileData.school || null,
      field_of_study: profileData.field_of_study || null,
      desired_salary_min: profileData.desired_salary_min ?? null,
      desired_salary_max: profileData.desired_salary_max ?? null,
    } satisfies Profile;

    if (!isProfileSufficient(profile)) {
      return NextResponse.json({ matches: [] });
    }

    const supabase = createServiceClient();

    const { data: scoringData } = await supabase
      .from("jobs")
      .select(SCORING_COLUMNS)
      .eq("is_active", true)
      .order("posted_at", { ascending: false });

    if (!scoringData || scoringData.length === 0) {
      return NextResponse.json({ matches: [] });
    }

    // Score all jobs
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const scored = scoringData.map((row: any) => ({
      role: row.title as string,
      company: row.company_name as string,
      salary_min: row.salary_min as number | null,
      salary_max: row.salary_max as number | null,
      result: computeMatchScore(row, profile),
    }));

    scored.sort((a, b) => b.result.score - a.result.score);

    // Return top 5
    const top5 = scored.slice(0, 5).map((s) => ({
      role: s.role,
      company: s.company || "Company",
      match: s.result.score,
      salary: formatSalary(s.salary_min, s.salary_max),
    }));

    return NextResponse.json({ matches: top5 });
  } catch {
    return NextResponse.json({ matches: [] });
  }
}

function formatSalary(min: number | null, max: number | null): string {
  if (!min && !max) return "Salary TBD";
  const fmt = (n: number) => (n >= 1000 ? `₱${Math.round(n / 1000)}K` : `₱${n}`);
  if (min && max) return `${fmt(min)}–${fmt(max)}`;
  if (min) return `From ${fmt(min)}`;
  return `Up to ${fmt(max!)}`;
}
