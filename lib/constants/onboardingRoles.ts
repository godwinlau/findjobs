// Onboarding Revamp Constants — 4-step flow

// ─── Employment type cards (Step 0: "I'm looking for") ───
export const EMPLOYMENT_TYPE_CARDS = [
  { value: "full_time", label: "Full-time job", emoji: "\u{1F4BC}", sub: "Permanent position with a company" },
  { value: "freelance", label: "Freelance / Contract", emoji: "\u26A1", sub: "Project-based or short-term work" },
  { value: "internship", label: "Internship", emoji: "\u{1F393}", sub: "Entry-level or student opportunity" },
  { value: "any", label: "Just browsing", emoji: "\u{1F440}", sub: "Exploring what's out there" },
] as const;

// ─── Popular skills in the Philippines (Step 1: flat pills) ───
export const POPULAR_SKILLS_PH = [
  "React",
  "JavaScript",
  "Figma",
  "Python",
  "Node.js",
  "TypeScript",
  "PHP / Laravel",
  "Java",
  "UI Design",
  "UX Design",
  "Product Design",
  "HTML / CSS",
  "Next.js",
  "React Native",
  "Vue.js",
  "Flutter",
  "Shopify",
  "WordPress",
  "AWS",
  "SQL",
  "Git",
  "Tailwind CSS",
  "Agile / Scrum",
  "Customer Service",
  "Data Analysis",
  "Excel",
  "Google Ads",
  "SEO",
  "Content Writing",
  "Virtual Assistance",
  "Bookkeeping",
  "Social Media Management",
  "Video Editing",
  "Canva",
  "Email Marketing",
] as const;

// ─── Onboarding roles → industry mappings (Step 2) ───
export const ONBOARDING_ROLES = [
  { label: "Product Designer", industries: ["design"] },
  { label: "UI Designer", industries: ["design"] },
  { label: "UX Designer", industries: ["design"] },
  { label: "UX Engineer", industries: ["design", "tech_it"] },
  { label: "Frontend Developer", industries: ["tech_it"] },
  { label: "Full-Stack Developer", industries: ["tech_it"] },
  { label: "Backend Developer", industries: ["tech_it"] },
  { label: "Design Engineer", industries: ["design", "tech_it"] },
  { label: "Mobile Developer", industries: ["tech_it"] },
  { label: "Shopify Developer", industries: ["tech_it"] },
  { label: "Product Manager", industries: ["tech_it"] },
  { label: "Data Analyst", industries: ["tech_it"] },
  { label: "QA Engineer", industries: ["tech_it"] },
  { label: "DevOps", industries: ["tech_it"] },
  { label: "Customer Support", industries: ["bpo"] },
  { label: "Virtual Assistant", industries: ["admin"] },
  { label: "Content Writer", industries: ["sales"] },
  { label: "Social Media Manager", industries: ["sales"] },
  { label: "SEO Specialist", industries: ["sales"] },
  { label: "Bookkeeper", industries: ["accounting"] },
  { label: "Graphic Designer", industries: ["design"] },
  { label: "Video Editor", industries: ["design"] },
] as const;

// ─── Work setup options (Step 2, single-select cards) ───
export const WORK_SETUP_OPTIONS = [
  { value: "remote", label: "Remote", emoji: "\u{1F30D}", sub: "Work from anywhere" },
  { value: "onsite", label: "On-site", emoji: "\u{1F3E2}", sub: "Office-based" },
  { value: "hybrid", label: "Hybrid", emoji: "\u{1F500}", sub: "Mix of both" },
  { value: "any", label: "No preference", emoji: "\u270C\uFE0F", sub: "Show me everything" },
] as const;

// ─── Helper: derive unique industries from selected role labels ───
export function rolesToIndustries(selectedRoles: string[]): string[] {
  const set = new Set<string>();
  for (const role of selectedRoles) {
    const match = ONBOARDING_ROLES.find((r) => r.label === role);
    if (match) {
      for (const ind of match.industries) {
        set.add(ind);
      }
    }
  }
  return Array.from(set);
}
