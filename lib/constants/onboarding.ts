// HanapBuhay Onboarding Constants

// ─── City options (derived from LOCATION_MAP in queries.ts) ───
export const CITY_OPTIONS = [
  "Taguig (BGC)",
  "Makati City",
  "Pasig City (Ortigas)",
  "Mandaluyong City",
  "Quezon City",
  "Manila",
  "Cebu City",
  "Davao City",
  "Clark (Pampanga)",
  "Iloilo City",
  "Muntinlupa City (Alabang)",
  "Parañaque City",
];

// ─── Skill categories for chip selector ───
export const SKILL_CATEGORIES: Record<string, string[]> = {
  "Communication & Soft Skills": [
    "communication",
    "teamwork",
    "leadership",
    "problem solving",
    "time management",
    "customer service",
    "public speaking",
    "negotiation",
    "adaptability",
  ],
  "Tech & Development": [
    "html",
    "css",
    "javascript",
    "typescript",
    "react",
    "next.js",
    "node.js",
    "python",
    "java",
    "php",
    "sql",
    "git",
  ],
  "Design & Creative": [
    "figma",
    "photoshop",
    "illustrator",
    "canva",
    "copywriting",
    "content writing",
    "editing",
  ],
  "Data & Analytics": [
    "data entry",
    "data analysis",
    "data visualization",
    "tableau",
    "power bi",
    "google analytics",
    "seo",
  ],
  "Business Tools": [
    "microsoft office",
    "excel",
    "google workspace",
    "salesforce",
    "hubspot",
    "zendesk",
    "jira",
    "trello",
    "sap",
    "quickbooks",
  ],
  "Domain Skills": [
    "accounting",
    "bookkeeping",
    "payroll",
    "recruitment",
    "project management",
    "quality assurance",
    "technical support",
    "social media management",
    "research",
    "market research",
  ],
};

// ─── Experience level options ───
export const EXPERIENCE_LEVELS = [
  { value: "fresh_graduate", label: "Fresh Graduate" },
  { value: "junior", label: "Junior (1-2 years)" },
  { value: "mid", label: "Mid-level (3-5 years)" },
  { value: "senior", label: "Senior (5+ years)" },
] as const;

// ─── Education level options ───
export const EDUCATION_LEVELS = [
  { value: "high_school", label: "High School" },
  { value: "vocational", label: "Vocational / Associate" },
  { value: "bachelors", label: "Bachelor's Degree" },
  { value: "masters", label: "Master's Degree" },
  { value: "doctorate", label: "Doctorate" },
] as const;

// ─── Work preference options ───
export const WORK_PREFERENCES = [
  { value: "onsite", label: "Onsite" },
  { value: "hybrid", label: "Hybrid" },
  { value: "remote", label: "Remote" },
  { value: "any", label: "Any" },
] as const;

// ─── Employment type options ───
export const EMPLOYMENT_TYPES = [
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "freelance", label: "Freelance" },
  { value: "internship", label: "Internship" },
  { value: "any", label: "Any" },
] as const;

// ─── Salary presets by experience level (monthly PHP) ───
export const SALARY_PRESETS: Record<string, { min: number; max: number }> = {
  fresh_graduate: { min: 18000, max: 25000 },
  junior: { min: 25000, max: 40000 },
  mid: { min: 40000, max: 70000 },
  senior: { min: 70000, max: 120000 },
};

// ─── PH-relevant industry list ───
export const INDUSTRIES = [
  "BPO / Outsourcing",
  "IT / Software",
  "Banking / Finance",
  "Healthcare",
  "Education",
  "Retail / E-commerce",
  "Manufacturing",
  "Real Estate",
  "Telecommunications",
  "Media / Advertising",
  "Government",
  "Hospitality / Tourism",
];
