"use client";

import { colors } from "@/lib/constants/colors";
import { Card } from "@/components/ui";
import { QuickWinItem } from "./QuickWinItem";
import type { QuickWin, ScoredQuickWin } from "@/lib/types/learn";

interface QuickWinsSectionProps {
  wins: QuickWin[] | ScoredQuickWin[];
}

function isScoredWin(win: QuickWin): win is ScoredQuickWin {
  return "isTopPick" in win;
}

export function QuickWinsSection({ wins }: QuickWinsSectionProps) {
  if (wins.length === 0) return null;

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
              position: "relative",
            }}
          >
            {isScoredWin(win) && win.isTopPick && (
              <span
                style={{
                  position: "absolute",
                  top: 12,
                  right: 0,
                  padding: "2px 8px",
                  borderRadius: 4,
                  fontSize: 9,
                  fontWeight: 700,
                  background: colors.warningBg,
                  color: colors.warning,
                  border: `1px solid ${colors.warningBorder}`,
                }}
              >
                Top pick
              </span>
            )}
            <QuickWinItem win={win} />
          </div>
        ))}
      </Card>
    </div>
  );
}
