-- 013: Add pgvector embeddings for semantic job matching
-- Enables cosine similarity search between profile and job embeddings.

-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- 2. Add embedding column + timestamp to jobs
ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS embedding vector(384),
  ADD COLUMN IF NOT EXISTS embedding_generated_at timestamptz;

-- 3. HNSW index for fast cosine similarity on active jobs
-- Only index active jobs to keep the index small.
CREATE INDEX IF NOT EXISTS idx_jobs_embedding_hnsw
  ON jobs
  USING hnsw (embedding vector_cosine_ops)
  WHERE is_active = true;

-- 4. RPC function: match jobs by embedding similarity
-- Returns job IDs + similarity scores using the HNSW index.
-- Keeps vectors server-side — only IDs and scores cross the network.
CREATE OR REPLACE FUNCTION match_jobs_by_embedding(
  query_embedding vector(384),
  similarity_threshold float DEFAULT 0.3,
  match_count int DEFAULT 500
)
RETURNS TABLE (
  job_id uuid,
  similarity float
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    j.id AS job_id,
    1 - (j.embedding <=> query_embedding) AS similarity
  FROM jobs j
  WHERE j.is_active = true
    AND j.embedding IS NOT NULL
    AND 1 - (j.embedding <=> query_embedding) >= similarity_threshold
  ORDER BY j.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
