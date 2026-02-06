"use client";

import { BookmarkSimple } from "@phosphor-icons/react";
import { useSavedJobs } from "@/lib/hooks/useSavedJobs";
import { logActivity } from "@/lib/actions/activity";

interface JobDetailApplyBarProps {
  jobId: string;
  applyUrl: string;
  applicants: number;
  closing: string | null;
  matchPercent: number;
}

export function JobDetailApplyBar({
  jobId,
  applyUrl,
  applicants,
  closing,
  matchPercent,
}: JobDetailApplyBarProps) {
  const { isSaved, toggleSave } = useSavedJobs();
  const saved = isSaved(jobId);

  const subParts: string[] = [];
  if (applicants > 0) subParts.push(`${applicants} applicants`);
  if (closing) subParts.push(closing);

  return (
    <div className="jd-apply-section">
      <div className="jd-apply-info">
        <div className="jd-apply-info-title">Ready to apply?</div>
        {subParts.length > 0 && (
          <div className="jd-apply-info-sub">{subParts.join(" \u00b7 ")}</div>
        )}
      </div>
      <div className="jd-apply-actions">
        <button
          className={`jd-apply-save-btn${saved ? " saved" : ""}`}
          onClick={() => {
            if (!saved) {
              logActivity({ activityType: "job_save", targetId: jobId });
            }
            toggleSave(jobId);
          }}
          aria-label={saved ? "Unsave job" : "Save job"}
        >
          <BookmarkSimple
            size={20}
            weight={saved ? "fill" : "regular"}
          />
        </button>
        <a
          href={applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="jd-apply-cta"
          onClick={() =>
            logActivity({
              activityType: "job_apply",
              targetId: jobId,
              metadata: { matchPercent },
            })
          }
        >
          Apply Now &rarr;
        </a>
      </div>
    </div>
  );
}
