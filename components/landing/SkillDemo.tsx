"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ScrollReveal } from "./ScrollReveal";
import type { SkillCount } from "@/lib/data/skill-counts";

const FALLBACK_SKILLS: SkillCount[] = [
  { name: "React", jobs: 28 },
  { name: "JavaScript", jobs: 22 },
  { name: "Figma", jobs: 18 },
  { name: "Python", jobs: 15 },
  { name: "TypeScript", jobs: 12 },
  { name: "UI Design", jobs: 20 },
  { name: "Node.js", jobs: 14 },
  { name: "Next.js", jobs: 10 },
  { name: "Product Design", jobs: 16 },
  { name: "Shopify", jobs: 8 },
  { name: "PHP / Laravel", jobs: 11 },
  { name: "Vue.js", jobs: 9 },
];

interface SkillDemoProps {
  skillCounts?: SkillCount[];
}

export function SkillDemo({ skillCounts }: SkillDemoProps) {
  const useLiveData = !!skillCounts && skillCounts.length > 0;
  const skills = useLiveData ? skillCounts : FALLBACK_SKILLS;

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [liveCount, setLiveCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function toggle(name: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  // Client-side estimate (fallback formula)
  function estimateCount(sel: Set<string>): number {
    let total = 0;
    for (const s of skills) {
      if (sel.has(s.name)) total += s.jobs;
    }
    return Math.round(total * 0.7 + sel.size * 3);
  }

  const fetchCount = useCallback(
    (sel: Set<string>) => {
      // Cancel previous in-flight request
      if (abortRef.current) abortRef.current.abort();

      if (sel.size === 0) {
        setLiveCount(null);
        setLoading(false);
        return;
      }

      // If using fallback data, skip API call
      if (!useLiveData) {
        setLiveCount(estimateCount(sel));
        return;
      }

      setLoading(true);
      const controller = new AbortController();
      abortRef.current = controller;

      const params = Array.from(sel).join(",");
      fetch(`/api/landing/skill-match-count?skills=${encodeURIComponent(params)}`, {
        signal: controller.signal,
      })
        .then((res) => res.json())
        .then((data: { count: number }) => {
          setLiveCount(data.count);
          setLoading(false);
        })
        .catch((err) => {
          if (err.name === "AbortError") return;
          // On error, fall back to client-side estimate
          setLiveCount(estimateCount(sel));
          setLoading(false);
        });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [useLiveData, skills]
  );

  // Debounce API calls on selection change
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => fetchCount(selected), 300);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [selected, fetchCount]);

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  const displayCount = liveCount ?? 0;
  const hasResults = selected.size > 0;
  const showCta = selected.size >= 3;

  return (
    <section className="lp-section">
      <div className="lp-section-inner">
        <ScrollReveal>
          <div className="lp-section-label">{"// try it yourself"}</div>
          <div className="lp-section-title">See how many jobs match you</div>
          <div className="lp-section-sub">
            Pick a few skills — no signup needed. Just tap and see what happens.
          </div>

          <div className="lp-demo">
            <div className="lp-demo-header">
              <div className="lp-demo-title">
                Pick your <span>skills</span>
              </div>
              <div className="lp-demo-hint">Tap 3+ to see results</div>
            </div>
            <div className="lp-demo-body">
              <div className="lp-demo-pills">
                {skills.map((s) => (
                  <button
                    key={s.name}
                    className={`lp-demo-pill${selected.has(s.name) ? " lp-selected" : ""}`}
                    onClick={() => toggle(s.name)}
                    type="button"
                  >
                    <span className="lp-dpill-check">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    </span>
                    {s.name}
                  </button>
                ))}
              </div>
              <div
                className={`lp-demo-result${hasResults ? " lp-active" : ""}`}
              >
                {!hasResults && (
                  <div className="lp-dr-empty">
                    &larr; Select skills to see your matches
                  </div>
                )}
                {hasResults && (
                  <div className="lp-dr-left">
                    <div className={`lp-dr-big${loading ? " lp-dr-loading" : ""}`}>
                      {loading ? "..." : displayCount}
                    </div>
                    <div className="lp-dr-sub">
                      jobs match your skills right now
                    </div>
                  </div>
                )}
                <Link
                  href="/signup"
                  className={`lp-dr-cta${showCta ? " lp-dr-visible" : ""}`}
                >
                  Sign Up to See Them &rarr;
                </Link>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
