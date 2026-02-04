// ─── Title-to-Skills Inference ───
// Maps job title patterns to implied skills using canonical names from
// SKILL_TAXONOMY. Ordered most-specific first — first match wins.

export interface TitleSkillPattern {
  pattern: RegExp;
  skills: string[];
}

export const TITLE_SKILL_PATTERNS: TitleSkillPattern[] = [
  // ── Tech: specific frameworks / stacks ──
  {
    pattern: /\breact\b/,
    skills: ["react", "javascript", "typescript", "html", "css", "git", "node.js"],
  },
  {
    pattern: /\bangular\b/,
    skills: ["javascript", "typescript", "html", "css", "git", "node.js"],
  },
  {
    pattern: /\bvue\b/,
    skills: ["javascript", "typescript", "html", "css", "git", "node.js"],
  },
  {
    pattern: /\bnext\.?js\b/,
    skills: ["react", "next.js", "javascript", "typescript", "html", "css", "git", "node.js"],
  },
  {
    pattern: /\bnode\.?js\b/,
    skills: ["node.js", "javascript", "typescript", "git", "sql"],
  },

  // ── Tech: role-based (broader) ──
  {
    pattern: /front[\s-]?end/,
    skills: ["html", "css", "javascript", "react", "typescript", "git"],
  },
  {
    pattern: /back[\s-]?end/,
    skills: ["node.js", "python", "sql", "git", "javascript"],
  },
  {
    pattern: /full[\s-]?stack/,
    skills: ["html", "css", "javascript", "typescript", "react", "node.js", "sql", "git"],
  },
  {
    pattern: /\bweb\s*developer\b|web\s*dev\b/,
    skills: ["html", "css", "javascript", "git", "react"],
  },
  {
    pattern: /\bmobile\s*(app\s*)?developer\b|mobile\s*dev\b|android\s*developer\b|ios\s*developer\b/,
    skills: ["javascript", "react", "git", "typescript"],
  },
  {
    pattern: /\bsoftware\s*(engineer|developer)\b/,
    skills: ["javascript", "python", "git", "sql", "typescript"],
  },
  {
    pattern: /\bdev\s?ops\b|site\s*reliability\b|sre\b/,
    skills: ["git", "python", "sql", "node.js"],
  },
  {
    pattern: /\bqa\b|quality\s*assurance\s*(engineer|analyst|tester)?\b|test\s*(engineer|automation)\b/,
    skills: ["quality assurance", "testing", "sql", "git", "jira"],
  },
  {
    pattern: /\bnetwork\s*(engineer|admin|administrator)\b/,
    skills: ["troubleshooting", "technical support"],
  },

  // ── Design & Creative ──
  {
    pattern: /\bui\s*\/?\s*ux\b|ux\s*\/?\s*ui\b|ux\s*designer\b|ui\s*designer\b|product\s*designer\b/,
    skills: ["figma", "photoshop", "illustrator", "user research", "canva"],
  },
  {
    pattern: /\bgraphic\s*designer\b/,
    skills: ["photoshop", "illustrator", "canva", "figma"],
  },
  {
    pattern: /\bcontent\s*writer\b|copywriter\b|technical\s*writer\b/,
    skills: ["content writing", "copywriting", "editing", "seo"],
  },

  // ── Data ──
  {
    pattern: /\bdata\s*analyst\b/,
    skills: ["data analysis", "excel", "sql", "data visualization", "power bi", "google analytics"],
  },
  {
    pattern: /\bbusiness\s*analyst\b/,
    skills: ["data analysis", "excel", "sql", "project management", "jira"],
  },
  {
    pattern: /\bfinancial\s*analyst\b/,
    skills: ["data analysis", "excel", "accounting", "data visualization"],
  },
  {
    pattern: /\bdata\s*(engineer|scientist)\b/,
    skills: ["python", "sql", "data analysis", "data visualization", "git"],
  },

  // ── BPO / Support ──
  {
    pattern: /\bcustomer\s*service\s*representative\b|\bcsr\b/,
    skills: ["customer service", "communication", "microsoft office", "zendesk"],
  },
  {
    pattern: /\bcall\s*center\b/,
    skills: ["customer service", "communication", "time management", "microsoft office"],
  },
  {
    pattern: /\btech(nical)?\s*support\b|help\s*desk\b|it\s*support\b/,
    skills: ["technical support", "troubleshooting", "communication", "microsoft office"],
  },
  {
    pattern: /\bvirtual\s*assistant\b/,
    skills: ["microsoft office", "google workspace", "communication", "time management", "data entry"],
  },

  // ── Business / Admin ──
  {
    pattern: /\badmin(istrative)?\s*assistant\b|office\s*assistant\b/,
    skills: ["microsoft office", "data entry", "communication", "time management", "google workspace"],
  },
  {
    pattern: /\bproject\s*manager\b/,
    skills: ["project management", "jira", "trello", "communication", "leadership"],
  },
  {
    pattern: /\bproduct\s*manager\b/,
    skills: ["project management", "data analysis", "communication", "jira", "leadership"],
  },
  {
    pattern: /\bsocial\s*media\b/,
    skills: ["social media management", "canva", "content writing", "copywriting", "seo"],
  },
  {
    pattern: /\bdigital\s*market(ing|er)\b/,
    skills: ["seo", "google analytics", "social media management", "content writing", "canva"],
  },
  {
    pattern: /\brecruiter\b|talent\s*acquisition\b/,
    skills: ["recruitment", "communication", "negotiation", "microsoft office"],
  },
  {
    pattern: /\bhr\b|human\s*resources?\b/,
    skills: ["recruitment", "communication", "microsoft office", "leadership"],
  },

  // ── Finance ──
  {
    pattern: /\baccountant\b/,
    skills: ["accounting", "excel", "quickbooks", "bookkeeping"],
  },
  {
    pattern: /\bbookkeeper\b/,
    skills: ["bookkeeping", "excel", "quickbooks", "accounting"],
  },
  {
    pattern: /\bpayroll\b/,
    skills: ["payroll", "excel", "accounting", "microsoft office"],
  },

  // ── Operations / Other ──
  {
    pattern: /\bdata\s*entry\b/,
    skills: ["data entry", "microsoft office", "excel", "time management"],
  },
  {
    pattern: /\boperations\s*(manager|coordinator|associate)?\b/,
    skills: ["project management", "microsoft office", "communication", "leadership"],
  },
  {
    pattern: /\bsales\b/,
    skills: ["communication", "negotiation", "salesforce", "customer service"],
  },
];

