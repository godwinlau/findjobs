import { colors } from "@/lib/constants/colors";

function Shimmer({ width, height, radius = 6 }: { width: string; height: string; radius?: number }) {
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

function CardSkeleton({ height = "140px" }: { height?: string }) {
  return (
    <div
      style={{
        height,
        border: `2px solid ${colors.border}`,
        borderRadius: 0,
        background: colors.surface,
        animation: "skeleton-shimmer 1.5s ease-in-out infinite",
      }}
    />
  );
}

export default function DashboardLoading() {
  return (
    <div style={{ minHeight: "100vh", background: colors.bg, color: colors.text }}>
      {/* Navbar placeholder */}
      <div
        style={{
          height: 56,
          borderBottom: `2px solid ${colors.border}`,
          background: colors.bg,
        }}
      />

      {/* Search strip placeholder */}
      <div
        style={{
          borderBottom: `2px solid ${colors.border}`,
          background: colors.bg,
        }}
      >
        <div
          style={{
            maxWidth: 1060,
            margin: "0 auto",
            padding: "14px 20px",
          }}
        >
          <Shimmer width="100%" height="40px" radius={8} />
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "28px 20px 60px" }}>
        {/* Top matches preview */}
        <CardSkeleton height="200px" />

        {/* Category chips */}
        <div style={{ display: "flex", gap: 0, marginTop: 32, marginBottom: 32 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              style={{
                flexShrink: 0,
                border: `2px solid ${colors.border}`,
                marginLeft: i === 0 ? 0 : -2,
                padding: "14px 20px",
                width: 160,
                height: 60,
                background: colors.bg,
                animation: "skeleton-shimmer 1.5s ease-in-out infinite",
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>

        {/* Two-col layout */}
        <div className="two-col">
          {/* Left column */}
          <div>
            {/* Section header */}
            <div style={{ marginBottom: 14 }}>
              <Shimmer width="80px" height="10px" />
              <div style={{ marginTop: 6 }}>
                <Shimmer width="200px" height="24px" />
              </div>
            </div>
            {/* Trending roles grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 0 }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <CardSkeleton key={i} height="120px" />
              ))}
            </div>

            {/* Companies */}
            <div style={{ marginTop: 32, marginBottom: 14 }}>
              <Shimmer width="80px" height="10px" />
              <div style={{ marginTop: 6 }}>
                <Shimmer width="180px" height="24px" />
              </div>
            </div>
            {Array.from({ length: 3 }).map((_, i) => (
              <CardSkeleton key={i} height="72px" />
            ))}
          </div>

          {/* Right sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            <CardSkeleton height="200px" />
            <CardSkeleton height="220px" />
            <CardSkeleton height="160px" />
          </div>
        </div>
      </div>
    </div>
  );
}
