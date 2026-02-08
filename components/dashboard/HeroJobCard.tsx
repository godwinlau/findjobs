"use client";

import { useState } from "react";
import { Job } from "@/lib/types";
import { useLogoDominantColor } from "@/lib/hooks/useLogoDominantColor";

interface HeroJobCardProps {
  job: Job;
  isSaved?: boolean;
  onToggleSave?: () => void;
  onViewDetails?: (job: Job) => void;
}

export function HeroJobCard({
  job,
  isSaved = false,
  onToggleSave,
  onViewDetails,
}: HeroJobCardProps) {
  const [imgError, setImgError] = useState(false);
  const logoBg = useLogoDominantColor(job.logoUrl, job.logoBg);
  const isDisclosed = job.salary !== "Salary not disclosed";

  // Build skills display
  const matchedSet = new Set(
    (job.matchedSkills ?? []).map((s) => s.toLowerCase())
  );
  const required =
    (job.skillsRequired && job.skillsRequired.length > 0)
      ? job.skillsRequired
      : (job.matchedSkills ?? []);
  const matchedCount = required.filter((s) => matchedSet.has(s.toLowerCase())).length;
  const displaySkills = required.slice(0, 5);

  // Parse type parts
  const typeParts = job.type ? job.type.split(" · ") : [];

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("a") || target.closest("button")) return;
    onViewDetails?.(job);
  };

  return (
    <div
      className="hero-banner"
      onClick={handleCardClick}
      style={{
        animation: "fadeIn 0.4s cubic-bezier(.22,1,.36,1) 0.1s both",
      }}
    >
      {/* LEFT COLUMN */}
      <div className="hero-left">
        {/* Header: logo + info */}
        <div className="hero-header">
          <div
            className="hero-logo"
            style={{ background: logoBg, color: job.logoColor }}
          >
            {job.logoUrl && !imgError ? (
              <img
                src={job.logoUrl}
                alt={job.company}
                onError={() => setImgError(true)}
              />
            ) : (
              job.logo
            )}
          </div>
          <div className="hero-header-info">
            <div className="hero-tag-best">&#9733; Best Match</div>
            <div className="hero-role">{job.role}</div>
            <div className="hero-company">
              <span>{job.company}</span>
              {job.verified && (
                <span className="hero-verified">&#10003;</span>
              )}
            </div>
            <div className="hero-source">via {job.source}</div>
          </div>
        </div>

        {/* Salary */}
        {isDisclosed && (
          <div className="hero-salary-big">
            <div className="hero-salary-label">Salary</div>
            <div className="hero-salary-amount">{job.salary} /mo</div>
          </div>
        )}

        {/* Description */}
        {job.desc && <div className="hero-description">{job.desc}</div>}

        {/* Meta grid */}
        <div className="hero-meta-grid">
          <div className="hero-meta-item">
            <div className="hero-meta-label">Location</div>
            <div className="hero-meta-value">{job.location}</div>
          </div>
          <div className="hero-meta-item">
            <div className="hero-meta-label">Type</div>
            <div className="hero-meta-value">
              {typeParts[0] || "Full-time"}
            </div>
          </div>
          <div className="hero-meta-item">
            <div className="hero-meta-label">Degree</div>
            <div className="hero-meta-value">
              {job.education || "Not Required"}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className="hero-right">
        {/* Score */}
        <div className="hero-score-area">
          <div className="hero-score">{job.match}</div>
          <div className="hero-score-label">Match Score</div>
        </div>

        {/* Skills */}
        {displaySkills.length > 0 ? (
          <div className="hero-skills">
            <div className="hero-skills-header">
              Skills Match ({matchedCount}/{required.length})
            </div>
            {displaySkills.map((skill) => {
              const isMatched = matchedSet.has(skill.toLowerCase());
              return (
                <div className="hero-skill" key={skill}>
                  <span className="hero-skill-name">{skill}</span>
                  <span className={`hero-skill-percent${isMatched ? " matched" : ""}`}>
                    {isMatched ? "\u2713" : "\u2014"}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="hero-skills">
            <div className="hero-skills-header">Skills</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "rgba(255,255,255,.35)" }}>
              No skill data available
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="hero-actions">
          <a
            className="hero-btn primary"
            href={job.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            Apply &#8594;
          </a>
          <button
            className="hero-btn"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave?.();
            }}
            aria-label={isSaved ? "Unsave job" : "Save job"}
          >
            {isSaved ? "Saved \u2605" : "Save \u2606"}
          </button>
        </div>
      </div>
    </div>
  );
}
