"use client";

import { useState } from "react";
import { colors } from "@/lib/constants/colors";
import { Button } from "@/components/ui";
import { CourseCard } from "./CourseCard";
import type { ScoredCourse } from "@/lib/types/learn";

interface RecommendedCoursesSectionProps {
  courses: ScoredCourse[];
}

export function RecommendedCoursesSection({ courses }: RecommendedCoursesSectionProps) {
  const [showAll, setShowAll] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  if (courses.length === 0) return null;

  // Filter out courses where user already has all skills (heavily penalized)
  const relevantCourses = courses.filter((c) => c.relevanceScore > 0);

  // Get unique categories for filter chips
  const categories = [...new Set(relevantCourses.map((c) => c.categoryId))];

  const filtered = activeFilter
    ? relevantCourses.filter((c) => c.categoryId === activeFilter)
    : relevantCourses;

  const displayCourses = showAll ? filtered : filtered.slice(0, 6);

  // Shorten category names for chips
  const shortName = (cat: string) =>
    cat
      .replace("Communication & Soft Skills", "Communication")
      .replace("Tech & Development", "Tech & Dev")
      .replace("Design & Creative", "Design")
      .replace("Data & Analytics", "Data")
      .replace("Business Tools", "Biz Tools")
      .replace("Domain Skills", "Domain");

  return (
    <div id="recommended-courses" style={{ marginBottom: 20 }}>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: colors.text }}>
          Recommended For You
        </div>
        <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
          Courses scored against your skill gaps, target industries, and experience level
        </div>
      </div>

      {/* Category filter chips */}
      {categories.length > 1 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
            marginBottom: 12,
          }}
        >
          <button
            onClick={() => setActiveFilter(null)}
            style={{
              padding: "5px 12px",
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 600,
              cursor: "pointer",
              border: `1px solid ${activeFilter === null ? colors.primary : colors.border}`,
              background: activeFilter === null ? colors.primaryBg : colors.surface,
              color: activeFilter === null ? colors.primary : colors.textSec,
            }}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(activeFilter === cat ? null : cat)}
              style={{
                padding: "5px 12px",
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
                border: `1px solid ${activeFilter === cat ? colors.primary : colors.border}`,
                background: activeFilter === cat ? colors.primaryBg : colors.surface,
                color: activeFilter === cat ? colors.primary : colors.textSec,
              }}
            >
              {shortName(cat)}
            </button>
          ))}
        </div>
      )}

      <div className="responsive-grid-2">
        {displayCourses.map((course, i) => (
          <CourseCard
            key={course.id}
            course={course}
            animationDelay={0.12 + i * 0.06}
          />
        ))}
      </div>

      {filtered.length > 6 && (
        <div style={{ textAlign: "center", marginTop: 12 }}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? "Show less" : `Show ${filtered.length - 6} more courses`}
          </Button>
        </div>
      )}
    </div>
  );
}
