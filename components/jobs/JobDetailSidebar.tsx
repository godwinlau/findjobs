import type { JobDetail } from "@/lib/jobs";
import type { ReactNode } from "react";

interface JobDetailSidebarProps {
  job: JobDetail;
  /** Slot for similar jobs section — can be a Suspense boundary */
  similarJobsSlot?: ReactNode;
}

export function JobDetailSidebar({ job, similarJobsSlot }: JobDetailSidebarProps) {
  const expiresDate = job.expiresAt
    ? new Date(job.expiresAt).toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div className="jd-sidebar">
      {/* Company card */}
      <div className="jd-sidebar-company">
        <div className="jd-sc-header">
          <div
            className="jd-sc-logo"
            style={{ background: job.logoUrl ? "transparent" : job.logoBg }}
          >
            {job.logoUrl ? (
              <img src={job.logoUrl} alt={job.company} />
            ) : (
              <span style={{ color: "#fff" }}>{job.logo}</span>
            )}
          </div>
          <div className="jd-sc-info">
            <div className="jd-sc-name">{job.company}</div>
            <div className="jd-sc-type">{job.source}</div>
          </div>
        </div>

        <div className="jd-sc-stats">
          <div className="jd-sc-stat">
            <div className="jd-sc-stat-val">{job.applicants}</div>
            <div className="jd-sc-stat-label">Applicants</div>
          </div>
          <div className="jd-sc-stat">
            <div className="jd-sc-stat-val">{job.viewCount}</div>
            <div className="jd-sc-stat-label">Views</div>
          </div>
          <div className="jd-sc-stat">
            <div className="jd-sc-stat-val">{job.match}%</div>
            <div className="jd-sc-stat-label">Match</div>
          </div>
          <div className="jd-sc-stat">
            <div className="jd-sc-stat-val">{job.posted}</div>
            <div className="jd-sc-stat-label">Posted</div>
          </div>
        </div>
      </div>

      {/* Quick facts */}
      <div className="jd-sidebar-facts">
        <div className="jd-sf-title">Quick Facts</div>
        <div className="jd-sf-list">
          {job.experienceLevel && (
            <div className="jd-sf-item">
              <span className="jd-sf-key">Seniority</span>
              <span className="jd-sf-val">{job.experienceLevel}</span>
            </div>
          )}
          <div className="jd-sf-item">
            <span className="jd-sf-key">Type</span>
            <span className="jd-sf-val">{job.type}</span>
          </div>
          <div className="jd-sf-item">
            <span className="jd-sf-key">Location</span>
            <span className="jd-sf-val">{job.location}</span>
          </div>
          {job.education && (
            <div className="jd-sf-item">
              <span className="jd-sf-key">Education</span>
              <span className="jd-sf-val">{job.education}</span>
            </div>
          )}
          {expiresDate && (
            <div className="jd-sf-item">
              <span className="jd-sf-key">Deadline</span>
              <span className="jd-sf-val">{expiresDate}</span>
            </div>
          )}
        </div>
      </div>

      {/* Similar jobs — streamed in via Suspense */}
      {similarJobsSlot}
    </div>
  );
}
