-- HanapBuhay: Skill assessment results persistence
-- Run this in Supabase Dashboard → SQL Editor

CREATE TABLE skill_assessment_results (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id     text NOT NULL,
  score           smallint NOT NULL,
  total           smallint NOT NULL,
  question_ids    text[] NOT NULL,
  answers         smallint[] NOT NULL,
  experience_level text NOT NULL,
  completed_at    timestamptz NOT NULL DEFAULT now(),
  created_at      timestamptz DEFAULT now()
);

CREATE INDEX idx_assessment_results_user_category
  ON skill_assessment_results (user_id, category_id, completed_at DESC);

ALTER TABLE skill_assessment_results ENABLE ROW LEVEL SECURITY;

-- Users read/insert their own rows only. No UPDATE/DELETE — results are immutable.
CREATE POLICY "Users can read own" ON skill_assessment_results
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own" ON skill_assessment_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);
