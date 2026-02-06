import type { JobDetail } from "@/lib/jobs";

interface JobDetailHeroProps {
  job: JobDetail;
}

export function JobDetailHero({ job }: JobDetailHeroProps) {
  const postedDate = new Date(job.postedAt).toLocaleDateString("en-PH", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const tags: string[] = [];
  if (job.type) job.type.split(" \u00b7 ").forEach((t) => tags.push(t.trim()));
  if (job.experienceLevel) tags.push(job.experienceLevel);

  return (
    <div className="jd-hero">
      <div className="jd-hero-top">
        <div className="jd-hero-left">
          <div
            className="jd-logo"
            style={{ background: job.logoUrl ? "transparent" : `${job.logoBg}22` }}
          >
            {job.logoUrl ? (
              <img src={job.logoUrl} alt={job.company} />
            ) : (
              <span style={{ color: "#F5F5F0" }}>{job.logo}</span>
            )}
          </div>
          <div className="jd-company-info">
            <div className="jd-company-name">
              {job.company}
              {job.verified && (
                <span style={{ color: "#6EE7B7", marginLeft: 6, fontSize: 14 }}>
                  &#10003;
                </span>
              )}
            </div>
            <div className="jd-company-meta">
              {job.location}
              <span className="dot" />
              {job.source}
            </div>
          </div>
        </div>
      </div>

      <div className="jd-title">{job.role}</div>

      <div className="jd-tags-row">
        <span className="jd-tag jd-tag-match">{job.match}% Match</span>
        {job.source && (
          <span className="jd-tag jd-tag-source">{job.source}</span>
        )}
        {tags.map((tag) => (
          <span key={tag} className="jd-tag">
            {tag}
          </span>
        ))}
      </div>

      <div className="jd-salary-row">
        <div className="jd-salary">
          {job.salary}
          {job.salary !== "Salary not disclosed" && (
            <span>
              Per month{job.salaryIsEstimate ? " (estimated)" : ""}
            </span>
          )}
        </div>
        <div className="jd-posted">
          Posted {postedDate}
          <br />
          {job.applicants} applicants
        </div>
      </div>
    </div>
  );
}
