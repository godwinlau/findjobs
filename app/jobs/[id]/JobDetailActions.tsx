"use client";

import { Heart } from "@phosphor-icons/react";
import { colors } from "@/lib/constants/colors";
import { useSavedJobs } from "@/lib/hooks/useSavedJobs";
import { logActivity } from "@/lib/actions/activity";

interface JobDetailActionsProps {
  jobId: string;
  applyUrl: string;
}

export function JobDetailActions({ jobId, applyUrl }: JobDetailActionsProps) {
  const { isSaved, toggleSave } = useSavedJobs();
  const saved = isSaved(jobId);

  return (
    <div style={{ display: "flex", gap: 10 }}>
      <a
        href={applyUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => logActivity({ activityType: "job_apply", targetId: jobId })}
        style={{
          padding: "12px 32px",
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 600,
          cursor: "pointer",
          whiteSpace: "nowrap",
          background: colors.primary,
          color: colors.inv,
          border: "none",
          boxShadow: `0 2px 8px ${colors.primary}20`,
          textDecoration: "none",
          display: "inline-block",
        }}
      >
        Apply now →
      </a>
      <button
        onClick={() => {
          if (!saved) {
            logActivity({ activityType: "job_save", targetId: jobId });
          }
          toggleSave(jobId);
        }}
        style={{
          width: 44,
          height: 44,
          borderRadius: 10,
          border: `1px solid ${saved ? colors.live : colors.border}`,
          background: saved ? "#FEF2F2" : colors.surface,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "all 0.15s ease",
        }}
      >
        <Heart
          size={22}
          weight={saved ? "fill" : "regular"}
          color={saved ? colors.live : colors.textMuted}
        />
      </button>
    </div>
  );
}
