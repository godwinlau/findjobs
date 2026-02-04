-- Add indexes for explore-page filter columns to eliminate full-table scans

CREATE INDEX IF NOT EXISTS idx_jobs_work_setup
  ON jobs (work_setup) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_jobs_job_type
  ON jobs (job_type) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_jobs_experience_level
  ON jobs (experience_level) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_jobs_location_city
  ON jobs (location_city) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_jobs_salary_range
  ON jobs (salary_min, salary_max) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_jobs_company_verified
  ON jobs (company_verified) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_jobs_posted_at
  ON jobs (posted_at DESC) WHERE is_active = true;
