"use client";

import Link from "next/link";
import { colors } from "@/lib/constants/colors";
import { InterviewAlert } from "./InterviewAlert";

type SmartBannerProps =
  | {
      type: "interview";
      company: string;
      role: string;
      date: string;
      time: string;
      format: string;
      daysUntil: number;
    }
  | {
      type: "new_matches";
      matchCount: number;
    };

export function SmartBanner(props: SmartBannerProps) {
  if (props.type === "interview") {
    return (
      <div style={{ marginBottom: 16, animation: "fadeUp 0.3s ease 0.2s both" }}>
        <InterviewAlert
          company={props.company}
          role={props.role}
          date={props.date}
          time={props.time}
          format={props.format}
          daysUntil={props.daysUntil}
        />
      </div>
    );
  }

  // type: "new_matches"
  return (
    <div
      className="responsive-row smart-banner-gap"
      style={{
        background: colors.successBg,
        borderRadius: 12,
        border: `1px solid ${colors.successBorder}`,
        padding: "16px 20px",
        marginBottom: 16,
        justifyContent: "space-between",
        animation: "fadeUp 0.3s ease 0.2s both",
      }}
    >
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: colors.text }}>
          {props.matchCount} new job{props.matchCount !== 1 ? "s" : ""} match
          your profile
        </div>
        <div style={{ fontSize: 12, color: colors.textSec, marginTop: 2 }}>
          Personalized based on your skills, salary, and location
        </div>
      </div>
      <Link
        href="/explore?sort=match"
        style={{
          padding: "8px 18px",
          borderRadius: 8,
          fontSize: 12,
          fontWeight: 600,
          background: colors.success,
          color: colors.inv,
          textDecoration: "none",
          whiteSpace: "nowrap",
          textAlign: "center",
        }}
      >
        See all matches
      </Link>
    </div>
  );
}
