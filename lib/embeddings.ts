import { Profile } from "@/lib/types";

// ─── Types ───

interface EmbeddingJob {
  title: string;
  skills_required: string[];
  experience_level: string | null;
  work_setup: string | null;
  description_plain?: string;
}

// ─── Text builders ───
// Build structured text that captures the semantic meaning of a job/profile.
// Title is repeated (2x weight) since it's the strongest signal.

export function buildJobEmbeddingText(job: EmbeddingJob): string {
  const parts: string[] = [];

  // Title 2x for emphasis
  if (job.title) {
    parts.push(job.title, job.title);
  }

  if (job.skills_required?.length > 0) {
    parts.push(`Skills: ${job.skills_required.join(", ")}`);
  }

  if (job.experience_level) {
    parts.push(`Experience: ${job.experience_level}`);
  }

  if (job.work_setup) {
    parts.push(`Setup: ${job.work_setup}`);
  }

  if (job.description_plain) {
    parts.push(job.description_plain.slice(0, 300));
  }

  return parts.join(". ");
}

export function buildProfileEmbeddingText(profile: Profile): string {
  const parts: string[] = [];

  // Headline 2x for emphasis
  if (profile.headline) {
    parts.push(profile.headline, profile.headline);
  }

  if (profile.skills?.length > 0) {
    parts.push(`Skills: ${profile.skills.join(", ")}`);
  }

  if (profile.experience_level) {
    parts.push(`Experience: ${profile.experience_level}`);
  }

  if (profile.work_preference && profile.work_preference !== "any") {
    parts.push(`Preference: ${profile.work_preference}`);
  }

  if (profile.preferred_industries?.length > 0) {
    parts.push(`Industries: ${profile.preferred_industries.join(", ")}`);
  }

  return parts.join(". ");
}

// ─── HuggingFace Inference API ───

const HF_MODEL = "sentence-transformers/all-MiniLM-L6-v2";
const HF_API_URL = `https://router.huggingface.co/hf-inference/models/${HF_MODEL}/pipeline/feature-extraction`;

function getApiKey(): string | null {
  return process.env.HUGGINGFACE_API_KEY || null;
}

/**
 * Generate embeddings for a batch of texts using HuggingFace Inference API.
 * Returns null if API key is not set or request fails.
 */
export async function generateEmbeddings(
  texts: string[]
): Promise<number[][] | null> {
  const apiKey = getApiKey();
  if (!apiKey) return null;
  if (texts.length === 0) return [];

  try {
    const res = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: texts,
        options: { wait_for_model: true },
      }),
    });

    if (!res.ok) {
      console.error(`HuggingFace API error: ${res.status} ${res.statusText}`);
      return null;
    }

    const data: number[][] = await res.json();
    return data;
  } catch (err) {
    console.error("HuggingFace embedding error:", err);
    return null;
  }
}

/**
 * Generate a single embedding. Returns null on failure.
 */
export async function generateEmbeddingSafe(
  text: string
): Promise<number[] | null> {
  const result = await generateEmbeddings([text]);
  return result?.[0] ?? null;
}

// ─── Cosine similarity (local computation) ───

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;

  return dotProduct / denominator;
}

// ─── Batch embedding helper for ingestion ───

/**
 * Generate and store embeddings for newly inserted jobs.
 * Non-fatal — silently skips if HF API key is not set or on failure.
 */
export async function embedAndStoreJobs(
  jobRows: { id: string; title: string; skills_required: string[]; experience_level: string | null; work_setup: string | null; description_plain?: string }[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  batchSize = 32
): Promise<{ embedded: number; errors: number }> {
  const apiKey = getApiKey();
  if (!apiKey || jobRows.length === 0) return { embedded: 0, errors: 0 };

  let embedded = 0;
  let errors = 0;

  for (let i = 0; i < jobRows.length; i += batchSize) {
    const batch = jobRows.slice(i, i + batchSize);
    const texts = batch.map(buildJobEmbeddingText);

    const embeddings = await generateEmbeddings(texts);
    if (!embeddings) {
      errors += batch.length;
      continue;
    }

    for (let j = 0; j < batch.length; j++) {
      const embedding = embeddings[j];
      if (!embedding) {
        errors++;
        continue;
      }

      // Format as pgvector string: [0.1,0.2,...]
      const vectorStr = `[${embedding.join(",")}]`;

      const { error } = await supabase
        .from("jobs")
        .update({
          embedding: vectorStr,
          embedding_generated_at: new Date().toISOString(),
        })
        .eq("id", batch[j].id);

      if (error) {
        console.error(`Embedding update failed for job ${batch[j].id}:`, error.message);
        errors++;
      } else {
        embedded++;
      }
    }
  }

  return { embedded, errors };
}
