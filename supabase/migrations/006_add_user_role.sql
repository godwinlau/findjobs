-- HanapBuhay: Add user role to profiles
-- Distinguishes job seekers from employers

-- ─── Enum ───
CREATE TYPE user_role AS ENUM ('job_seeker', 'employer');

-- ─── Add column (existing users backfilled as job_seeker) ───
ALTER TABLE profiles
  ADD COLUMN user_role user_role NOT NULL DEFAULT 'job_seeker';

-- ─── Index for role-based queries ───
CREATE INDEX idx_profiles_user_role ON profiles (user_role);
