-- Profile enhancements for overhauled onboarding & matching
-- Adds skill proficiencies, willing_to_relocate, and expanded experience levels

-- 1. Add new columns
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS skill_proficiencies jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS willing_to_relocate boolean DEFAULT false;

-- 2. Expand experience level enum to finer-grained brackets
-- Postgres ALTER TYPE ... ADD VALUE is not transactional, so we add each individually.
-- IF NOT EXISTS ensures re-running is safe.
ALTER TYPE profile_experience_level ADD VALUE IF NOT EXISTS 'less_than_1yr';
ALTER TYPE profile_experience_level ADD VALUE IF NOT EXISTS '1_to_3yr';
ALTER TYPE profile_experience_level ADD VALUE IF NOT EXISTS '3_to_5yr';
ALTER TYPE profile_experience_level ADD VALUE IF NOT EXISTS '5_to_10yr';
ALTER TYPE profile_experience_level ADD VALUE IF NOT EXISTS '10_plus';
