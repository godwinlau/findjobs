import { colors } from "@/lib/constants/colors";

export function TopMatchesSkeleton() {
  return (
    <div style={{ marginTop: 24 }}>
      {/* Header */}
      <div style={{ marginBottom: 12 }}>
        <div
          style={{
            width: 160,
            height: 10,
            background: colors.surfaceAlt,
            marginBottom: 8,
            animation: "skeleton-shimmer 1.5s ease-in-out infinite",
          }}
        />
        <div
          style={{
            width: 200,
            height: 24,
            background: colors.surfaceAlt,
            animation: "skeleton-shimmer 1.5s ease-in-out infinite",
            animationDelay: "0.1s",
          }}
        />
      </div>

      {/* Hero card placeholder */}
      <div
        style={{
          height: 200,
          border: `2px solid ${colors.border}`,
          background: colors.surface,
          animation: "skeleton-shimmer 1.5s ease-in-out infinite",
          animationDelay: "0.2s",
        }}
      />

      {/* Small cards grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 0, marginTop: 0 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            style={{
              height: 100,
              border: `2px solid ${colors.border}`,
              background: colors.surface,
              animation: "skeleton-shimmer 1.5s ease-in-out infinite",
              animationDelay: `${0.3 + i * 0.05}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
