import Link from "next/link";
import type { RecentlyViewedJob } from "@/lib/types/home";

interface RecentlyViewedSidebarProps {
  jobs: RecentlyViewedJob[];
}

export function RecentlyViewedSidebar({ jobs }: RecentlyViewedSidebarProps) {
  if (jobs.length === 0) return null;

  return (
    <div className="sidebar-card">
      <div className="sb-title">Recently Viewed</div>
      <div className="rv-list">
        {jobs.map((job, i) => (
          <Link
            key={`${job.jobId}-${i}`}
            href={`/jobs/${job.jobId}`}
            className="rv-item"
            style={{ textDecoration: "none", color: "inherit", display: "block" }}
          >
            <div className="rv-title">{job.title}</div>
            <div className="rv-company">{job.company} {"\u00B7"} {job.viewedAt}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
