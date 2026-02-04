-- HanapBuhay: Jobs table + ingestion logs
-- Run this in Supabase Dashboard → SQL Editor

-- ─── Enums ───
CREATE TYPE job_source AS ENUM ('jsearch', 'adzuna', 'remotive', 'rss', 'direct', 'schema_crawl');
CREATE TYPE work_setup AS ENUM ('onsite', 'hybrid', 'remote');
CREATE TYPE job_type AS ENUM ('full_time', 'part_time', 'contract', 'freelance', 'internship');
CREATE TYPE experience_level AS ENUM ('entry', 'junior', 'mid', 'senior');

-- ─── Jobs table ───
CREATE TABLE jobs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source          job_source NOT NULL,
  source_id       text NOT NULL,
  source_hash     text,                          -- cross-source dedup hash

  title           text NOT NULL,
  company_name    text NOT NULL,
  company_verified boolean DEFAULT false,
  company_logo_url text,

  description      text NOT NULL,
  description_plain text NOT NULL,

  salary_min       integer,                      -- monthly PHP
  salary_max       integer,                      -- monthly PHP
  salary_is_estimate boolean DEFAULT false,

  location_city    text,
  location_area    text,
  work_setup       work_setup,
  job_type         job_type,
  experience_level experience_level,
  skills_required  text[] DEFAULT '{}',

  apply_url        text NOT NULL,
  posted_at        timestamptz NOT NULL,
  expires_at       timestamptz,
  fetched_at       timestamptz NOT NULL DEFAULT now(),

  is_active        boolean NOT NULL DEFAULT true,
  applicant_count  integer DEFAULT 0,
  view_count       integer DEFAULT 0,

  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

-- ─── Indexes ───
-- Primary feed query
CREATE INDEX idx_jobs_active_posted ON jobs (is_active, posted_at DESC);

-- Skill matching (GIN for array overlap)
CREATE INDEX idx_jobs_skills ON jobs USING GIN (skills_required);

-- Deduplication: same source, same external ID
CREATE UNIQUE INDEX idx_jobs_source_dedup ON jobs (source, source_id);

-- Cross-source dedup lookup
CREATE INDEX idx_jobs_source_hash ON jobs (source_hash) WHERE source_hash IS NOT NULL;

-- Full-text search
ALTER TABLE jobs ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(company_name, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(description_plain, '')), 'C')
  ) STORED;
CREATE INDEX idx_jobs_search ON jobs USING GIN (search_vector);

-- Expiration cleanup
CREATE INDEX idx_jobs_expiration ON jobs (expires_at) WHERE is_active = true AND expires_at IS NOT NULL;

-- ─── Updated_at trigger ───
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ─── Ingestion logs ───
CREATE TABLE ingestion_logs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source      job_source NOT NULL,
  batch       integer NOT NULL,
  query       text NOT NULL,
  fetched     integer DEFAULT 0,
  inserted    integer DEFAULT 0,
  duplicates  integer DEFAULT 0,
  errors      integer DEFAULT 0,
  error_details text,
  duration_ms integer,
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX idx_ingestion_logs_created ON ingestion_logs (created_at DESC);

-- ─── RLS (disable for service role, enable for anon) ───
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingestion_logs ENABLE ROW LEVEL SECURITY;

-- Public can read active jobs
CREATE POLICY "Public can read active jobs"
  ON jobs FOR SELECT
  USING (is_active = true);

-- Service role can do everything (used by ingestion pipeline)
-- No policy needed — service role bypasses RLS
