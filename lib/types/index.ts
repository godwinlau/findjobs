// HanapBuhay Types

// ─── Profile & Auth types ───

export type UserRole = "job_seeker";
export type WorkPreference = "onsite" | "hybrid" | "remote" | "any";
export type EmploymentType = "full_time" | "part_time" | "contract" | "freelance" | "internship" | "any";
export type ProfileExperienceLevel =
  | "fresh_graduate" | "junior" | "mid" | "senior"  // legacy values
  | "less_than_1yr" | "1_to_3yr" | "3_to_5yr" | "5_to_10yr" | "10_plus";
export type ProfileEducationLevel = "high_school" | "vocational" | "bachelors" | "masters" | "doctorate";
export type ActivityType = "job_view" | "job_apply" | "job_save" | "profile_update" | "skill_assessment";
export type SkillProficiency = "beginner" | "intermediate" | "advanced";

export interface PublicSections {
  headline: boolean;
  skills: boolean;
  experience_level: boolean;
  education: boolean;
  preferred_industries: boolean;
  employment_type: boolean;
  salary: boolean;
  city: boolean;
  work_preference: boolean;
}

export interface Profile {
  id: string;
  user_role: UserRole;
  full_name: string;
  headline: string | null;
  avatar_url: string | null;
  preferred_city: string | null;
  work_preference: WorkPreference;
  employment_type: EmploymentType;
  skills: string[];
  skills_learning?: string[];
  skill_proficiencies: Record<string, SkillProficiency>;
  experience_level: ProfileExperienceLevel;
  years_of_experience: number;
  education: ProfileEducationLevel | null;
  school: string | null;
  field_of_study: string | null;
  desired_salary_min: number | null;
  desired_salary_max: number | null;
  preferred_industries: string[];
  willing_to_relocate: boolean;
  onboarding_completed: boolean;
  onboarding_step: number;
  profile_completion: number;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  username: string | null;
  is_profile_public: boolean;
  public_sections: PublicSections;
  created_at: string;
  updated_at: string;
}

export type PublicProfile = Pick<
  Profile,
  | "full_name"
  | "headline"
  | "avatar_url"
  | "preferred_city"
  | "work_preference"
  | "employment_type"
  | "skills"
  | "skill_proficiencies"
  | "experience_level"
  | "education"
  | "school"
  | "field_of_study"
  | "desired_salary_min"
  | "desired_salary_max"
  | "preferred_industries"
  | "username"
  | "public_sections"
>;

// ─── Job types ───

export interface Job {
  id: string;
  company: string;
  verified: boolean;
  logo: string;
  logoUrl: string | null;
  logoBg: string;
  logoColor: string;
  role: string;
  salary: string;
  location: string;
  type: string;
  match: number;
  matchRange?: [number, number];
  posted: string;
  applicants: number;
  closing: string | null;
  responseTime: string | null;
  highlight: string | null;
  matchedSkills?: string[];
  skillsRequired?: string[];
  isTop: boolean;
  desc: string;
  applyUrl: string;
  source: string;
  education: string | null;
}

export interface UserProfile {
  name: string;
  initials: string;
  completionPercentage: number;
  streak: number;
}

export interface WeekActivity {
  day: string;
  date: string;
  actions: number;
  isToday: boolean;
  isFuture: boolean;
}

export interface WeeklyProgressData {
  currentStreak: number;
  longestStreak: number;
  days: WeekActivity[];
  totalActions: number;
}

export interface PaginatedJobs {
  jobs: Job[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  isMatchFiltered: boolean;
}

export interface CursorPaginatedJobs {
  jobs: Job[];
  nextCursor: string | null;
  hasMore: boolean;
}
