"use client";

import { colors } from "@/lib/constants/colors";

interface TopMatch {
  role: string;
  company: string;
  match: number;
  salary: string;
}

interface StepTopMatchesProps {
  matches: TopMatch[];
  loading?: boolean;
}

export function StepTopMatches({ matches, loading = false }: StepTopMatchesProps) {
  return (
    <div>
      <h2
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: colors.text,
          marginBottom: 4,
        }}
      >
        Your top matches
      </h2>
      <p
        style={{
          fontSize: 13,
          color: colors.textSec,
          marginBottom: 24,
        }}
      >
        Based on what you told us, here are some jobs that match your profile
      </p>

      {loading && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "32px 0",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              border: `3px solid ${colors.border}`,
              borderTopColor: colors.primary,
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <span style={{ fontSize: 13, color: colors.textMuted }}>
            Finding your best matches...
          </span>
        </div>
      )}

      {!loading && matches.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "32px 0",
            color: colors.textMuted,
            fontSize: 13,
          }}
        >
          We&apos;re still indexing jobs — check back soon for your matches!
        </div>
      )}

      {!loading && matches.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {matches.map((match, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 16px",
                borderRadius: 10,
                border: `1px solid ${i === 0 ? colors.primaryBorder : colors.border}`,
                background: i === 0 ? colors.primaryBg : colors.surface,
                animation: `fadeUp 0.3s ease ${i * 0.06}s both`,
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: colors.text,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {match.role}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: colors.textSec,
                    marginTop: 2,
                  }}
                >
                  {match.company} · {match.salary}
                </div>
              </div>
              <div
                style={{
                  padding: "4px 10px",
                  borderRadius: 6,
                  background: match.match >= 70 ? colors.successBg : colors.surfaceAlt,
                  fontSize: 12,
                  fontWeight: 600,
                  color: match.match >= 70 ? colors.success : colors.textSec,
                  flexShrink: 0,
                  marginLeft: 12,
                }}
              >
                {match.match}%
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
