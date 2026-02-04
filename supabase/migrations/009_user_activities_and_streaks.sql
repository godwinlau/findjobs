-- HanapBuhay: User activity tracking & streak system
-- Run this in Supabase Dashboard → SQL Editor

-- ─── Enum for activity types ───
CREATE TYPE activity_type AS ENUM (
  'job_view',
  'job_apply',
  'job_save',
  'profile_update',
  'skill_assessment'
);

-- ─── User activities table ───
CREATE TABLE user_activities (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type   activity_type NOT NULL,
  target_id       text,
  metadata        jsonb DEFAULT '{}',
  activity_date   date NOT NULL,
  created_at      timestamptz DEFAULT now()
);

-- ─── Indexes ───
-- Fast weekly queries: activities for a user ordered by date
CREATE INDEX idx_user_activities_user_date
  ON user_activities (user_id, activity_date DESC);

-- Deduplication: same user + type + target + date = 1 row
CREATE UNIQUE INDEX idx_user_activities_dedup
  ON user_activities (user_id, activity_type, target_id, activity_date)
  WHERE target_id IS NOT NULL;

-- ─── RLS ───
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own activities"
  ON user_activities FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activities"
  ON user_activities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ─── Add streak columns to profiles ───
ALTER TABLE profiles
  ADD COLUMN current_streak     smallint NOT NULL DEFAULT 0,
  ADD COLUMN longest_streak     smallint NOT NULL DEFAULT 0,
  ADD COLUMN last_activity_date date;
