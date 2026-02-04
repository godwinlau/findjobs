import { colors } from "@/lib/constants/colors";
import { Logo } from "@/components/ui";

interface AuthCardProps {
  children: React.ReactNode;
}

export function AuthCard({ children }: AuthCardProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: colors.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        className="auth-card-inner"
        style={{
          width: "100%",
          maxWidth: 420,
          background: colors.surface,
          borderRadius: 12,
          border: `1px solid ${colors.border}`,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 28,
          }}
        >
          <Logo size="lg" />
        </div>
        {children}
      </div>
    </div>
  );
}
