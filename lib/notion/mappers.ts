/**
 * Property extraction helpers for Notion page objects.
 * Each function handles the specific Notion property type and returns a plain value.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
type Props = Record<string, any>;

export function getTitle(props: Props, key: string): string {
  const prop = props[key];
  if (prop?.type === "title" && Array.isArray(prop.title)) {
    return prop.title.map((t: any) => t.plain_text).join("") || "";
  }
  return "";
}

export function getRichText(props: Props, key: string): string {
  const prop = props[key];
  if (prop?.type === "rich_text" && Array.isArray(prop.rich_text)) {
    return prop.rich_text.map((t: any) => t.plain_text).join("") || "";
  }
  return "";
}

export function getNumber(props: Props, key: string): number {
  const prop = props[key];
  if (prop?.type === "number" && typeof prop.number === "number") {
    return prop.number;
  }
  return 0;
}

export function getCheckbox(props: Props, key: string): boolean {
  const prop = props[key];
  if (prop?.type === "checkbox") {
    return !!prop.checkbox;
  }
  return false;
}

export function getSelect(props: Props, key: string): string {
  const prop = props[key];
  if (prop?.type === "select" && prop.select?.name) {
    return prop.select.name;
  }
  return "";
}

export function getMultiSelect(props: Props, key: string): string[] {
  const prop = props[key];
  if (prop?.type === "multi_select" && Array.isArray(prop.multi_select)) {
    return prop.multi_select.map((s: any) => s.name as string);
  }
  return [];
}

export function getUrl(props: Props, key: string): string {
  const prop = props[key];
  if (prop?.type === "url" && typeof prop.url === "string") {
    return prop.url;
  }
  return "";
}

/**
 * Parse a Rich Text field that contains a JSON array (e.g. quiz options, learning steps).
 * Returns the parsed array or an empty array on failure.
 */
export function parseJsonArray<T>(props: Props, key: string): T[] {
  const raw = getRichText(props, key);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
