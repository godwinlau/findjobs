// ─── LinkedIn job search queries targeting PH job market ───
// Uses linkedin-jobs-api npm package (free, no API key)
// Split into 2 batches of 5 — runs once daily, alternating batches
// Each query searches LinkedIn with location="Philippines"

export const SEARCH_QUERIES = [
  // Batch 0: High-demand BPO & support roles
  "customer service representative",
  "virtual assistant",
  "data entry specialist",
  "call center agent",
  "software engineer",

  // Batch 1: Business & digital
  "social media manager",
  "administrative assistant",
  "accounting clerk",
  "web developer",
  "content writer",

  // Batch 2: IT & development
  "full stack developer",
  "frontend developer",
  "backend developer",
  "mobile developer",
  "QA engineer",

  // Batch 3: BPO & operations
  "technical support specialist",
  "operations manager",
  "project manager",
  "human resources",
  "recruiter",

  // Batch 4: Finance & analytics
  "financial analyst",
  "business analyst",
  "data analyst",
  "marketing specialist",
  "graphic designer",

  // Batch 5: Specialized roles
  "UI UX designer",
  "DevOps engineer",
  "network engineer",
  "product manager",
  "sales executive",

  // Batch 6: Growing sectors
  "medical transcriptionist",
  "nurse",
  "teacher",
  "digital marketing",
  "ecommerce manager",
];

export const BATCH_SIZE = 5;
export const TOTAL_BATCHES = Math.ceil(SEARCH_QUERIES.length / BATCH_SIZE);

export function getQueriesForBatch(batch: number): string[] {
  const start = batch * BATCH_SIZE;
  return SEARCH_QUERIES.slice(start, start + BATCH_SIZE);
}

// ─── PH location mapping ───
// Maps derived city strings to normalized city + area

interface LocationMapping {
  city: string;
  area: string | null;
}

const LOCATION_MAP: Record<string, LocationMapping> = {
  "taguig": { city: "Taguig", area: "BGC" },
  "bonifacio global city": { city: "Taguig", area: "BGC" },
  "bgc": { city: "Taguig", area: "BGC" },
  "makati": { city: "Makati City", area: null },
  "makati city": { city: "Makati City", area: null },
  "pasig": { city: "Pasig City", area: "Ortigas" },
  "pasig city": { city: "Pasig City", area: "Ortigas" },
  "ortigas": { city: "Pasig City", area: "Ortigas" },
  "mandaluyong": { city: "Mandaluyong City", area: "Ortigas" },
  "quezon city": { city: "Quezon City", area: null },
  "manila": { city: "Manila", area: null },
  "cebu": { city: "Cebu City", area: null },
  "cebu city": { city: "Cebu City", area: "IT Park" },
  "davao": { city: "Davao City", area: null },
  "davao city": { city: "Davao City", area: null },
  "clark": { city: "Clark", area: "Pampanga" },
  "iloilo": { city: "Iloilo City", area: null },
  "iloilo city": { city: "Iloilo City", area: null },
  "alabang": { city: "Muntinlupa City", area: "Alabang" },
  "muntinlupa": { city: "Muntinlupa City", area: "Alabang" },
  "paranaque": { city: "Parañaque City", area: null },
  "parañaque": { city: "Parañaque City", area: null },
};

export function normalizeLocation(raw: string | null): LocationMapping {
  if (!raw) return { city: "Philippines", area: null };

  const lower = raw.toLowerCase().trim();

  // Exact match
  if (LOCATION_MAP[lower]) return LOCATION_MAP[lower];

  // Partial match — check if any key is contained in the raw string
  for (const [key, mapping] of Object.entries(LOCATION_MAP)) {
    if (lower.includes(key)) return mapping;
  }

  // Fallback: use the raw string as city
  return { city: raw.trim(), area: null };
}

// ─── Skill taxonomy ───
// Curated skills relevant to PH job market, used for extraction

export const SKILL_TAXONOMY = [
  // Communication & soft skills
  "communication", "teamwork", "leadership", "problem solving",
  "time management", "customer service", "public speaking",
  "negotiation", "conflict resolution", "adaptability",

  // Tech & tools
  "microsoft office", "ms office", "excel", "word", "powerpoint",
  "google workspace", "google sheets", "google docs",
  "html", "css", "javascript", "typescript", "react", "next.js",
  "node.js", "python", "java", "php", "sql", "git",
  "figma", "photoshop", "illustrator", "canva",
  "salesforce", "hubspot", "zendesk", "jira", "trello",
  "sap", "quickbooks", "xero",

  // Data & analytics
  "data entry", "data analysis", "data visualization",
  "tableau", "power bi", "google analytics", "seo",
  "social media management", "content management",

  // Domain specific
  "accounting", "bookkeeping", "payroll", "recruitment",
  "project management", "quality assurance", "testing",
  "technical support", "troubleshooting",
  "copywriting", "content writing", "editing",
  "research", "user research", "market research",
];

export function extractSkills(text: string): string[] {
  const lower = text.toLowerCase();
  const found = new Set<string>();

  for (const skill of SKILL_TAXONOMY) {
    // Match whole words/phrases to avoid false positives
    const pattern = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    if (pattern.test(lower)) {
      found.add(skill);
    }
  }

  return Array.from(found).sort();
}

// ─── Education level extraction ───
// Extracts the minimum education requirement from job descriptions.
// Returns the highest mentioned level. Ordered from highest to lowest
// so we return the first (highest) match.

export type EducationLevel =
  | "doctorate"
  | "masters"
  | "bachelors"
  | "associate"
  | "high_school"
  | null;

const EDUCATION_LABELS: Record<Exclude<EducationLevel, null>, string> = {
  doctorate: "Doctorate",
  masters: "Master's",
  bachelors: "Bachelor's",
  associate: "Vocational / Associate",
  high_school: "High School",
};

export function getEducationLabel(level: EducationLevel): string | null {
  return level ? EDUCATION_LABELS[level] : null;
}

// Patterns ordered highest → lowest so first match wins
const EDUCATION_PATTERNS: { level: Exclude<EducationLevel, null>; re: RegExp }[] = [
  {
    level: "doctorate",
    re: /\b(?:ph\.?d|doctorate|doctoral|doctor of)\b/i,
  },
  {
    level: "masters",
    re: /\b(?:master'?s?\s*(?:degree|of|in)|mba|m\.?s\.?\s+in|m\.?a\.?\s+in|post-?graduate|postgraduate)\b/i,
  },
  {
    level: "bachelors",
    re: /\b(?:bachelor'?s?(?:\s+(?:degree|of|in))?|b\.?s\.?\s+in|b\.?a\.?\s+in|bsc|college\s+(?:graduate|degree)|4[- ]year\s+(?:course|degree)|degree\s+holder|university\s+degree|graduate\s+of\s+(?:bs|b\.s\.|any|a)\b|fresh\s+graduate|undergraduate)\b/i,
  },
  {
    level: "associate",
    re: /\b(?:associate'?s?\s*degree|diploma|vocational|2[- ]year\s+(?:course|degree)|technical\s+(?:course|diploma))\b/i,
  },
  {
    level: "high_school",
    re: /\b(?:high\s+school|senior\s+high|shs\s+graduate|k-?12)\b/i,
  },
];

export function extractEducation(text: string): EducationLevel {
  if (!text) return null;

  for (const { level, re } of EDUCATION_PATTERNS) {
    if (re.test(text)) return level;
  }

  return null;
}
