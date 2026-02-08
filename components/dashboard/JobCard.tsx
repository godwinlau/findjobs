"use client";

import { useState } from "react";
import { Job } from "@/lib/types";
import { useLogoDominantColor } from "@/lib/hooks/useLogoDominantColor";

interface JobCardProps {
  job: Job;
  animationDelay?: number;
  isSaved?: boolean;
  onToggleSave?: () => void;
  onViewDetails?: (job: Job) => void;
}

export function JobCard({
  job,
  animationDelay = 0,
  isSaved = false,
  onToggleSave,
  onViewDetails,
}: JobCardProps) {
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
  const displaySkills = required.slice(0, 4);
  const showSkillsBreakdown = job.match >= 50;

  // Parse job type parts
  const typeParts = job.type ? job.type.split(" · ") : [];

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("a") || target.closest("button")) return;
    onViewDetails?.(job);
  };

  return (
    <article
      className="job-card"
      onClick={handleCardClick}
      style={{
        animation: `fadeIn 0.4s cubic-bezier(.22,1,.36,1) ${animationDelay}s both`,
      }}
    >
      {/* Score badge */}
      <div className="score-badge">
        <div className="score-num">{job.match}</div>
        <div className="score-label">Match</div>
      </div>

      {/* Header */}
      <div className="job-header">
        <div
          className="job-logo"
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
        <div className="job-header-info">
          <div className="job-role">{job.role}</div>
          <div className="job-company">
            <span>{job.company}</span>
            {job.verified && <span className="job-verified">&#10003;</span>}
          </div>
          <span className="job-source">via {job.source}</span>
        </div>
      </div>

      {/* Body */}
      <div className="job-body">
        {/* Salary banner */}
        {isDisclosed && (
          <div className="job-salary-top">
            <div className="job-salary-label">Salary</div>
            <div className="job-salary-amount">{job.salary} /mo</div>
          </div>
        )}

        {/* Description */}
        {job.desc && <div className="job-description">{job.desc}</div>}

        {/* Info compact row */}
        <div className="job-info-compact">
          <div className="job-info-item">
            <span className="job-info-icon">&#x1F4CD;</span>
            <span className="job-info-value">{job.location}</span>
          </div>
          {typeParts.map((part) => (
            <div className="job-info-item" key={part}>
              <span className="job-info-icon">&#x1F4BC;</span>
              <span className="job-info-value">{part.trim()}</span>
            </div>
          ))}
          {job.education && (
            <div className="job-info-item">
              <span className="job-info-icon">&#x1F393;</span>
              <span className="job-info-value">{job.education}</span>
            </div>
          )}
          <div className="job-info-item">
            <span className="job-info-icon">&#x1F4C5;</span>
            <span className="job-info-value">{job.posted}</span>
          </div>
        </div>

        {/* Skills breakdown */}
        {showSkillsBreakdown && matchedCount > 0 && displaySkills.length > 0 && (
          <div className="job-skills">
            <div className="job-skills-header">
              <span>Skills Match</span>
              <span className="job-skills-count">
                {matchedCount}/{required.length}
              </span>
            </div>
            <div className="job-skills-list">
              {displaySkills.map((skill) => {
                const isMatched = matchedSet.has(skill.toLowerCase());
                return (
                  <div className="job-skill" key={skill}>
                    <span className="job-skill-name">{skill}</span>
                    <div className="job-skill-bar">
                      <div
                        className={`job-skill-fill${isMatched ? " matched" : ""}`}
                        style={{ width: isMatched ? "100%" : "0%" }}
                      />
                    </div>
                    <span
                      className={`job-skill-percent${isMatched ? " matched" : ""}`}
                    >
                      {isMatched ? "\u2713" : "\u2014"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="job-footer">
        <a
          className="job-btn primary"
          href={job.applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
        >
          <span>&#8594;</span> Apply
        </a>
        <button
          className="job-btn"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave?.();
          }}
          aria-label={isSaved ? "Unsave job" : "Save job"}
        >
          {isSaved ? "\u2605" : "\u2606"} Save
        </button>
      </div>
    </article>
  );
}
