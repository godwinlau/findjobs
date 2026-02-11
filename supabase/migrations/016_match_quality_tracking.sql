-- 016: Match quality tracking — instrumentation for measuring match effectiveness
-- Separate from user_activities to handle high-volume impression events

CREATE TABLE IF NOT EXISTS match_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('impression', 'click', 'apply', 'save', 'dismiss', 'not_relevant')),
  match_score smallint,           -- score at time of event (0-98)
  position smallint,              -- position in feed
  time_spent_ms integer,          -- time on card/detail page
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for user-level funnel analysis (impressions → clicks → applies per day)
CREATE INDEX IF NOT EXISTS idx_match_events_user_date
  ON match_events (user_id, created_at);

-- Index for job-level engagement analysis
CREATE INDEX IF NOT EXISTS idx_match_events_job_type
  ON match_events (job_id, event_type);

-- Index for conversion funnel queries (user → job → event progression)
CREATE INDEX IF NOT EXISTS idx_match_events_user_job_type
  ON match_events (user_id, job_id, event_type);

-- RLS: users can read and insert their own events
ALTER TABLE match_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own match events"
  ON match_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own match events"
  ON match_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Analytics view: conversion funnel by score bucket (30-day rolling)
CREATE OR REPLACE VIEW match_quality_stats AS
SELECT
  CASE
    WHEN match_score >= 80 THEN '80-98'
    WHEN match_score >= 60 THEN '60-79'
    WHEN match_score >= 40 THEN '40-59'
    ELSE '0-39'
  END AS score_bucket,
  COUNT(*) FILTER (WHERE event_type = 'impression') AS impressions,
  COUNT(*) FILTER (WHERE event_type = 'click') AS clicks,
  COUNT(*) FILTER (WHERE event_type = 'apply') AS applies,
  COUNT(*) FILTER (WHERE event_type = 'save') AS saves,
  COUNT(*) FILTER (WHERE event_type = 'dismiss') AS dismissals,
  COUNT(*) FILTER (WHERE event_type = 'not_relevant') AS not_relevant,
  ROUND(
    COUNT(*) FILTER (WHERE event_type = 'click')::numeric /
    NULLIF(COUNT(*) FILTER (WHERE event_type = 'impression'), 0) * 100,
    1
  ) AS click_rate_pct,
  ROUND(
    COUNT(*) FILTER (WHERE event_type = 'apply')::numeric /
    NULLIF(COUNT(*) FILTER (WHERE event_type = 'click'), 0) * 100,
    1
  ) AS apply_rate_pct
FROM match_events
WHERE created_at >= now() - interval '30 days'
GROUP BY score_bucket
ORDER BY score_bucket DESC;
