-- 018: Public profiles — vanity URLs + privacy controls
-- Adds username, is_profile_public, and public_sections to profiles

-- Add columns
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS username text UNIQUE,
  ADD COLUMN IF NOT EXISTS is_profile_public boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS public_sections jsonb NOT NULL DEFAULT '{
    "headline": true,
    "skills": true,
    "experience_level": true,
    "education": true,
    "preferred_industries": true,
    "employment_type": true,
    "salary": false,
    "city": false,
    "work_preference": false
  }'::jsonb;

-- Username format constraint: 3-30 chars, lowercase alphanumeric + hyphens, no leading/trailing hyphen
ALTER TABLE profiles
  ADD CONSTRAINT username_format CHECK (
    username ~ '^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$'
  );

-- Partial unique index (only non-null usernames)
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_username
  ON profiles (username)
  WHERE username IS NOT NULL;

-- RLS policy: anyone can view public profiles
CREATE POLICY "Public profiles are viewable by anyone"
  ON profiles
  FOR SELECT
  USING (is_profile_public = true AND username IS NOT NULL);
