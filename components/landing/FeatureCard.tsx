"use client";

import type { ReactNode } from "react";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  desc: string;
  tag: string;
}

export function FeatureCard({ icon, title, desc, tag }: FeatureCardProps) {
  return (
    <div className="lp-feat">
      <div className="lp-feat-icon">{icon}</div>
      <div className="lp-feat-title">{title}</div>
      <div className="lp-feat-desc">{desc}</div>
      <div className="lp-feat-tag">{tag}</div>
    </div>
  );
}
