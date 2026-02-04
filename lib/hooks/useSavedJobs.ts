"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "hanapbuhay_saved_jobs";

export function useSavedJobs() {
  const [savedIds, setSavedIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSavedIds(JSON.parse(raw));
    } catch {
      // ignore corrupt data
    }
  }, []);

  const persist = useCallback((ids: string[]) => {
    setSavedIds(ids);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {
      // storage full — silently fail
    }
  }, []);

  const toggleSave = useCallback(
    (jobId: string) => {
      const next = savedIds.includes(jobId)
        ? savedIds.filter((id) => id !== jobId)
        : [...savedIds, jobId];
      persist(next);
    },
    [savedIds, persist],
  );

  const isSaved = useCallback(
    (jobId: string) => savedIds.includes(jobId),
    [savedIds],
  );

  return { toggleSave, isSaved };
}
