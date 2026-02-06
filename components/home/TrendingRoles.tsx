import Link from "next/link";
import type { TrendingRole } from "@/lib/types/home";
import { TrendingRoleCard } from "./TrendingRoleCard";

interface TrendingRolesProps {
  roles: TrendingRole[];
  categoryName: string;
}

export function TrendingRoles({ roles, categoryName }: TrendingRolesProps) {
  return (
    <div className="sec">
      <div className="sec-header">
        <div className="sec-left">
          <span className="sec-label">// trending in {categoryName.toLowerCase()}</span>
          <div className="sec-title">Roles Gaining Traction</div>
        </div>
        <Link href="/explore" className="sec-link">
          View all {"\u2192"}
        </Link>
      </div>
      <div className="trending-grid">
        {roles.map((role) => (
          <TrendingRoleCard key={role.title} role={role} />
        ))}
      </div>
      {roles.length === 0 && (
        <div style={{ padding: 20, textAlign: "center", color: "var(--hb-text-muted)", fontFamily: "'Space Mono', monospace", fontSize: 11 }}>
          No roles found in this category yet
        </div>
      )}
    </div>
  );
}
