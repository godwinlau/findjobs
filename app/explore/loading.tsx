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

function JobCardSkeleton({ delay = 0 }: { delay?: number }) {
  return (
    <div
      style={{
        border: `2px solid ${colors.border}`,
        padding: "20px",
        background: colors.surface,
        animation: "skeleton-shimmer 1.5s ease-in-out infinite",
        animationDelay: `${delay}s`,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 6,
              background: colors.surfaceAlt,
            }}
          />
          <Shimmer width="100px" height="12px" radius={4} />
        </div>
        <Shimmer width="50px" height="20px" radius={10} />
      </div>
      <Shimmer width="70%" height="16px" radius={4} />
      <div style={{ display: "flex", gap: 8 }}>
        <Shimmer width="80px" height="14px" radius={4} />
        <Shimmer width="60px" height="14px" radius={4} />
        <Shimmer width="90px" height="14px" radius={4} />
      </div>
    </div>
  );
}

export default function ExploreLoading() {
  return (
    <div style={{ minHeight: "100vh", background: colors.bg, color: colors.text }}>
      {/* Navbar */}
      <div style={{ height: 56, borderBottom: `2px solid ${colors.border}`, background: colors.bg }} />

      <div className="responsive-container" style={{ padding: "28px 20px 60px" }}>
        {/* Title */}
        <Shimmer width="160px" height="22px" radius={4} />

        {/* Search bar */}
        <div
          style={{
            marginTop: 16,
            marginBottom: 20,
            height: 44,
            border: `2px solid ${colors.border}`,
            background: colors.surface,
            animation: "skeleton-shimmer 1.5s ease-in-out infinite",
          }}
        />

        {/* Filter bar */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 100 + i * 10,
                height: 36,
                border: `2px solid ${colors.border}`,
                background: colors.surface,
                animation: "skeleton-shimmer 1.5s ease-in-out infinite",
                animationDelay: `${i * 0.05}s`,
              }}
            />
          ))}
        </div>

        {/* Job list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <JobCardSkeleton key={i} delay={i * 0.04} />
          ))}
        </div>
      </div>
    </div>
  );
}
