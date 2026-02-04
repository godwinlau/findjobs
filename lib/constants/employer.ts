// HanapBuhay Employer Constants

// ─── Work setup options (maps to work_setup enum in jobs table) ───
export const WORK_SETUP_OPTIONS = [
  { value: "onsite", label: "Onsite" },
  { value: "hybrid", label: "Hybrid" },
  { value: "remote", label: "Remote" },
] as const;

// ─── Job type options (maps to job_type enum in jobs table) ───
export const JOB_TYPE_OPTIONS = [
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "freelance", label: "Freelance" },
  { value: "internship", label: "Internship" },
] as const;

// ─── Experience level options (maps to experience_level enum in jobs table) ───
export const JOB_EXPERIENCE_LEVELS = [
  { value: "entry", label: "Entry Level" },
  { value: "junior", label: "Junior" },
  { value: "mid", label: "Mid-level" },
  { value: "senior", label: "Senior" },
] as const;
