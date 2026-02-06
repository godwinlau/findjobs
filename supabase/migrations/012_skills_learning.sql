-- Skills I'm Learning feature
-- Allows users to track skills they're currently learning but not yet proficient in

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS skills_learning text[] DEFAULT '{}';

-- Index for skills_learning (GIN for array queries)
CREATE INDEX IF NOT EXISTS idx_profiles_skills_learning ON profiles USING GIN (skills_learning);

COMMENT ON COLUMN profiles.skills_learning IS 'Skills the user is currently learning but not yet proficient in';
