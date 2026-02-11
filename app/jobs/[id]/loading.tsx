import "@/app/styles/job-detail-page.css";
import { colors } from "@/lib/constants/colors";

function Shimmer({ width, height, radius = 0 }: { width: string; height: string; radius?: number }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        background: colors.surfaceAlt,
        animation: "skeleton-shimmer 1.5s ease-in-out infinite",
      }}
    />
  );
}

export default function JobDetailLoading() {
  return (
    <div style={{ minHeight: "100vh", background: colors.bg, color: colors.text }}>
      {/* Navbar */}
      <div style={{ height: 56, borderBottom: `2px solid ${colors.border}`, background: colors.bg }} />

      {/* Breadcrumb */}
      <div style={{ borderBottom: `2px solid ${colors.border}`, padding: "10px 20px" }}>
        <div style={{ maxWidth: 1060, margin: "0 auto" }}>
          <Shimmer width="120px" height="12px" radius={4} />
        </div>
      </div>

      {/* 2-column layout */}
      <div className="jd-page">
        {/* Left — detail */}
        <div style={{ border: `3px solid ${colors.border}` }}>
          {/* Hero */}
          <div
            style={{
              background: "#0A0A0A",
              padding: "40px",
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 8,
                  background: "rgba(255,255,255,0.1)",
                  animation: "skeleton-shimmer 1.5s ease-in-out infinite",
                }}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div
                  style={{
                    width: 120,
                    height: 12,
                    background: "rgba(255,255,255,0.1)",
                    animation: "skeleton-shimmer 1.5s ease-in-out infinite",
                  }}
                />
                <div
                  style={{
                    width: 80,
                    height: 10,
                    background: "rgba(255,255,255,0.08)",
                    animation: "skeleton-shimmer 1.5s ease-in-out infinite",
                    animationDelay: "0.1s",
                  }}
                />
              </div>
            </div>
            <div
              style={{
                width: "70%",
                height: 28,
                background: "rgba(255,255,255,0.1)",
                animation: "skeleton-shimmer 1.5s ease-in-out infinite",
                animationDelay: "0.15s",
              }}
            />
            <div style={{ display: "flex", gap: 10 }}>
              {[100, 80, 90].map((w, i) => (
                <div
                  key={i}
                  style={{
                    width: w,
                    height: 20,
                    borderRadius: 4,
                    background: "rgba(255,255,255,0.08)",
                    animation: "skeleton-shimmer 1.5s ease-in-out infinite",
                    animationDelay: `${0.2 + i * 0.05}s`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Description skeleton */}
          <div style={{ padding: "28px 40px" }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: `${60 + Math.random() * 40}%`,
                  height: 12,
                  background: colors.surfaceAlt,
                  marginBottom: 14,
                  animation: "skeleton-shimmer 1.5s ease-in-out infinite",
                  animationDelay: `${0.3 + i * 0.04}s`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Right — sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          <div
            style={{
              height: 200,
              border: `2px solid ${colors.border}`,
              background: colors.surface,
              animation: "skeleton-shimmer 1.5s ease-in-out infinite",
            }}
          />
          <div
            style={{
              height: 180,
              border: `2px solid ${colors.border}`,
              borderTop: "none",
              background: colors.surface,
              animation: "skeleton-shimmer 1.5s ease-in-out infinite",
              animationDelay: "0.1s",
            }}
          />
          <div
            style={{
              height: 280,
              border: `2px solid ${colors.border}`,
              borderTop: "none",
              background: colors.surface,
              animation: "skeleton-shimmer 1.5s ease-in-out infinite",
              animationDelay: "0.2s",
            }}
          />
        </div>
      </div>
    </div>
  );
}
