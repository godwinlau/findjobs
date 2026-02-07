"use client";

import { useState } from "react";
import Link from "next/link";
import { ScrollReveal } from "./ScrollReveal";

const skills = [
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

export function SkillDemo() {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggle(name: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  let totalJobs = 0;
  for (const s of skills) {
    if (selected.has(s.name)) totalJobs += s.jobs;
  }
  // Diminishing returns to feel realistic
  totalJobs = Math.round(totalJobs * 0.7 + selected.size * 3);

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
                    <span className="lp-dpill-check">&check;</span>
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
                    <div className="lp-dr-big">{totalJobs}</div>
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
