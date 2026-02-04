import { notFound } from "next/navigation";
import Link from "next/link";
import { colors } from "@/lib/constants/colors";
import { fetchJobRow, buildJobDetail } from "@/lib/jobs";
import { CompanyLogo, Badge, MatchIndicator } from "@/components/ui";
import { ResponsiveContainer } from "@/components/layout/ResponsiveContainer";
import { JobDetailActions } from "./JobDetailActions";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/actions/activity";

export const dynamic = "force-dynamic";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

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

  const postedDate = new Date(job.postedAt).toLocaleDateString("en-PH", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const expiresDate = job.expiresAt
    ? new Date(job.expiresAt).toLocaleDateString("en-PH", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: colors.bg,
        color: colors.text,
      }}
    >
      <ResponsiveContainer maxWidth={720}>
        {/* Back link */}
        <Link
          href="/"
          style={{
            fontSize: 13,
            color: colors.textMuted,
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 24,
          }}
        >
          ← Back to jobs
        </Link>

        {/* Header card */}
        <div
          className="job-detail-header-card"
          style={{
            background: colors.surface,
            borderRadius: 14,
            border: `1px solid ${colors.border}`,
            padding: "28px 28px 24px",
            marginBottom: 20,
          }}
        >
          <div
            className="job-detail-header-flex"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 20,
            }}
          >
            <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
              <CompanyLogo
                letter={job.logo}
                logoUrl={job.logoUrl}
                bgColor={job.logoBg}
                textColor={job.logoColor}
                size="lg"
              />
              <div>
                <div style={{ fontSize: 14, color: colors.textSec, fontWeight: 600 }}>
                  {job.company}
                  {job.verified && (
                    <span style={{ color: colors.success, marginLeft: 4 }}>✓</span>
                  )}
                </div>
                <h1
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: colors.text,
                    marginTop: 4,
                    letterSpacing: "-0.03em",
                  }}
                >
                  {job.role}
                </h1>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginTop: 8,
                  }}
                >
                  <span
                    style={{ fontSize: 16, fontWeight: 700, color: colors.success }}
                  >
                    {job.salary}
                    {job.salary !== "Salary not disclosed" && (
                      <span
                        style={{
                          fontWeight: 400,
                          fontSize: 12,
                          color: colors.textMuted,
                        }}
                      >
                        /mo
                      </span>
                    )}
                  </span>
                  {job.salaryIsEstimate && (
                    <span style={{ fontSize: 11, color: colors.textMuted }}>
                      (estimated)
                    </span>
                  )}
                </div>
              </div>
            </div>
            <MatchIndicator percentage={job.match} />
          </div>

          {/* Actions */}
          <JobDetailActions jobId={job.id} applyUrl={job.applyUrl} />
        </div>

        {/* Meta row */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            marginBottom: 20,
          }}
        >
          <Badge variant="muted" size="md">
            {job.location}
          </Badge>
          <Badge variant="muted" size="md">
            {job.type}
          </Badge>
          {job.experienceLevel && (
            <Badge variant="muted" size="md">
              {job.experienceLevel}
            </Badge>
          )}
          <Badge variant="muted" size="md">
            Posted {postedDate}
          </Badge>
          {expiresDate && (
            <Badge variant="warning" size="md">
              Deadline: {expiresDate}
            </Badge>
          )}
        </div>

        {/* Stats row */}
        <div
          style={{
            display: "flex",
            gap: 24,
            marginBottom: 24,
            fontSize: 12,
            color: colors.textMuted,
          }}
        >
          <span>{job.applicants} applicants</span>
          <span>{job.viewCount} views</span>
        </div>

        {/* Full description */}
        <div
          className="job-detail-description-card"
          style={{
            background: colors.surface,
            borderRadius: 12,
            border: `1px solid ${colors.border}`,
            padding: "24px 28px",
            marginBottom: 20,
          }}
        >
          <h2
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: colors.text,
              marginBottom: 14,
            }}
          >
            Job Description
          </h2>
          <div
            className="job-description"
            style={{
              fontSize: 13,
              color: colors.textSec,
              lineHeight: 1.8,
            }}
            dangerouslySetInnerHTML={{ __html: job.descriptionFull }}
          />
        </div>

        {/* Skills */}
        {job.skills.length > 0 && (
          <div
            className="job-detail-skills-card"
            style={{
              background: colors.surface,
              borderRadius: 12,
              border: `1px solid ${colors.border}`,
              padding: "20px 28px",
              marginBottom: 20,
            }}
          >
            <h2
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: colors.text,
                marginBottom: 12,
              }}
            >
              Required Skills
            </h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {job.skills.map((skill) => (
                <Badge key={skill} variant="primary" size="md">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </ResponsiveContainer>
    </div>
  );
}
