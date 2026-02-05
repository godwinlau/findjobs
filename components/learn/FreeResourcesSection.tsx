"use client";

import { colors } from "@/lib/constants/colors";
import { FreeResourceCard } from "./FreeResourceCard";
import type { FreeResource, ScoredFreeResource } from "@/lib/types/learn";

interface FreeResourcesSectionProps {
  resources: FreeResource[] | ScoredFreeResource[];
}

function isScoredResource(r: FreeResource): r is ScoredFreeResource {
  return "isBestForGaps" in r;
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
          <div key={resource.id} style={{ position: "relative" }}>
            {isScoredResource(resource) && resource.isBestForGaps && (
              <div
                style={{
                  position: "absolute",
                  top: -8,
                  right: 12,
                  zIndex: 1,
                  padding: "3px 10px",
                  borderRadius: 6,
                  fontSize: 10,
                  fontWeight: 700,
                  background: colors.successBg,
                  color: colors.success,
                  border: `1px solid ${colors.successBorder}`,
                }}
              >
                Best for your gaps
              </div>
            )}
            <FreeResourceCard
              resource={resource}
              animationDelay={0.24 + i * 0.06}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
