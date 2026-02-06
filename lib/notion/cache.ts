import { unstable_cache } from "next/cache";

const REVALIDATE_SECONDS = 3600; // 1 hour

/**
 * Wraps a fetcher in Next.js unstable_cache with a 1-hour revalidation window.
 * Falls back gracefully if caching is unavailable (e.g. in scripts).
 */
export function cached<T>(
  fn: () => Promise<T>,
  keyParts: string[],
  tags?: string[]
): () => Promise<T> {
  return unstable_cache(fn, keyParts, {
    revalidate: REVALIDATE_SECONDS,
    tags: tags ?? keyParts,
  });
}
