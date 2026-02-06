"use client";

import { useState, useCallback } from "react";
import { TopMatchesPreview } from "./TopMatchesPreview";
import { QuickActions } from "./QuickActions";
import { ProfileCompletion } from "./ProfileCompletion";
import { SkillsRecommendationBanner } from "./SkillsRecommendationBanner";
import { JobDetailDrawer } from "./JobDetailDrawer";
import { getJobDetailForDrawer } from "@/lib/actions/job-detail";
import type { Job } from "@/lib/types";
import type { JobDetail } from "@/lib/jobs";
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
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [jobDetail, setJobDetail] = useState<JobDetail | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDrawerClosing, setIsDrawerClosing] = useState(false);

  const handleJobSelect = useCallback(async (job: Job) => {
    setSelectedJob(job);
    setJobDetail(null);
    setIsDrawerOpen(true);
    setIsDrawerClosing(false);

    // Fetch full job details
    const detail = await getJobDetailForDrawer(job.id);
    setJobDetail(detail);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setIsDrawerClosing(true);
    // Wait for animation to complete before fully closing
    setTimeout(() => {
      setIsDrawerOpen(false);
      setIsDrawerClosing(false);
      setSelectedJob(null);
      setJobDetail(null);
    }, 250);
  }, []);

  return (
    <>
      {/* Skills Recommendation Banner */}
      {topSkills.length > 0 && (
        <SkillsRecommendationBanner topSkills={topSkills} animationDelay={0} youtubeMaps={youtubeMaps} />
      )}

      {/* Top Matches */}
      <div data-tour="top-matches">
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
        <div data-tour="profile-completion" style={{ marginTop: 20 }}>
          <ProfileCompletion
            percentage={profileCompletion}
            matchesUnlocked={highMatchJobCount}
            profileComplete={profileComplete}
            gaps={profileGaps}
          />
        </div>
      )}

      {/* Job Detail Drawer */}
      <JobDetailDrawer
        job={selectedJob}
        jobDetail={jobDetail}
        isOpen={isDrawerOpen}
        isClosing={isDrawerClosing}
        onClose={handleCloseDrawer}
      />
    </>
  );
}
