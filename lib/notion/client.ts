import { Client } from "@notionhq/client";

// Notion client — only initialised when NOTION_API_KEY is set
let _client: Client | null = null;

export function getNotionClient(): Client | null {
  if (!process.env.NOTION_API_KEY) return null;
  if (!_client) {
    _client = new Client({ auth: process.env.NOTION_API_KEY });
  }
  return _client;
}

// Database IDs from env — empty string means "not configured"
export const DB = {
  courses: process.env.NOTION_DB_COURSES ?? "",
} as const;
