"use client";

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
          <Badge variant="muted" size="sm">
            {resource.category}
          </Badge>
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
        <Button variant="outline" size="sm" style={{ width: "100%" }}>
          Visit →
        </Button>
      </a>
    </Card>
  );
}
