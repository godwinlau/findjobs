import type { CompanyInfo } from "@/lib/types/home";

interface CompanyRowProps {
  company: CompanyInfo;
}

export function CompanyRow({ company }: CompanyRowProps) {
  const initial = company.name.charAt(0).toUpperCase();

  return (
    <div className="co-row">
      <div className="co-logo">
        {company.logoUrl ? (
          <img
            src={company.logoUrl}
            alt={company.name}
            style={{ width: 28, height: 28, objectFit: "contain" }}
          />
        ) : (
          <span>{initial}</span>
        )}
      </div>
      <div className="co-info">
        <div className="co-name">{company.name}</div>
        <div className="co-meta">
          {[company.industry, company.location, company.size]
            .filter(Boolean)
            .join(" \u00B7 ")}
        </div>
      </div>
      <div className="co-jobs-badge">{company.openJobs} open</div>
      <div className="co-rating">
        <span className="co-rating-star">{"\u2605"}</span> {company.rating.toFixed(1)}
      </div>
    </div>
  );
}
