-- 015: Add structured skills column to jobs table
-- Stores LLM-extracted skill data with importance tiers and confidence scores
-- Format: [{skillId, label, importance, confidence, domain, tier}]

ALTER TABLE jobs ADD COLUMN IF NOT EXISTS skills_structured jsonb DEFAULT '[]';

-- GIN index for JSONB queries (e.g. filtering by specific skills or importance)
CREATE INDEX IF NOT EXISTS idx_jobs_skills_structured
ON jobs USING GIN (skills_structured);
