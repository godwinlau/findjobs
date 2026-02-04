-- HanapBuhay: Profiles table for user onboarding & preferences
-- Run this in Supabase Dashboard → SQL Editor

-- ─── Enums ───
CREATE TYPE work_preference AS ENUM ('onsite', 'hybrid', 'remote', 'any');
CREATE TYPE employment_type AS ENUM ('full_time', 'part_time', 'contract', 'freelance', 'internship', 'any');
CREATE TYPE profile_experience_level AS ENUM ('fresh_graduate', 'junior', 'mid', 'senior');
CREATE TYPE education_level AS ENUM ('high_school', 'vocational', 'bachelors', 'masters', 'doctorate');

-- ─── Profiles table ───
CREATE TABLE profiles (
  id                    uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name             text NOT NULL,
  headline              text,
  avatar_url            text,
  preferred_city        text,
  work_preference       work_preference DEFAULT 'any',
  employment_type       employment_type DEFAULT 'full_time',
  skills                text[] DEFAULT '{}',
  experience_level      profile_experience_level DEFAULT 'fresh_graduate',
  years_of_experience   smallint DEFAULT 0,
  education             education_level,
  school                text,
  field_of_study        text,
  desired_salary_min    integer,
  desired_salary_max    integer,
  preferred_industries  text[] DEFAULT '{}',
  onboarding_completed  boolean NOT NULL DEFAULT false,
  onboarding_step       smallint NOT NULL DEFAULT 0,
  profile_completion    smallint NOT NULL DEFAULT 0,
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now()
);

-- ─── Indexes ───
-- Skills matching (GIN for array overlap)
CREATE INDEX idx_profiles_skills ON profiles USING GIN (skills);

-- ─── Updated_at trigger (reuses function from migration 001) ───
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ─── Auto-create profile on signup ───
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ─── RLS ───
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
