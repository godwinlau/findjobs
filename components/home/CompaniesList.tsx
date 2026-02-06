import Link from "next/link";
import type { CompanyInfo } from "@/lib/types/home";
import { CompanyRow } from "./CompanyRow";

interface CompaniesListProps {
  companies: CompanyInfo[];
  categoryName: string;
}

export function CompaniesList({ companies, categoryName }: CompaniesListProps) {
  return (
    <div className="sec">
      <div className="sec-header">
        <div className="sec-left">
          <span className="sec-label">// actively hiring in {categoryName.toLowerCase()}</span>
          <div className="sec-title">Companies</div>
        </div>
        <Link href="/explore" className="sec-link">
          View all {"\u2192"}
        </Link>
      </div>
      <div className="co-list">
        {companies.map((company) => (
          <CompanyRow key={company.name} company={company} />
        ))}
      </div>
      {companies.length === 0 && (
        <div style={{ padding: 20, textAlign: "center", color: "var(--hb-text-muted)", fontFamily: "'Space Mono', monospace", fontSize: 11 }}>
          No companies found in this category yet
        </div>
      )}
    </div>
  );
}
