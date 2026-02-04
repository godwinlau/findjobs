// HanapBuhay Types

// ─── Profile & Auth types ───

export type UserRole = "job_seeker" | "employer";
export type WorkPreference = "onsite" | "hybrid" | "remote" | "any";
export type EmploymentType = "full_time" | "part_time" | "contract" | "freelance" | "internship" | "any";
export type ProfileExperienceLevel = "fresh_graduate" | "junior" | "mid" | "senior";
export type ProfileEducationLevel = "high_school" | "vocational" | "bachelors" | "masters" | "doctorate";
export type ActivityType = "job_view" | "job_apply" | "job_save" | "profile_update" | "skill_assessment";

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
  experience_level: ProfileExperienceLevel;
  years_of_experience: number;
  education: ProfileEducationLevel | null;
  school: string | null;
  field_of_study: string | null;
  desired_salary_min: number | null;
  desired_salary_max: number | null;
  preferred_industries: string[];
  onboarding_completed: boolean;
  onboarding_step: number;
  profile_completion: number;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  created_at: string;
  updated_at: string;
}

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
  posted: string;
  applicants: number;
  closing: string | null;
  responseTime: string | null;
  highlight: string | null;
  isTop: boolean;
  desc: string;
  applyUrl: string;
  source: string;
  education: string | null;
}

export interface Activity {
  type: "view" | "match" | "tip" | "status" | "milestone";
  text: string;
  time: string;
  icon: string;
}

export interface Application {
  company: string;
  role: string;
  status: "Applied" | "Viewed" | "Interview" | "Offer" | "Rejected";
  color: string;
  bg: string;
  detail: string;
  urgent: boolean;
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

// ─── Employer types ───

export interface EmployerJobRow {
  id: string;
  title: string;
  company_name: string;
  salary_min: number | null;
  salary_max: number | null;
  location_city: string | null;
  location_area: string | null;
  is_active: boolean;
  view_count: number;
  applicant_count: number;
  posted_at: string;
  expires_at: string | null;
}

export interface JobFormData {
  company_name: string;
  company_logo_url: string;
  title: string;
  description: string;
  apply_url: string;
  experience_level: string;
  skills_required: string[];
  salary_min: number | null;
  salary_max: number | null;
  location_city: string;
  location_area: string;
  work_setup: string;
  job_type: string;
  expires_at: string;
}

export interface EmployerStats {
  activeJobs: number;
  totalViews: number;
  totalApplicants: number;
}
