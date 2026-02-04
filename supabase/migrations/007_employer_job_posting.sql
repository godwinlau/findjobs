-- HanapBuhay: Employer job posting support
-- Adds posted_by column to jobs for employer-posted listings

-- ─── Add posted_by column ───
ALTER TABLE jobs
  ADD COLUMN posted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- ─── Index for employer dashboard queries ───
CREATE INDEX idx_jobs_posted_by ON jobs (posted_by, posted_at DESC)
  WHERE posted_by IS NOT NULL;

-- ─── RLS policies for employers ───

-- Employers can insert their own direct job postings
CREATE POLICY "Employers can insert own jobs"
  ON jobs FOR INSERT
  WITH CHECK (
    source = 'direct'
    AND posted_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND user_role = 'employer'
    )
  );

-- Employers can update their own direct job postings
CREATE POLICY "Employers can update own jobs"
  ON jobs FOR UPDATE
  USING (
    source = 'direct'
    AND posted_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND user_role = 'employer'
    )
  )
  WITH CHECK (
    source = 'direct'
    AND posted_by = auth.uid()
  );

-- Employers can read all their own jobs (including inactive)
CREATE POLICY "Employers can read own jobs"
  ON jobs FOR SELECT
  USING (
    posted_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND user_role = 'employer'
    )
  );
