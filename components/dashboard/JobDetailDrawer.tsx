"use client";

import { useEffect, useCallback } from "react";
import { X, MapPin, Briefcase, Users, Eye, CalendarBlank, Clock, CheckCircle } from "@phosphor-icons/react";
import { CompanyLogo, MatchIndicator } from "@/components/ui";
import { JobDetailActions } from "@/app/jobs/[id]/JobDetailActions";
import type { Job } from "@/lib/types";
import type { JobDetail } from "@/lib/jobs";

interface JobDetailDrawerProps {
  job: Job | null;
  jobDetail: JobDetail | null;
  isOpen: boolean;
  isClosing: boolean;
  onClose: () => void;
}

export function JobDetailDrawer({
  job,
  jobDetail,
  isOpen,
  isClosing,
  onClose,
}: JobDetailDrawerProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    },
    [isOpen, onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen && !isClosing) return null;

  const postedDate = jobDetail?.postedAt
    ? new Date(jobDetail.postedAt).toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const expiresDate = jobDetail?.expiresAt
    ? new Date(jobDetail.expiresAt).toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const hasBasicInfo = job !== null;
  const isDisclosed = job?.salary !== "Salary not disclosed";
  const matchColor: string = job && job.match >= 80 ? "#6EE7B7" : job && job.match >= 60 ? "#FBBF24" : "#888";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        justifyContent: "flex-end",
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(10, 10, 10, 0.6)",
          animation: isClosing
            ? "fadeOutBackdrop 0.2s ease forwards"
            : "fadeInBackdrop 0.25s ease forwards",
        }}
      />

      {/* Drawer panel */}
      <div
        className="job-drawer"
        style={{
          position: "relative",
          width: 520,
          maxWidth: "100%",
          height: "100%",
          background: "#F5F5F0",
          borderLeft: "3px solid #0A0A0A",
          boxShadow: "-8px 0 0 #0A0A0A",
          display: "flex",
          flexDirection: "column",
          animation: isClosing
            ? "slideOutRight 0.2s cubic-bezier(0.4, 0, 1, 1) forwards"
            : "slideInRight 0.25s cubic-bezier(0, 0, 0.2, 1) forwards",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 24px",
            borderBottom: "2px solid #0A0A0A",
            background: "#0A0A0A",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              fontFamily: "var(--font-mono)",
              textTransform: "uppercase" as const,
              letterSpacing: "0.06em",
              color: "#F5F5F0",
            }}
          >
            Job Details
          </span>
          <button
            onClick={onClose}
            style={{
              width: 36,
              height: 36,
              border: "2px solid rgba(255,255,255,0.2)",
              background: "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.1)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
            }}
          >
            <X size={18} color="#F5F5F0" />
          </button>
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "20px 24px",
          }}
        >
          {hasBasicInfo ? (
            <>
              {/* Company and role header */}
              <div
                style={{
                  position: "relative",
                  background: "#F5F5F0",
                  border: "2px solid #0A0A0A",
                  padding: "24px",
                  marginBottom: 16,
                  overflow: "hidden",
                }}
              >
                {/* Match accent line */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: 4,
                    height: "100%",
                    background: matchColor,
                  }}
                />

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 20,
                  }}
                >
                  <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flex: 1, minWidth: 0 }}>
                    <CompanyLogo
                      letter={job.logo}
                      logoUrl={job.logoUrl}
                      bgColor={job.logoBg}
                      textColor={job.logoColor}
                      size="lg"
                    />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 4,
                        }}
                      >
                        <span style={{ fontSize: 12, color: "#888", fontWeight: 700, fontFamily: "var(--font-mono)", textTransform: "uppercase" as const }}>
                          {job.company}
                        </span>
                        {job.verified && (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 3,
                              fontSize: 9,
                              fontWeight: 700,
                              fontFamily: "var(--font-mono)",
                              textTransform: "uppercase" as const,
                              color: "#0A0A0A",
                              background: "#FBBF24",
                              padding: "2px 6px",
                            }}
                          >
                            <CheckCircle size={10} weight="fill" />
                            Verified
                          </span>
                        )}
                      </div>
                      <h2
                        style={{
                          fontSize: 20,
                          fontWeight: 800,
                          color: "#0A0A0A",
                          margin: 0,
                          letterSpacing: "-0.03em",
                          lineHeight: 1.2,
                        }}
                      >
                        {job.role}
                      </h2>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginTop: 10,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 17,
                            fontWeight: 800,
                            fontFamily: "var(--font-mono)",
                            color: isDisclosed ? "#0A0A0A" : "#888",
                          }}
                        >
                          {job.salary}
                          {isDisclosed && (
                            <span style={{ fontWeight: 500, fontSize: 11, color: "#888", marginLeft: 2 }}>/mo</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                  <MatchIndicator percentage={job.match} />
                </div>

                {/* Actions */}
                <JobDetailActions
                  jobId={job.id}
                  applyUrl={job.applyUrl}
                  matchPercent={job.match}
                />
              </div>

              {/* Meta info pills */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                  marginBottom: 16,
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 12px",
                    fontSize: 11,
                    fontWeight: 700,
                    fontFamily: "var(--font-mono)",
                    textTransform: "uppercase" as const,
                    background: "transparent",
                    color: "#0A0A0A",
                    border: "1.5px solid #0A0A0A",
                  }}
                >
                  <MapPin size={14} weight="fill" />
                  {job.location}
                </span>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 12px",
                    fontSize: 11,
                    fontWeight: 700,
                    fontFamily: "var(--font-mono)",
                    textTransform: "uppercase" as const,
                    background: "transparent",
                    color: "#0A0A0A",
                    border: "1.5px solid #0A0A0A",
                  }}
                >
                  <Briefcase size={14} weight="fill" />
                  {job.type}
                </span>
                {jobDetail?.experienceLevel && (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "8px 12px",
                      fontSize: 11,
                      fontWeight: 700,
                      fontFamily: "var(--font-mono)",
                      textTransform: "uppercase" as const,
                      background: "transparent",
                      color: "#0A0A0A",
                      border: "1.5px solid #0A0A0A",
                    }}
                  >
                    {jobDetail.experienceLevel}
                  </span>
                )}
              </div>

              {/* Stats row */}
              <div
                style={{
                  display: "flex",
                  gap: 16,
                  marginBottom: 20,
                  padding: "12px 16px",
                  background: "#F5F5F0",
                  border: "2px solid #0A0A0A",
                }}
              >
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontFamily: "var(--font-mono)", textTransform: "uppercase" as const, color: "#888" }}>
                  <Users size={14} weight="fill" />
                  {job.applicants} applicants
                </span>
                {jobDetail && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontFamily: "var(--font-mono)", textTransform: "uppercase" as const, color: "#888" }}>
                    <Eye size={14} weight="fill" />
                    {jobDetail.viewCount} views
                  </span>
                )}
                {postedDate && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontFamily: "var(--font-mono)", textTransform: "uppercase" as const, color: "#888" }}>
                    <CalendarBlank size={14} weight="fill" />
                    {postedDate}
                  </span>
                )}
                {expiresDate && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, fontFamily: "var(--font-mono)", textTransform: "uppercase" as const, color: "#FBBF24" }}>
                    <Clock size={14} weight="fill" />
                    Closes {expiresDate}
                  </span>
                )}
              </div>

              {/* Description */}
              <div
                style={{
                  background: "#F5F5F0",
                  border: "2px solid #0A0A0A",
                  padding: "20px 24px",
                  marginBottom: 16,
                }}
              >
                <h3
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    fontFamily: "var(--font-mono)",
                    textTransform: "uppercase" as const,
                    letterSpacing: "0.06em",
                    color: "#888",
                    marginBottom: 14,
                  }}
                >
                  Job Description
                </h3>
                {jobDetail ? (
                  <div
                    className="job-description"
                    style={{
                      fontSize: 13,
                      color: "#0A0A0A",
                      lineHeight: 1.8,
                    }}
                    dangerouslySetInnerHTML={{ __html: jobDetail.descriptionFull }}
                  />
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[100, 95, 88, 92, 80].map((w, i) => (
                      <div
                        key={i}
                        style={{
                          height: 14,
                          width: `${w}%`,
                          background: "rgba(10,10,10,0.06)",
                          animation: "pulse 1.5s ease-in-out infinite",
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Skills */}
              {jobDetail && jobDetail.skills.length > 0 && (
                <div
                  style={{
                    background: "#F5F5F0",
                    border: "2px solid #0A0A0A",
                    padding: "20px 24px",
                  }}
                >
                  <h3
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      fontFamily: "var(--font-mono)",
                      textTransform: "uppercase" as const,
                      letterSpacing: "0.06em",
                      color: "#888",
                      marginBottom: 14,
                    }}
                  >
                    Required Skills
                  </h3>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {jobDetail.skills.map((skill) => (
                      <span
                        key={skill}
                        style={{
                          padding: "6px 12px",
                          fontSize: 11,
                          fontWeight: 700,
                          fontFamily: "var(--font-mono)",
                          textTransform: "uppercase" as const,
                          letterSpacing: "0.04em",
                          background: "transparent",
                          color: "#0A0A0A",
                          border: "1.5px solid #0A0A0A",
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: 200,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  border: "3px solid rgba(10,10,10,0.08)",
                  borderTopColor: "#0A0A0A",
                  animation: "spin 0.8s linear infinite",
                }}
              />
              <style jsx>{`
                @keyframes spin {
                  to {
                    transform: rotate(360deg);
                  }
                }
              `}</style>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
