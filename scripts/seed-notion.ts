/**
 * One-time script to seed Notion Courses database from hardcoded data.
 *
 * Usage:
 *   npx tsx scripts/seed-notion.ts
 *
 * Prerequisites:
 *   1. Create a Notion integration at https://www.notion.so/my-integrations
 *   2. Create a Courses database in Notion with the required fields
 *   3. Share the database with your integration
 *   4. Set env vars in .env.local (see .env.example)
 *
 * This script is idempotent-ish: it creates new pages each run.
 * Clear the database manually before re-running to avoid duplicates.
 */

import { Client } from "@notionhq/client";
import { courseCatalog } from "../lib/data/courseCatalog";

// ─── Config ───

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const DB_COURSES = process.env.NOTION_DB_COURSES;

if (!NOTION_API_KEY) {
  console.error("Missing NOTION_API_KEY. Set it in .env.local");
  process.exit(1);
}

if (!DB_COURSES) {
  console.error("Missing NOTION_DB_COURSES. Set it in .env.local");
  process.exit(1);
}

const notion = new Client({ auth: NOTION_API_KEY });

// ─── Helpers ───

function sanitizeMultiSelect(name: string) {
  // Notion multi-select doesn't allow commas
  return name.replace(/,/g, ";");
}

function richText(text: string) {
  return [{ text: { content: text.slice(0, 2000) } }];
}

function title(text: string) {
  return [{ text: { content: text.slice(0, 200) } }];
}

async function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// ─── Seed ───

async function main() {
  console.log(`Seeding ${courseCatalog.length} courses...\n`);

  for (const c of courseCatalog) {
    await notion.pages.create({
      parent: { database_id: DB_COURSES! },
      properties: {
        Name: { title: title(c.title) },
        ID: { rich_text: richText(c.id) },
        Description: { rich_text: richText(c.description) },
        Provider: { select: { name: c.provider } },
        "Provider Letter": { rich_text: richText(c.providerLetter) },
        "Provider Logo Bg": { rich_text: richText(c.providerLogoBg) },
        "Provider Logo Color": { rich_text: richText(c.providerLogoColor) },
        URL: { url: c.url },
        "Skills Taught": {
          multi_select: c.skillsTaught.map((s) => ({ name: sanitizeMultiSelect(s) })),
        },
        "Category ID": { select: { name: c.categoryId } },
        Difficulty: { select: { name: c.difficulty } },
        Industries: {
          multi_select: c.industries.map((i) => ({ name: sanitizeMultiSelect(i) })),
        },
        "Estimated Hours": { number: c.estimatedHours },
        Format: { select: { name: c.format } },
        "Is Free": { checkbox: c.isFree },
        Icon: { rich_text: richText(c.icon) },
        ...(c.youtubeUrl ? { "YouTube URL": { url: c.youtubeUrl } } : {}),
      },
    });
    process.stdout.write(".");
    await delay(350); // respect rate limits
  }

  console.log(`\n\nDone! ${courseCatalog.length} courses seeded.`);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
