"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { TopMatchesPreview } from "./TopMatchesPreview";
import { QuickActions } from "./QuickActions";
import { ProfileCompletion } from "./ProfileCompletion";
import { SkillsRecommendationBanner } from "./SkillsRecommendationBanner";
import type { Job } from "@/lib/types";
import type { SkillROI } from "@/lib/types/learn";
import type { ProfileGap } from "@/lib/profile";

interface DashboardClientProps {
  topJob: Job | null;
  otherJobs: Job[];
  totalMatches: number;
  lastUpdated: string | null;
  profileComplete: boolean;
  profileCompletion: number;
  profileGaps: ProfileGap[];
  hasAssessments: boolean;
  topSkills: SkillROI[];
  highMatchJobCount: number;
  youtubeMaps?: { clusters: Record<string, { url: string; channel: string }>; skills: Record<string, { url: string; channel: string }> };
}

export function DashboardClient({
  topJob,
  otherJobs,
  totalMatches,
  lastUpdated,
  profileComplete,
  profileCompletion,
  profileGaps,
  hasAssessments,
  topSkills,
  highMatchJobCount,
  youtubeMaps,
}: DashboardClientProps) {
  const router = useRouter();

  const handleJobSelect = useCallback(
    (job: Job) => {
      router.push(`/jobs/${job.id}`);
    },
    [router],
  );

  return (
    <>
      {/* Skills Recommendation Banner */}
      {topSkills.length > 0 && (
        <SkillsRecommendationBanner topSkills={topSkills} animationDelay={0} youtubeMaps={youtubeMaps} />
      )}

      {/* Top Matches */}
      <div>
        <TopMatchesPreview
          topJob={topJob}
          otherJobs={otherJobs}
          totalMatches={totalMatches}
          lastUpdated={lastUpdated}
          onJobSelect={handleJobSelect}
        />
      </div>

      {/* Quick Actions */}
      <div style={{ marginTop: 20 }}>
        <QuickActions
          profileComplete={profileComplete}
          hasAssessments={hasAssessments}
          animationDelay={0.42}
        />
      </div>

      {/* Profile Completion (only if < 100%) */}
      {!profileComplete && (
        <div style={{ marginTop: 20 }}>
          <ProfileCompletion
            percentage={profileCompletion}
            matchesUnlocked={highMatchJobCount}
            profileComplete={profileComplete}
            gaps={profileGaps}
          />
        </div>
      )}
    </>
  );
}
