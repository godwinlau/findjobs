"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { ScrollReveal } from "./ScrollReveal";

/* ── Skills database (matches our 5 core categories) ── */
const SKILLS_DB: Record<string, string[]> = {
  "Tech & IT": [
    "React", "JavaScript", "TypeScript", "Python", "Node.js", "Next.js",
    "PHP", "Laravel", "HTML/CSS", "Tailwind CSS", "REST APIs",
    "PostgreSQL", "MongoDB", "AWS", "WordPress", "Webflow", "Shopify",
  ],
  Design: [
    "UI Design", "UX Design", "Figma", "Adobe Photoshop", "Adobe Illustrator",
    "Canva", "Prototyping", "Wireframing", "Motion Design",
    "Brand Design", "Visual Design",
  ],
  BPO: [
    "Customer Service (Voice)", "Email Support", "Live Chat Support",
    "Data Entry", "English Proficiency", "Technical Support",
    "Back Office Processing", "Quality Assurance", "Medical Transcription",
    "Insurance Processing",
  ],
  Marketing: [
    "SEO", "Social Media Management", "Copywriting", "Facebook/Meta Ads",
    "Content Writing", "Google Ads", "Email Marketing", "Analytics",
    "Content Marketing", "HubSpot",
  ],
  "Virtual Assistant": [
    "Email Management", "Calendar Management", "Google Workspace",
    "Project Management", "Research & Reporting", "Bookkeeping",
    "Travel Coordination", "CRM Management", "Invoicing",
    "Executive Assistance",
  ],
};

const ALL_SKILLS = Object.entries(SKILLS_DB).flatMap(([cat, skills]) =>
  skills.map((s) => ({ name: s, category: cat }))
);

const QUICK_PICKS = [
  "Customer Service (Voice)", "React", "Figma", "SEO",
  "Google Workspace", "Data Entry", "Copywriting", "Canva",
  "Email Support", "Project Management", "Social Media Management",
  "JavaScript",
];

function getMatchCount(count: number): number {
  const curve = [0, 12, 31, 48, 73, 94, 118, 139, 156, 167, 178];
  return curve[Math.min(count, 10)] ?? 0;
}

/* ── Highlight helper ── */
function highlightMatch(text: string, query: string) {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + query.length);
  const after = text.slice(idx + query.length);
  return (
    <>
      {before}
      <mark>{match}</mark>
      {after}
    </>
  );
}

export function SkillDemo() {
  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  /* Filtered autocomplete results */
  const filtered = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return ALL_SKILLS.filter(
      (s) => s.name.toLowerCase().includes(q) && !selected.includes(s.name)
    ).slice(0, 6);
  }, [query, selected]);

  /* Reset highlight when results change */
  useEffect(() => {
    setHighlightIdx(-1);
  }, [filtered]);

  /* Click-outside to close dropdown */
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const add = useCallback(
    (name: string) => {
      if (selected.length >= 10 || selected.includes(name)) return;
      setSelected((p) => [...p, name]);
      setQuery("");
      setShowDropdown(false);
      inputRef.current?.focus();
    },
    [selected]
  );

  const remove = useCallback((name: string) => {
    setSelected((p) => p.filter((s) => s !== name));
  }, []);

  const handleKey = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightIdx((p) => Math.min(p + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightIdx((p) => Math.max(p - 1, 0));
      } else if (
        e.key === "Enter" &&
        highlightIdx >= 0 &&
        filtered[highlightIdx]
      ) {
        e.preventDefault();
        add(filtered[highlightIdx].name);
      } else if (e.key === "Backspace" && !query && selected.length) {
        remove(selected[selected.length - 1]);
      }
    },
    [filtered, highlightIdx, query, selected, add, remove]
  );

  const matchCount = getMatchCount(selected.length);
  const quickAvailable = QUICK_PICKS.filter((s) => !selected.includes(s));
  const atCap = selected.length >= 10;

  return (
    <section className="lp-section">
      <div className="lp-section-inner">
        <ScrollReveal>
          <div className="lp-section-label">{"// go ahead, try it"}</div>
          <div className="lp-section-title">
            What&apos;s your bigmovv score?
          </div>
          <div className="lp-section-sub">
            Pick a few skills below &mdash; no signup, no catch. Watch real jobs
            appear and try not to update your LinkedIn immediately.
          </div>

          <div className="lp-demo">
            <div className="lp-demo-header">
              <div className="lp-demo-title">
                Pick your <span>skills</span>
              </div>
              <div className="lp-demo-hint">Tap 3+ to see your score</div>
            </div>

            <div className="lp-demo-body" ref={wrapRef}>
              {/* Search row */}
              <div className="lp-demo-search-row">
                <span className="lp-demo-search-icon">⌕</span>
                <input
                  ref={inputRef}
                  className="lp-demo-search-input"
                  placeholder={atCap ? "Max skills reached" : "Type a skill..."}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => {
                    if (query) setShowDropdown(true);
                  }}
                  onKeyDown={handleKey}
                  disabled={atCap}
                />
                {selected.length > 0 && (
                  <div className="lp-demo-count-badge">
                    <span>{selected.length}</span>/10
                  </div>
                )}
              </div>

              {/* Autocomplete dropdown */}
              {showDropdown && query.trim() && (
                <div className="lp-demo-dropdown">
                  {filtered.length > 0 ? (
                    filtered.map((s, i) => (
                      <div
                        key={s.name}
                        className={`lp-demo-dd-item${i === highlightIdx ? " lp-dd-hl" : ""}`}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          add(s.name);
                        }}
                        onMouseEnter={() => setHighlightIdx(i)}
                      >
                        <span className="lp-demo-dd-name">
                          {highlightMatch(s.name, query)}
                        </span>
                        <span className="lp-demo-dd-cat">{s.category}</span>
                      </div>
                    ))
                  ) : (
                    <div className="lp-demo-dd-empty">
                      No results for &ldquo;{query}&rdquo;
                    </div>
                  )}
                </div>
              )}

              {/* Selected chips + quick picks */}
              <div className="lp-demo-chips">
                {selected.map((s) => (
                  <span key={s} className="lp-demo-sel-chip">
                    {s}
                    <button
                      className="lp-demo-sel-x"
                      onClick={() => remove(s)}
                      type="button"
                      aria-label={`Remove ${s}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
                {selected.length === 0 && (
                  <div className="lp-demo-empty-hint">
                    ↑ search or tap to add
                  </div>
                )}
                {selected.length === 0 &&
                  quickAvailable.slice(0, 8).map((s) => (
                    <button
                      key={s}
                      className="lp-demo-quick-chip"
                      onClick={() => add(s)}
                      type="button"
                    >
                      + {s}
                    </button>
                  ))}
                {selected.length > 0 &&
                  !atCap &&
                  quickAvailable
                    .slice(0, Math.max(0, 6 - selected.length))
                    .map((s) => (
                      <button
                        key={s}
                        className="lp-demo-quick-chip"
                        onClick={() => add(s)}
                        type="button"
                      >
                        + {s}
                      </button>
                    ))}
              </div>
            </div>

            {/* Match footer */}
            <div className="lp-demo-footer">
              <div className="lp-demo-match-row">
                <span className="lp-demo-match-num">{matchCount}</span>
                <span className="lp-demo-match-label">
                  {selected.length === 0
                    ? "Add skills to see matches"
                    : "jobs match your skills"}
                </span>
              </div>
              <Link
                href="/signup"
                className={`lp-demo-cta${selected.length < 3 ? " lp-off" : ""}`}
              >
                See matches &rarr;
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
