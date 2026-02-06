"use client";

import { ArrowUpRight } from "@phosphor-icons/react";
import { colors } from "@/lib/constants/colors";
import { Badge, Button } from "@/components/ui";
import type { QuickWin } from "@/lib/types/learn";

interface QuickWinItemProps {
  win: QuickWin;
}

export function QuickWinItem({ win }: QuickWinItemProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 0",
        borderBottom: `1px solid ${colors.border}`,
      }}
    >
      <span style={{ fontSize: 16, flexShrink: 0, width: 24, textAlign: "center" }}>
        {win.icon}
      </span>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: colors.text }}>
          {win.skill}
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
            marginTop: 4,
          }}
        >
          <Badge variant="muted" size="sm">
            ~{win.estimatedMinutes} min
          </Badge>
          <Badge variant="primary" size="sm">
            +{win.jobsUnlocked} jobs
          </Badge>
        </div>
      </div>

      <a
        href={win.resourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: "none", flexShrink: 0 }}
      >
        <Button
          variant="ghost"
          size="sm"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          {win.resourceLabel}
          <ArrowUpRight size={13} weight="bold" />
        </Button>
      </a>
    </div>
  );
}
