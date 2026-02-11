-- Pre-computed job match cache per user
-- Stores top N matched jobs so dashboard reads are instant (~50ms)
-- Recomputed by cron and on profile updates

create table if not exists public.user_matched_jobs (
  user_id       uuid         not null references auth.users(id) on delete cascade,
  job_id        uuid         not null references public.jobs(id) on delete cascade,
  match_score   smallint     not null,       -- 0-98
  match_highlight text,
  matched_skills text[]      default '{}',
  rank          smallint     not null,        -- 1-based position
  total_matches int          not null default 0, -- stored on rank=1 row
  computed_at   timestamptz  not null default now(),
  primary key (user_id, job_id)
);

-- Fast lookup: get top N for a user ordered by rank
create index if not exists idx_umj_user_rank
  on public.user_matched_jobs (user_id, rank);

-- Cron staleness check: find users with old caches
create index if not exists idx_umj_computed_at
  on public.user_matched_jobs (computed_at);

-- Cascade cleanup when a job is deactivated/deleted
create index if not exists idx_umj_job_id
  on public.user_matched_jobs (job_id);

-- RLS: users can only read their own cached matches
alter table public.user_matched_jobs enable row level security;

create policy "Users can read own matched jobs"
  on public.user_matched_jobs
  for select
  using (auth.uid() = user_id);
