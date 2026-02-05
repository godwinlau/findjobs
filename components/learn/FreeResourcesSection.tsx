"use client";

import { colors } from "@/lib/constants/colors";
import { FreeResourceCard } from "./FreeResourceCard";
import type { FreeResource } from "@/lib/types/learn";

interface FreeResourcesSectionProps {
  resources: FreeResource[];
}

export function FreeResourcesSection({ resources }: FreeResourcesSectionProps) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: colors.text }}>
          Free Resources
        </div>
        <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
          Curated free learning platforms relevant for Filipino job seekers
        </div>
      </div>

      <div className="responsive-grid-3">
        {resources.map((resource, i) => (
          <FreeResourceCard
            key={resource.id}
            resource={resource}
            animationDelay={0.24 + i * 0.06}
          />
        ))}
      </div>
    </div>
  );
}
