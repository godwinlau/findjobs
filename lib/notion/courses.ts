import { getNotionClient, DB } from "./client";
import { cached } from "./cache";
import {
  getTitle,
  getRichText,
  getSelect,
  getMultiSelect,
  getNumber,
  getCheckbox,
  getUrl,
} from "./mappers";
import type { Course } from "@/lib/types/learn";

async function _fetchCourses(): Promise<Course[]> {
  const notion = getNotionClient();
  if (!notion || !DB.courses) return [];

  const { results } = await notion.dataSources.query({
    data_source_id: DB.courses,
    page_size: 100,
  });

  return results
    .filter((p): p is Extract<typeof p, { properties: unknown }> => "properties" in p)
    .map((page) => {
      const p = page.properties as Record<string, unknown>;
      const course: Course = {
        id: getRichText(p, "ID") || page.id,
        title: getTitle(p, "Name"),
        description: getRichText(p, "Description"),
        provider: getSelect(p, "Provider"),
        providerLetter: getRichText(p, "Provider Letter"),
        providerLogoBg: getRichText(p, "Provider Logo Bg"),
        providerLogoColor: getRichText(p, "Provider Logo Color"),
        url: getUrl(p, "URL"),
        skillsTaught: getMultiSelect(p, "Skills Taught"),
        categoryId: getSelect(p, "Category ID"),
        difficulty: getSelect(p, "Difficulty") as Course["difficulty"],
        industries: getMultiSelect(p, "Industries"),
        estimatedHours: getNumber(p, "Estimated Hours"),
        format: getSelect(p, "Format") as Course["format"],
        isFree: getCheckbox(p, "Is Free"),
        icon: getRichText(p, "Icon"),
      };
      const yt = getUrl(p, "YouTube URL");
      if (yt) course.youtubeUrl = yt;
      return course;
    })
    .filter((c) => c.title && c.id);
}

export const fetchCourses = cached(_fetchCourses, ["notion-courses"], ["learn"]);
