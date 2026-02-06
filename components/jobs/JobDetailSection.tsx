import type { ReactNode } from "react";

interface JobDetailSectionProps {
  label: string;
  children: ReactNode;
}

export function JobDetailSection({ label, children }: JobDetailSectionProps) {
  return (
    <div className="jd-section">
      <div className="jd-section-label">{label}</div>
      {children}
    </div>
  );
}
