"use client";

import { colors } from "@/lib/constants/colors";
import { HandWaving, Compass } from "@phosphor-icons/react";

interface WelcomeModalProps {
  firstName: string;
  onStartTour: () => void;
  onDismiss: () => void;
}

export function WelcomeModal({
  firstName,
  onStartTour,
  onDismiss,
}: WelcomeModalProps) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        animation: "fadeIn 0.3s ease",
      }}
    >
      {/* Backdrop */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0, 0, 0, 0.5)",
        }}
        onClick={onDismiss}
      />

      {/* Modal */}
      <div
        style={{
          position: "relative",
          background: colors.surface,
          borderRadius: 16,
          padding: 32,
          maxWidth: 420,
          width: "100%",
          textAlign: "center",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
          animation: "fadeUp 0.4s ease",
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: colors.primaryBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
          }}
        >
          <HandWaving size={28} weight="fill" color={colors.primary} />
        </div>

        <h2
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: colors.text,
            marginBottom: 8,
          }}
        >
          Welcome to bigmovv{firstName ? `, ${firstName}` : ""}!
        </h2>

        <p
          style={{
            fontSize: 14,
            color: colors.textSec,
            lineHeight: 1.6,
            marginBottom: 28,
          }}
        >
          Your dashboard is ready. Let us give you a quick tour so you know
          where everything is.
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <button
            type="button"
            onClick={onStartTour}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "12px 24px",
              borderRadius: 10,
              border: "none",
              background: colors.primary,
              color: colors.inv,
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
              width: "100%",
            }}
          >
            <Compass size={18} weight="bold" />
            Show me around
          </button>

          <button
            type="button"
            onClick={onDismiss}
            style={{
              padding: "10px 24px",
              borderRadius: 10,
              border: "none",
              background: "transparent",
              color: colors.textMuted,
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
              width: "100%",
            }}
          >
            I&apos;ll explore on my own
          </button>
        </div>
      </div>
    </div>
  );
}
