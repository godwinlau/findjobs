import { getTopMatchedJobs } from "@/lib/jobs";
import { TopMatchesPreview } from "@/components/dashboard";
import type { Profile } from "@/lib/types";

/** Async server component — streams in via Suspense */
export async function TopMatchesStream({ profile }: { profile: Profile | null }) {
  const matchedResult = await getTopMatchedJobs({ profile, limit: 5 });
  const topJob = matchedResult.jobs[0] ?? null;
  const otherJobs = matchedResult.jobs.slice(1);
  const totalMatches = matchedResult.totalMatches;

  return (
    <TopMatchesPreview
      topJob={topJob}
      otherJobs={otherJobs}
      totalMatches={totalMatches}
    />
  );
}