// ─── Skill Aliases ───
// Normalizes common skill name variations to canonical forms used in
// SKILL_TAXONOMY. Applied to both job and profile skills before comparison.

export const SKILL_ALIASES: Record<string, string> = {
  // JavaScript variants
  js: "javascript",
  ecmascript: "javascript",
  es6: "javascript",
  es2015: "javascript",

  // TypeScript variants
  ts: "typescript",

  // React variants
  reactjs: "react",
  "react.js": "react",
  "react js": "react",

  // Node.js variants
  nodejs: "node.js",
  node: "node.js",
  "node js": "node.js",

  // Next.js variants
  nextjs: "next.js",
  "next js": "next.js",

  // Python variants
  python3: "python",

  // PHP variants
  laravel: "php",

  // SQL variants
  mysql: "sql",
  postgresql: "sql",
  postgres: "sql",

  // Microsoft Office variants
  "ms office": "microsoft office",
  "ms word": "microsoft office",
  msoffice: "microsoft office",
  "office 365": "microsoft office",
  "microsoft 365": "microsoft office",

  // Excel variants
  "ms excel": "excel",
  "google sheets": "excel",

  // Design tool variants
  "adobe photoshop": "photoshop",
  "adobe illustrator": "illustrator",
  ps: "photoshop",
  ai: "illustrator",
  xd: "figma",
  "adobe xd": "figma",
  sketch: "figma",

  // QA variants
  qa: "quality assurance",
  "qa testing": "quality assurance",
  "quality assurance testing": "quality assurance",

  // Project management variants
  pm: "project management",
  pmp: "project management",

  // Communication variants
  "interpersonal skills": "communication",

  // Git variants
  github: "git",
  gitlab: "git",
  "version control": "git",

  // Google Workspace variants
  gsuite: "google workspace",
  "g suite": "google workspace",
  "google apps": "google workspace",

  // SEO variants
  "search engine optimization": "seo",

  // Misc
  crm: "salesforce",
  "customer relationship management": "salesforce",
};
