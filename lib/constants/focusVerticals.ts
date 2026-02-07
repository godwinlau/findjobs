// Focus verticals — single source of truth for early-stage PMF scope.
// Non-focus clusters/categories are hidden from UI only; data stays intact.

export const FOCUS_CLUSTERS = ["DEV", "DES", "BPO", "MKT", "VA"] as const;

export const FOCUS_WORK_CATEGORIES = [
  "tech_it",
  "bpo",
  "admin",
  "sales",
  "design",
] as const;

// Assessment categoryIds that map to focus verticals
export const FOCUS_ASSESSMENT_CATEGORIES = [
  "Communication & Soft Skills", // BPO
  "Tech & Development",          // DEV
  "Design & Creative",           // DES
  "Business Tools",              // VA
] as const;

export function isFocusCluster(id: string): boolean {
  return (FOCUS_CLUSTERS as readonly string[]).includes(id);
}

export function isFocusWorkCategory(value: string): boolean {
  return (FOCUS_WORK_CATEGORIES as readonly string[]).includes(value);
}
