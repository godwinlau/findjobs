import { getSimilarJobs } from "@/lib/jobs";
import { SimilarJobCard } from "./SimilarJobCard";
import type { Profile } from "@/lib/types";

interface SimilarJobsStreamProps {
  jobId: string;
  skills: string[];
  profile: Profile | null;
}

/** Async server component — streams in via Suspense */
export async function SimilarJobsStream({ jobId, skills, profile }: SimilarJobsStreamProps) {
  const similarJobs = await getSimilarJobs(jobId, skills, profile, 3);

  if (similarJobs.length === 0) return null;

  return (
    <div className="jd-sidebar-similar">
      <div className="jd-ss-title">Similar Jobs</div>
      {similarJobs.map((sj) => (
        <SimilarJobCard key={sj.id} job={sj} />
      ))}
    </div>
  );
}
