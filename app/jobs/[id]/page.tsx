import "@/app/styles/job-detail-page.css";
import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchJobRow, buildJobDetail, getSimilarJobs } from "@/lib/jobs";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/actions/activity";
import { Navbar } from "@/components/layout/Navbar";
import {
  JobDetailHero,
  JobDetailSection,
  JobDetailSidebar,
  JobDetailApplyBar,
} from "@/components/jobs";

export const dynamic = "force-dynamic";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Run job fetch + profile fetch in parallel
  const [row, profileResult] = await Promise.all([
    fetchJobRow(id),
    user
      ? supabase.from("profiles").select("*").eq("id", user.id).single()
      : Promise.resolve({ data: null }),
  ]);

  if (!row) notFound();

  // Fire-and-forget: log job view activity
  if (user) {
    logActivity({ activityType: "job_view", targetId: id });
  }

  const profile = profileResult?.data ?? null;
  const job = buildJobDetail(row, profile);

  // Fetch similar jobs in parallel (won't block render significantly)
  const similarJobs = await getSimilarJobs(id, job.skills, profile, 3);

  // Navbar props
  const fullName = profile?.full_name ?? undefined;

  return (
    <div className="jd-debug-test" style={{ minHeight: "100vh", background: "var(--hb-bg)", color: "var(--hb-text)" }}>
      <Navbar fullName={fullName} />

      {/* Breadcrumb */}
      <div className="jd-breadcrumb-bar">
        <div className="jd-breadcrumb-inner">
          <Link href="/explore" className="jd-bc-link">
            Jobs
          </Link>
          <span className="jd-bc-sep">/</span>
          <span className="jd-bc-current">{job.role}</span>
        </div>
      </div>

      {/* 2-column layout */}
      <div className="jd-page">
        {/* Left — Detail */}
        <div className="jd-detail">
          <JobDetailHero job={job} />

          {/* Description */}
          <JobDetailSection label="About the Role">
            <div
              className="jd-description"
              dangerouslySetInnerHTML={{ __html: job.descriptionFull }}
            />
          </JobDetailSection>

          {/* Skills */}
          {job.skills.length > 0 && (
            <JobDetailSection label="Skills & Tools">
              <div className="jd-stack-row">
                {job.skills.map((skill) => {
                  const isMatched =
                    profile?.skills &&
                    profile.skills.some(
                      (s: string) =>
                        s.toLowerCase() === skill.toLowerCase(),
                    );
                  return (
                    <span
                      key={skill}
                      className={`jd-stack-tag${isMatched ? " matched" : ""}`}
                    >
                      {skill}
                    </span>
                  );
                })}
              </div>
            </JobDetailSection>
          )}

          {/* Apply bar */}
          <JobDetailApplyBar
            jobId={job.id}
            applyUrl={job.applyUrl}
            applicants={job.applicants}
            closing={job.closing}
            matchPercent={job.match}
          />
        </div>

        {/* Right — Sidebar */}
        <JobDetailSidebar job={job} similarJobs={similarJobs} />
      </div>
    </div>
  );
}
