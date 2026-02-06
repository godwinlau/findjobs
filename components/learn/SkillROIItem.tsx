"use client";

import { ArrowUpRight, YoutubeLogo } from "@phosphor-icons/react";
import { colors } from "@/lib/constants/colors";
import { Badge, Button } from "@/components/ui";
import { getYoutubeForSkill, createYoutubeLookup } from "@/lib/constants/youtubeResources";
import type { SkillROI } from "@/lib/types/learn";

interface SkillROIItemProps {
  item: SkillROI;
  maxMatches: number;
  youtubeMaps?: { clusters: Record<string, { url: string; channel: string }>; skills: Record<string, { url: string; channel: string }> };
}

export function SkillROIItem({ item, maxMatches, youtubeMaps }: SkillROIItemProps) {
  const barWidth = maxMatches > 0 ? (item.estimatedNewMatches / maxMatches) * 100 : 0;
  const youtube = youtubeMaps
    ? createYoutubeLookup(youtubeMaps)(item.skill, item.category)
    : getYoutubeForSkill(item.skill, item.category);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 0",
        borderBottom: `1px solid ${colors.border}`,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 6,
          }}
        >
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: colors.text,
              textTransform: "capitalize",
            }}
          >
            {item.skill}
          </span>
          <Badge variant="primary" size="sm">
            +{item.estimatedNewMatches} jobs
          </Badge>
        </div>

        {/* Demand bar */}
        <div
          style={{
            height: 6,
            borderRadius: 3,
            background: colors.surfaceAlt,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${barWidth}%`,
              borderRadius: 3,
              background: `linear-gradient(90deg, ${colors.primary}, ${colors.primarySoft})`,
              transition: "width 0.5s ease",
              minWidth: barWidth > 0 ? 8 : 0,
            }}
          />
        </div>

        {item.topIndustries.length > 0 && (
          <div
            style={{
              fontSize: 10,
              color: colors.textMuted,
              marginTop: 4,
            }}
          >
            In demand: {item.topIndustries.slice(0, 2).join(", ")}
          </div>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
        {item.recommendedCourse ? (
          <a
            href={item.recommendedCourse.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "none" }}
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
              Learn on {item.recommendedCourse.provider}
              <ArrowUpRight size={13} weight="bold" />
            </Button>
          </a>
        ) : (
          <div style={{ width: 70 }} />
        )}

        {youtube && (
          <a
            href={youtube.url}
            target="_blank"
            rel="noopener noreferrer"
            title={`Watch on ${youtube.channel}`}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 30,
              height: 30,
              borderRadius: 6,
              color: colors.textMuted,
              textDecoration: "none",
            }}
          >
            <YoutubeLogo size={18} weight="fill" color="#FF0000" />
          </a>
        )}
      </div>
    </div>
  );
}
