"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { colors } from "@/lib/constants/colors";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { toggleJobActive } from "@/app/employer/actions";
import type { EmployerJobRow } from "@/lib/types";

interface PostedJobsListProps {
  jobs: EmployerJobRow[];
}

function formatSalary(min: number | null, max: number | null): string {
  if (!min && !max) return "Not specified";
  const fmt = (n: number) => `₱${(n / 1000).toFixed(0)}K`;
  if (min && max) return `${fmt(min)} - ${fmt(max)}`;
  if (min) return `From ${fmt(min)}`;
  return `Up to ${fmt(max!)}`;
}

export function PostedJobsList({ jobs }: PostedJobsListProps) {
  const router = useRouter();
  const [togglingId, setTogglingId] = useState<string | null>(null);

  async function handleToggle(jobId: string, currentActive: boolean) {
    setTogglingId(jobId);
    await toggleJobActive(jobId, !currentActive);
    setTogglingId(null);
    router.refresh();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {jobs.map((job) => (
        <Card key={job.id} padding="md">
          <div
            className="responsive-row posted-jobs-gap"
            style={{
              justifyContent: "space-between",
            }}
          >
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 6,
                  flexWrap: "wrap",
                }}
              >
                <span style={{ fontSize: 15, fontWeight: 600, color: colors.text }}>
                  {job.title}
                </span>
                <Badge variant={job.is_active ? "primary" : "muted"} size="sm">
                  {job.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div style={{ fontSize: 13, color: colors.textSec, marginBottom: 4 }}>
                {job.company_name}
                {job.location_city && ` · ${job.location_city}`}
              </div>
              <div className="posted-jobs-stats-gap" style={{ display: "flex", fontSize: 12, color: colors.textMuted, flexWrap: "wrap" }}>
                <span>{formatSalary(job.salary_min, job.salary_max)}</span>
                <span>{job.view_count} views</span>
                <span>{job.applicant_count} applicants</span>
              </div>
            </div>
            <div className="posted-jobs-actions" style={{ display: "flex", gap: 8 }}>
              <Link href={`/employer/edit/${job.id}`} style={{ textDecoration: "none" }}>
                <Button variant="outline" size="sm">
                  Edit
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleToggle(job.id, job.is_active)}
                disabled={togglingId === job.id}
              >
                {togglingId === job.id
                  ? "..."
                  : job.is_active
                    ? "Deactivate"
                    : "Reactivate"}
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
