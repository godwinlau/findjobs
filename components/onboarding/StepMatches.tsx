"use client";

import { useState, useEffect, useRef } from "react";

interface MatchResult {
  role: string;
  company: string;
  match: number;
  salary: string;
  tags?: string[];
}

interface MatchStats {
  totalMatches: number;
  bestMatchPercent: number;
  avgSalary: string;
  remoteCount: number;
  newToday: number;
}

interface StepMatchesProps {
  firstName: string;
  profileData: Record<string, unknown>;
  onComplete: () => void;
  saving: boolean;
}

export function StepMatches({
  firstName,
  profileData,
  onComplete,
  saving,
}: StepMatchesProps) {
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [stats, setStats] = useState<MatchStats | null>(null);
  const [totalJobs, setTotalJobs] = useState(0);
  const [revealPhase, setRevealPhase] = useState(0);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Fetch matches on mount
  useEffect(() => {
    fetch("/api/onboarding-matches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profileData),
    })
      .then((res) => res.json())
      .then((result) => {
        setMatches(result.matches || []);
        setStats(result.stats || null);
        setTotalJobs(result.totalJobs || 0);
        startReveal();
      })
      .catch(() => {
        setMatches([]);
        startReveal();
      });

    return () => {
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function startReveal() {
    // Orchestrated timeline
    const steps: [number, number][] = [
      [2000, 1],   // Hide loading, show results
      [2200, 2],   // Hero number
      [2400, 3],   // "jobs matched for you"
      [2600, 4],   // Context subtitle
      [2800, 5],   // Mini stat 1
      [2900, 6],   // Mini stat 2
      [3000, 7],   // Mini stat 3
      [3100, 8],   // Mini stat 4
      [3300, 9],   // "Your top matches" label
      [3500, 10],  // Job card 1
      [3700, 11],  // Job card 2
      [3900, 12],  // Job card 3
      [4100, 13],  // Job card 4
      [4300, 14],  // Job card 5
      [4600, 15],  // "+N more" text
      [4800, 16],  // Bottom bar + progress completes
    ];

    for (const [delay, phase] of steps) {
      const id = setTimeout(() => {
        if (phase === 1) setLoading(false);
        setRevealPhase(phase);
      }, delay);
      timeoutsRef.current.push(id);
    }
  }

  const totalMatches = stats?.totalMatches ?? matches.length;
  const remainingMatches = Math.max(0, totalMatches - 5);
  const skillCount = (profileData.skills as string[] | undefined)?.length ?? 0;

  // Company initial for logo placeholder
  function companyInitial(company: string) {
    return company.charAt(0).toUpperCase();
  }

  return (
    <div className="ob-main step-matches">
      <div className="ob-content">
        {/* Loading State */}
        <div className={`ob-loading${!loading ? " hidden" : ""}`}>
          <div className="ob-loader">
            <div className="ob-loader-block" />
            <div className="ob-loader-block yellow" />
            <div className="ob-loader-block" />
          </div>
          <div className="ob-loading-text">
            Analyzing {totalJobs > 0 ? totalJobs.toLocaleString() : "2,400"} jobs
          </div>
          <div className="ob-loading-sub">
            Matching your skills and preferences&hellip;
          </div>
        </div>

        {/* Results State */}
        <div className={`ob-results${revealPhase >= 1 ? " visible" : ""}`}>
          {/* Hero stat */}
          <div className="ob-hero-stat">
            <div className={`ob-hs-number${revealPhase >= 2 ? " visible" : ""}`}>
              <span>{totalMatches}</span>
            </div>
            <div className={`ob-hs-label${revealPhase >= 3 ? " visible" : ""}`}>
              jobs matched for you
            </div>
            <div className={`ob-hs-sub${revealPhase >= 4 ? " visible" : ""}`}>
              Based on {skillCount} skill{skillCount !== 1 ? "s" : ""}
              {(profileData.work_preference as string) === "remote" ? " \u00B7 Remote" : ""}
            </div>
          </div>

          {/* Mini stats */}
          <div className="ob-mini-stats">
            <div className={`ob-ms${revealPhase >= 5 ? " visible" : ""}`}>
              <div className="ob-ms-val yellow">
                {stats?.bestMatchPercent ?? (matches[0]?.match || 0)}%
              </div>
              <div className="ob-ms-label">Best Match</div>
            </div>
            <div className={`ob-ms${revealPhase >= 6 ? " visible" : ""}`}>
              <div className="ob-ms-val">
                {stats?.avgSalary ?? "\u20B165K"}
              </div>
              <div className="ob-ms-label">Avg. Salary</div>
            </div>
            <div className={`ob-ms${revealPhase >= 7 ? " visible" : ""}`}>
              <div className="ob-ms-val">{stats?.remoteCount ?? 0}</div>
              <div className="ob-ms-label">Remote</div>
            </div>
            <div className={`ob-ms${revealPhase >= 8 ? " visible" : ""}`}>
              <div className="ob-ms-val yellow">{stats?.newToday ?? 0}</div>
              <div className="ob-ms-label">New Today</div>
            </div>
          </div>

          {/* Preview label */}
          <div className={`ob-preview-label${revealPhase >= 9 ? " visible" : ""}`}>
            Your top matches
          </div>

          {/* Job cards */}
          <div className="ob-job-list">
            {matches.slice(0, 5).map((m, i) => {
              const isFeatured = i === 0;
              const phaseNeeded = 10 + i;
              return (
                <div
                  key={i}
                  className={`ob-job-card${isFeatured ? " featured" : ""}${revealPhase >= phaseNeeded ? " visible" : ""}`}
                >
                  <div className="ob-jc-logo">{companyInitial(m.company)}</div>
                  <div className="ob-jc-info">
                    {isFeatured && <div className="ob-jc-best">Best match</div>}
                    <div className="ob-jc-company">{m.company}</div>
                    <div className="ob-jc-title">{m.role}</div>
                    {m.tags && m.tags.length > 0 && (
                      <div className="ob-jc-meta">
                        {m.tags.map((tag, j) => (
                          <span key={j} className="ob-jc-tag">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="ob-jc-right">
                    <div className="ob-jc-match">{m.match}%</div>
                    <div className="ob-jc-salary">{m.salary}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* More row */}
          {remainingMatches > 0 && (
            <div className={`ob-more-row${revealPhase >= 15 ? " visible" : ""}`}>
              <div className="ob-more-text">
                + {remainingMatches} more matches waiting for you
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Step 3 has its own bottom bar */}
      <div className={`ob-bottom-bar final${revealPhase >= 16 ? " visible" : ""}`}>
        <div className="ob-bottom-inner">
          <div className="ob-bb-text">
            Your feed is ready{firstName ? <>, <strong>{firstName}</strong></> : null}
          </div>
          <button
            className="ob-bb-go"
            onClick={onComplete}
            disabled={saving}
          >
            {saving ? "Saving..." : "Let\u2019s Go \u2192"}
          </button>
        </div>
      </div>
    </div>
  );
}
