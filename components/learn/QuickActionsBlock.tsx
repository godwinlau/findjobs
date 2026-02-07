"use client";

const MONO = "'Space Mono', monospace";

interface QuickActionsBlockProps {
  onTakeAssessment: () => void;
}

export function QuickActionsBlock({ onTakeAssessment }: QuickActionsBlockProps) {
  return (
    <div
      style={{
        border: "2px solid #0A0A0A",
        marginBottom: -2,
        padding: 24,
      }}
    >
      <div
        style={{
          fontFamily: MONO,
          fontSize: 10,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: ".06em",
          color: "#888",
          marginBottom: 14,
        }}
      >
        Quick Actions
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <button
          className="qa-btn"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: 12,
            border: "1.5px solid rgba(0,0,0,.08)",
            cursor: "pointer",
            transition: "all .15s",
            background: "none",
          }}
          onClick={() => {
            window.location.href = "/profile";
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              background: "rgba(0,0,0,.03)",
              flexShrink: 0,
            }}
          >
            ➕
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 1, textAlign: "left" }}>
            <div style={{ fontSize: 12, fontWeight: 700 }}>Add a skill to profile</div>
            <div style={{ fontSize: 10, color: "#888" }}>
              Learned something new? Update your profile
            </div>
          </div>
        </button>

        <button
          className="qa-btn"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: 12,
            border: "1.5px solid rgba(0,0,0,.08)",
            cursor: "pointer",
            transition: "all .15s",
            background: "none",
          }}
          onClick={() => {
            window.location.href = "/profile";
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              background: "rgba(0,0,0,.03)",
              flexShrink: 0,
            }}
          >
            📄
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 1, textAlign: "left" }}>
            <div style={{ fontSize: 12, fontWeight: 700 }}>Upload a certificate</div>
            <div style={{ fontSize: 10, color: "#888" }}>
              Verify skills with credentials
            </div>
          </div>
        </button>

        <button
          className="qa-btn"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: 12,
            border: "1.5px solid rgba(0,0,0,.08)",
            cursor: "pointer",
            transition: "all .15s",
            background: "none",
          }}
          onClick={onTakeAssessment}
        >
          <div
            style={{
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              background: "rgba(0,0,0,.03)",
              flexShrink: 0,
            }}
          >
            🎯
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 1, textAlign: "left" }}>
            <div style={{ fontSize: 12, fontWeight: 700 }}>Take a skill assessment</div>
            <div style={{ fontSize: 10, color: "#888" }}>
              Quick quiz to validate your level
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
