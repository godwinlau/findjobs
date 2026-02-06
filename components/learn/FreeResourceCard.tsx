"use client";

import { ArrowUpRight } from "@phosphor-icons/react";
import { colors } from "@/lib/constants/colors";
import { Card, CompanyLogo, Badge, Button } from "@/components/ui";
import type { FreeResource } from "@/lib/types/learn";

interface FreeResourceCardProps {
  resource: FreeResource;
  animationDelay?: number;
}

export function FreeResourceCard({
  resource,
  animationDelay = 0,
}: FreeResourceCardProps) {
  return (
    <Card
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
      animationDelay={animationDelay}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <CompanyLogo
          letter={resource.letter}
          bgColor={resource.logoBg}
          textColor={resource.logoColor}
          logoUrl={resource.logoUrl}
          size="md"
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: colors.text }}>
            {resource.provider}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <Badge variant="muted" size="sm">
              {resource.category}
            </Badge>
            {resource.highlight && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: colors.success,
                  background: colors.successBg,
                  padding: "2px 6px",
                  borderRadius: 4,
                }}
              >
                {resource.highlight}
              </span>
            )}
          </div>
        </div>
      </div>

      <div
        style={{
          fontSize: 12,
          color: colors.textSec,
          lineHeight: 1.5,
          flex: 1,
        }}
      >
        {resource.description}
      </div>

      <a
        href={resource.url}
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: "none" }}
      >
        <Button
          variant="outline"
          size="sm"
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          Visit {resource.provider}
          <ArrowUpRight size={14} weight="bold" />
        </Button>
      </a>
    </Card>
  );
}
