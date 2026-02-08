-- Add health check tracking columns to jobs table
ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS last_health_check_at timestamptz,
  ADD COLUMN IF NOT EXISTS failed_checks integer DEFAULT 0;

-- Index for efficiently selecting jobs needing health checks
CREATE INDEX IF NOT EXISTS idx_jobs_health_check
  ON jobs (is_active, last_health_check_at);
