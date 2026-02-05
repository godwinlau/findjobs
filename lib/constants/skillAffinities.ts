// Skill affinity map: each skill maps to related skills for intelligent suggestions.
// When a user selects a skill, its affinities get +1 score. Top 5 unselected shown.

export const SKILL_AFFINITIES: Record<string, string[]> = {
  // Communication & Soft Skills
  communication: ["teamwork", "leadership", "public speaking", "customer service", "negotiation"],
  teamwork: ["communication", "leadership", "adaptability", "project management", "problem solving"],
  leadership: ["communication", "teamwork", "project management", "negotiation", "problem solving"],
  "problem solving": ["data analysis", "leadership", "adaptability", "research", "teamwork"],
  "time management": ["project management", "adaptability", "trello", "jira", "teamwork"],
  "customer service": ["communication", "problem solving", "zendesk", "salesforce", "negotiation"],
  "public speaking": ["communication", "leadership", "copywriting", "content writing", "negotiation"],
  negotiation: ["communication", "leadership", "public speaking", "customer service", "salesforce"],
  adaptability: ["teamwork", "problem solving", "time management", "communication", "leadership"],

  // Tech & Development
  html: ["css", "javascript", "react", "typescript", "git"],
  css: ["html", "javascript", "figma", "react", "typescript"],
  javascript: ["typescript", "react", "node.js", "html", "css"],
  typescript: ["javascript", "react", "next.js", "node.js", "git"],
  react: ["javascript", "typescript", "next.js", "html", "css"],
  "next.js": ["react", "typescript", "node.js", "javascript", "git"],
  "node.js": ["javascript", "typescript", "next.js", "sql", "git"],
  python: ["data analysis", "sql", "git", "data visualization", "java"],
  java: ["python", "sql", "git", "node.js", "typescript"],
  php: ["sql", "html", "css", "javascript", "git"],
  sql: ["data analysis", "python", "data entry", "excel", "power bi"],
  git: ["javascript", "typescript", "react", "node.js", "python"],

  // Design & Creative
  figma: ["photoshop", "illustrator", "canva", "css", "html"],
  photoshop: ["illustrator", "figma", "canva", "content writing", "copywriting"],
  illustrator: ["photoshop", "figma", "canva", "copywriting", "content writing"],
  canva: ["figma", "photoshop", "social media management", "content writing", "copywriting"],
  copywriting: ["content writing", "editing", "seo", "social media management", "communication"],
  "content writing": ["copywriting", "editing", "seo", "research", "social media management"],
  editing: ["content writing", "copywriting", "communication", "research", "canva"],

  // Data & Analytics
  "data entry": ["excel", "microsoft office", "data analysis", "google workspace", "sql"],
  "data analysis": ["data visualization", "sql", "excel", "python", "power bi"],
  "data visualization": ["data analysis", "tableau", "power bi", "excel", "python"],
  tableau: ["data visualization", "data analysis", "power bi", "sql", "excel"],
  "power bi": ["data visualization", "data analysis", "tableau", "excel", "sql"],
  "google analytics": ["seo", "data analysis", "social media management", "data visualization", "market research"],
  seo: ["google analytics", "content writing", "copywriting", "social media management", "market research"],

  // Business Tools
  "microsoft office": ["excel", "google workspace", "data entry", "communication", "time management"],
  excel: ["data analysis", "data entry", "microsoft office", "power bi", "quickbooks"],
  "google workspace": ["microsoft office", "data entry", "communication", "trello", "time management"],
  salesforce: ["hubspot", "customer service", "communication", "excel", "data entry"],
  hubspot: ["salesforce", "social media management", "seo", "customer service", "communication"],
  zendesk: ["customer service", "communication", "salesforce", "hubspot", "technical support"],
  jira: ["trello", "project management", "git", "quality assurance", "time management"],
  trello: ["jira", "project management", "time management", "google workspace", "teamwork"],
  sap: ["excel", "accounting", "quickbooks", "data entry", "microsoft office"],
  quickbooks: ["accounting", "bookkeeping", "payroll", "excel", "sap"],

  // Domain Skills
  accounting: ["bookkeeping", "payroll", "quickbooks", "excel", "sap"],
  bookkeeping: ["accounting", "payroll", "quickbooks", "excel", "data entry"],
  payroll: ["accounting", "bookkeeping", "quickbooks", "excel", "microsoft office"],
  recruitment: ["communication", "negotiation", "leadership", "hubspot", "salesforce"],
  "project management": ["leadership", "time management", "jira", "trello", "teamwork"],
  "quality assurance": ["technical support", "jira", "problem solving", "data analysis", "git"],
  "technical support": ["customer service", "quality assurance", "zendesk", "problem solving", "communication"],
  "social media management": ["canva", "content writing", "copywriting", "seo", "google analytics"],
  research: ["data analysis", "content writing", "market research", "problem solving", "excel"],
  "market research": ["research", "data analysis", "google analytics", "seo", "excel"],
};
