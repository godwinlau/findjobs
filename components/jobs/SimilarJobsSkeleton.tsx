import { colors } from "@/lib/constants/colors";

export function SimilarJobsSkeleton() {
  return (
    <div className="jd-sidebar-similar">
      <div className="jd-ss-title">Similar Jobs</div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          style={{
            padding: "14px 16px",
            borderTop: `1px solid ${colors.border}`,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div
            style={{
              width: "80%",
              height: 13,
              background: colors.surfaceAlt,
              animation: "skeleton-shimmer 1.5s ease-in-out infinite",
              animationDelay: `${i * 0.1}s`,
            }}
          />
          <div
            style={{
              width: "50%",
              height: 11,
              background: colors.surfaceAlt,
              animation: "skeleton-shimmer 1.5s ease-in-out infinite",
              animationDelay: `${0.05 + i * 0.1}s`,
            }}
          />
        </div>
      ))}
    </div>
  );
}
