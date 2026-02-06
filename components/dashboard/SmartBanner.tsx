"use client";

import Link from "next/link";
import { ArrowRight, Sparkle } from "@phosphor-icons/react";

interface SmartBannerProps {
  type: "new_matches";
  matchCount: number;
}

export function SmartBanner(props: SmartBannerProps) {
  return (
    <div
      className="responsive-row smart-banner-gap"
      style={{
        position: "relative",
        background: "#0A0A0A",
        border: "2px solid #0A0A0A",
        padding: "20px 28px",
        marginBottom: 20,
        justifyContent: "space-between",
        alignItems: "center",
        animation: "slam 0.4s cubic-bezier(.22,1,.36,1) 0.2s both",
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14, position: "relative" }}>
        <div
          style={{
            width: 40,
            height: 40,
            background: "#FBBF24",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Sparkle size={20} weight="fill" color="#0A0A0A" />
        </div>
        <div>
          <div style={{
            fontSize: 14,
            fontWeight: 800,
            color: "#F5F5F0",
            letterSpacing: "-0.02em",
            textTransform: "uppercase" as const,
          }}>
            {props.matchCount} new job{props.matchCount !== 1 ? "s" : ""} match your profile
          </div>
          <div style={{
            fontSize: 11,
            fontFamily: "var(--font-mono)",
            color: "rgba(245,245,240,0.4)",
            marginTop: 4,
            textTransform: "uppercase" as const,
            letterSpacing: "0.04em",
          }}>
            Personalized based on your skills
          </div>
        </div>
      </div>
      <Link
        href="/explore?sort=match"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "12px 24px",
          fontSize: 12,
          fontWeight: 700,
          fontFamily: "var(--font-mono)",
          textTransform: "uppercase" as const,
          letterSpacing: "0.04em",
          background: "#FBBF24",
          color: "#0A0A0A",
          textDecoration: "none",
          whiteSpace: "nowrap",
          textAlign: "center",
          transition: "all 0.15s ease",
        }}
      >
        See matches
        <ArrowRight size={14} weight="bold" />
      </Link>
    </div>
  );
}
