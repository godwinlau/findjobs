"use client";

import { useEffect } from "react";
import { colors } from "@/lib/constants/colors";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    // Log error to console in development
    console.error("Error boundary caught:", error);

    // TODO: Send to error tracking service (Sentry, etc.)
    // if (typeof window !== "undefined" && window.Sentry) {
    //   window.Sentry.captureException(error);
    // }
  }, [error]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: colors.bg,
      }}
    >
      <div
        style={{
          maxWidth: 420,
          textAlign: "center",
          padding: 32,
          background: colors.surface,
          borderRadius: 16,
          border: `1px solid ${colors.border}`,
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: `${colors.live}15`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            fontSize: 28,
          }}
        >
          ⚠️
        </div>

        <h1
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: colors.text,
            marginBottom: 8,
          }}
        >
          Something went wrong
        </h1>

        <p
          style={{
            fontSize: 14,
            color: colors.textSec,
            marginBottom: 24,
            lineHeight: 1.6,
          }}
        >
          We encountered an unexpected error. Please try again, or contact support if
          the problem persists.
        </p>

        {process.env.NODE_ENV === "development" && (
          <div
            style={{
              background: colors.bg,
              borderRadius: 8,
              padding: 12,
              marginBottom: 20,
              textAlign: "left",
              fontSize: 12,
              fontFamily: "monospace",
              color: colors.live,
              overflowX: "auto",
              maxHeight: 120,
              overflow: "auto",
            }}
          >
            {error.message}
            {error.digest && (
              <div style={{ marginTop: 8, color: colors.textMuted }}>
                Digest: {error.digest}
              </div>
            )}
          </div>
        )}

        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button
            onClick={reset}
            style={{
              padding: "10px 20px",
              borderRadius: 8,
              border: "none",
              background: colors.primary,
              color: colors.inv,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
          <button
            onClick={() => (window.location.href = "/home")}
            style={{
              padding: "10px 20px",
              borderRadius: 8,
              border: `1px solid ${colors.border}`,
              background: "transparent",
              color: colors.text,
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Go home
          </button>
        </div>
      </div>
    </div>
  );
}
