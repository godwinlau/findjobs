"use client";

import { colors } from "@/lib/constants/colors";
import { Card } from "@/components/ui";
import { QuickWinItem } from "./QuickWinItem";
import type { QuickWin } from "@/lib/types/learn";

interface QuickWinsSectionProps {
  wins: QuickWin[];
}

export function QuickWinsSection({ wins }: QuickWinsSectionProps) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: colors.text }}>
          Quick Wins
        </div>
        <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
          Skills that give you the biggest match boost
        </div>
      </div>

      <Card padding="md" animationDelay={0.18}>
        {wins.map((win, i) => (
          <div
            key={win.id}
            style={{
              borderBottom: i < wins.length - 1 ? undefined : "none",
            }}
          >
            <QuickWinItem win={win} />
          </div>
        ))}
      </Card>
    </div>
  );
}
