"use client";

import Link from "next/link";
import { useState } from "react";
import type { Job } from "@/lib/types";

interface SimilarJobCardProps {
  job: Job;
}

export function SimilarJobCard({ job }: SimilarJobCardProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <Link href={`/jobs/${job.id}`} className="jd-sim-card">
      <div className="jd-sim-top">
        <div
          className="jd-sim-logo"
          style={{ background: job.logoUrl && !imgError ? "transparent" : job.logoBg }}
        >
          {job.logoUrl && !imgError ? (
            <img
              src={job.logoUrl}
              alt={job.company}
              onError={() => setImgError(true)}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <span style={{ color: "#fff" }}>{job.logo}</span>
          )}
        </div>
        <span className="jd-sim-company">
          {job.company} &middot; {job.location}
        </span>
      </div>
      <div className="jd-sim-title">{job.role}</div>
      <div className="jd-sim-bottom">
        <span className="jd-sim-salary">{job.salary}</span>
        <span className="jd-sim-match">{job.match}%</span>
      </div>
    </Link>
  );
}
