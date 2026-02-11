// Zod validation schemas for server actions

import { z } from "zod";

// ─── Username & Public Profile Schemas ───

export const RESERVED_USERNAMES = new Set([
  "api", "auth", "admin", "home", "login", "signup", "settings", "profile",
  "onboarding", "explore", "learn", "u", "app", "help", "about", "terms",
  "privacy", "contact", "support", "status", "blog", "docs", "search",
  "jobs", "companies", "dashboard", "account", "notifications", "messages",
  "null", "undefined", "www", "mail", "ftp",
]);

export const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(30, "Username must be 30 characters or fewer")
  .regex(
    /^[a-z0-9][a-z0-9-]*[a-z0-9]$/,
    "Only lowercase letters, numbers, and hyphens (no leading/trailing hyphen)"
  )
  .refine((val) => !RESERVED_USERNAMES.has(val), {
    message: "This username is reserved",
  });

export const publicSectionsSchema = z.object({
  headline: z.boolean(),
  skills: z.boolean(),
  experience_level: z.boolean(),
  education: z.boolean(),
  preferred_industries: z.boolean(),
  employment_type: z.boolean(),
  salary: z.boolean(),
  city: z.boolean(),
  work_preference: z.boolean(),
});

// ─── Profile Schemas ───

export const workPreferenceSchema = z.enum(["onsite", "hybrid", "remote", "any"]);

export const employmentTypeSchema = z.enum([
  "full_time",
  "part_time",
  "contract",
  "freelance",
  "internship",
  "any",
]);

export const experienceLevelSchema = z.enum([
  "fresh_graduate",
  "entry_level",
  "junior",
  "mid",
  "senior",
  "lead",
  "manager",
  "director",
  "5_to_10yr",
  "10_plus",
]);

export const educationLevelSchema = z.enum([
  "high_school",
  "vocational",
  "bachelors",
  "masters",
  "doctorate",
]);

export const skillProficiencySchema = z.enum(["beginner", "intermediate", "advanced"]);

// Profile update schema
// All fields use .nullable().optional() because the DB returns null for unset columns
// and the entire profile object is validated (not just step-specific fields).
export const profileUpdateSchema = z.object({
  full_name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name too long")
    .nullable()
    .optional(),
  headline: z.string().max(200, "Headline too long").nullable().optional(),
  preferred_city: z.string().max(100).nullable().optional(),
  work_preference: workPreferenceSchema.nullable().optional(),
  employment_type: employmentTypeSchema.nullable().optional(),
  skills: z.array(z.string().max(100)).max(50, "Too many skills").nullable().optional(),
  skills_learning: z.array(z.string().max(100)).max(20, "Too many learning skills").nullable().optional(),
  skill_proficiencies: z.record(z.string(), skillProficiencySchema).nullable().optional(),
  experience_level: experienceLevelSchema.nullable().optional(),
  years_of_experience: z.number().min(0).max(50).nullable().optional(),
  education: educationLevelSchema.nullable().optional(),
  school: z.string().max(200).nullable().optional(),
  field_of_study: z.string().max(200).nullable().optional(),
  desired_salary_min: z.number().min(0).max(10000000).nullable().optional(),
  desired_salary_max: z.number().min(0).max(10000000).nullable().optional(),
  preferred_industries: z.array(z.string().max(100)).max(10).nullable().optional(),
  willing_to_relocate: z.boolean().nullable().optional(),
  username: z.string().nullable().optional(),
  is_profile_public: z.boolean().optional(),
  public_sections: publicSectionsSchema.optional(),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

// Onboarding step schema (same fields, different context)
export const onboardingStepSchema = profileUpdateSchema;

// ─── Activity Schemas ───

export const activityTypeSchema = z.enum([
  "job_view",
  "job_apply",
  "job_save",
  "profile_update",
  "skill_assessment",
]);

export const logActivitySchema = z.object({
  activityType: activityTypeSchema,
  targetId: z.string().max(100).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type LogActivityInput = z.infer<typeof logActivitySchema>;

// ─── Assessment Schemas ───

export const assessmentResultSchema = z.object({
  categoryId: z.string().min(1).max(100),
  score: z.number().int().min(0).max(100),
  total: z.number().int().min(1).max(100),
  questionIds: z.array(z.string()).min(1).max(50),
  answers: z.array(z.number().int().min(0).max(10)).min(1).max(50),
  experienceLevel: z.string().max(50),
});

export type AssessmentResultInput = z.infer<typeof assessmentResultSchema>;

// ─── Validation Helpers ───

export function validateProfileUpdate(data: unknown): {
  success: boolean;
  data?: ProfileUpdateInput;
  error?: string;
} {
  const result = profileUpdateSchema.safeParse(data);
  if (!result.success) {
    // Zod v4 uses result.error.issues instead of result.error.errors
    const issues = result.error.issues || [];
    if (issues.length > 0) {
      const firstIssue = issues[0];
      return {
        success: false,
        error: `${firstIssue.path.join(".")}: ${firstIssue.message}`,
      };
    }
    return { success: false, error: "Validation failed" };
  }
  return { success: true, data: result.data };
}

export function validateLogActivity(data: unknown): {
  success: boolean;
  data?: LogActivityInput;
  error?: string;
} {
  const result = logActivitySchema.safeParse(data);
  if (!result.success) {
    const issues = result.error.issues || [];
    if (issues.length > 0) {
      const firstIssue = issues[0];
      return {
        success: false,
        error: `${firstIssue.path.join(".")}: ${firstIssue.message}`,
      };
    }
    return { success: false, error: "Validation failed" };
  }
  return { success: true, data: result.data };
}

export function validateAssessmentResult(data: unknown): {
  success: boolean;
  data?: AssessmentResultInput;
  error?: string;
} {
  const result = assessmentResultSchema.safeParse(data);
  if (!result.success) {
    const issues = result.error.issues || [];
    if (issues.length > 0) {
      const firstIssue = issues[0];
      return {
        success: false,
        error: `${firstIssue.path.join(".")}: ${firstIssue.message}`,
      };
    }
    return { success: false, error: "Validation failed" };
  }
  return { success: true, data: result.data };
}
