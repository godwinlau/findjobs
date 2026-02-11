// ─── Role Category Gate ───
// Hard-filters irrelevant jobs based on profile headline → role category matching.
// Also computes a negative signal penalty for skill mismatches.

// ─── Role Categories ───

export const ROLE_CATEGORIES = [
  "product-design",
  "frontend-dev",
  "backend-dev",
  "fullstack-dev",
  "graphic-design",
  "mobile-dev",
  "data-analytics",
  "devops",
  "bpo-support",
  "virtual-assistant",
  "marketing",
  "sales",
  "finance",
  "project-management",
] as const;

export type RoleCategory = (typeof ROLE_CATEGORIES)[number];

// ─── Title → Category classification ───

const CATEGORY_PATTERNS: { category: RoleCategory; patterns: RegExp[] }[] = [
  {
    category: "product-design",
    patterns: [
      /\bproduct\s*design/i,
      /\bui\s*\/?\s*ux/i,
      /\bux\s*design/i,
      /\bui\s*design/i,
      /\buser\s*experience/i,
      /\buser\s*interface/i,
      /\binteraction\s*design/i,
      /\bux\s*engineer/i,
    ],
  },
  {
    category: "frontend-dev",
    patterns: [
      /\bfront[\s-]?end/i,
      /\breact\b(?!.*native)/i,
      /\bvue\.?js/i,
      /\bangular/i,
      /\bnext\.?js/i,
      /\bweb\s*developer/i,
    ],
  },
  {
    category: "backend-dev",
    patterns: [
      /\bback[\s-]?end/i,
      /\bnode\.?js\s*developer/i,
      /\bpython\s*developer/i,
      /\bjava\s*developer\b(?!.*script)/i,
      /\b\.net\s*developer/i,
      /\bphp\s*developer/i,
      /\bruby\s*developer/i,
      /\blaravel\s*developer/i,
      /\bdjango\s*developer/i,
    ],
  },
  {
    category: "fullstack-dev",
    patterns: [
      /\bfull[\s-]?stack/i,
      /\bsoftware\s*(?:engineer|developer)/i,
      /\bdesign\s*engineer/i,
      /\bshopify/i,
      /\bqa\s*(?:engineer|tester|analyst)/i,
    ],
  },
  {
    category: "graphic-design",
    patterns: [
      /\bgraphic\s*design/i,
      /\billustrat/i,
      /\bvisual\s*design/i,
      /\bmotion\s*(?:design|graphic)/i,
      /\bprint\s*design/i,
      /\bbrand\s*design/i,
      /\bvideo\s*edit/i,
    ],
  },
  {
    category: "mobile-dev",
    patterns: [
      /\bmobile\s*(?:developer|engineer|dev)/i,
      /\breact\s*native/i,
      /\bflutter/i,
      /\bios\s*developer/i,
      /\bandroid\s*developer/i,
      /\bswift\s*developer/i,
      /\bkotlin\s*developer/i,
    ],
  },
  {
    category: "data-analytics",
    patterns: [
      /\bdata\s*(?:analyst|scientist|engineer)/i,
      /\banalytics/i,
      /\bmachine\s*learning/i,
      /\bai\s*engineer/i,
      /\bbi\s*(?:analyst|developer|engineer)/i,
    ],
  },
  {
    category: "devops",
    patterns: [
      /\bdevops/i,
      /\bsre\b/i,
      /\bsite\s*reliability/i,
      /\bcloud\s*engineer/i,
      /\binfrastructure\s*engineer/i,
      /\bplatform\s*engineer/i,
    ],
  },
  {
    category: "bpo-support",
    patterns: [
      /\bcustomer\s*(?:service|support)/i,
      /\bcall\s*center/i,
      /\bbpo\b/i,
      /\btechnical\s*support/i,
      /\bhelp\s*desk/i,
      /\bservice\s*desk/i,
    ],
  },
  {
    category: "virtual-assistant",
    patterns: [
      /\bvirtual\s*assistant/i,
      /\bexecutive\s*assistant/i,
      /\badmin\s*assistant/i,
      /\bpersonal\s*assistant/i,
    ],
  },
  {
    category: "marketing",
    patterns: [
      /\bmarket(?:ing|er)/i,
      /\bseo\b/i,
      /\bcontent\s*(?:writer|strategist|creator|manager)/i,
      /\bsocial\s*media/i,
      /\bcopywriter/i,
      /\bdigital\s*market/i,
      /\bemail\s*market/i,
    ],
  },
  {
    category: "sales",
    patterns: [
      /\bsales\b/i,
      /\bbusiness\s*develop/i,
      /\baccount\s*(?:executive|manager)/i,
      /\blead\s*gen/i,
    ],
  },
  {
    category: "finance",
    patterns: [
      /\bfinance/i,
      /\baccountant/i,
      /\baccounting/i,
      /\bbookkeeper/i,
      /\bpayroll/i,
      /\bauditor/i,
      /\btax\b/i,
    ],
  },
  {
    category: "project-management",
    patterns: [
      /\bproject\s*manager/i,
      /\bscrum\s*master/i,
      /\bproduct\s*(?:manager|owner)/i,
      /\bprogram\s*manager/i,
      /\bagile\s*(?:coach|lead)/i,
    ],
  },
];

/**
 * Classify a job title into a role category.
 * Returns null for unclassifiable titles.
 */
export function getRoleCategory(title: string): RoleCategory | null {
  if (!title) return null;
  for (const { category, patterns } of CATEGORY_PATTERNS) {
    for (const pattern of patterns) {
      if (pattern.test(title)) return category;
    }
  }
  return null;
}

// ─── Role category compatibility ───
// Some categories are related enough that cross-matches are acceptable.

const COMPATIBLE_CATEGORIES: Record<RoleCategory, RoleCategory[]> = {
  "product-design": ["frontend-dev"],
  "frontend-dev": ["fullstack-dev", "product-design"],
  "backend-dev": ["fullstack-dev", "devops"],
  "fullstack-dev": ["frontend-dev", "backend-dev"],
  "graphic-design": ["marketing"],
  "mobile-dev": ["frontend-dev", "fullstack-dev"],
  "data-analytics": ["backend-dev", "devops"],
  "devops": ["backend-dev", "data-analytics"],
  "bpo-support": ["virtual-assistant"],
  "virtual-assistant": ["bpo-support", "project-management"],
  "marketing": ["sales", "graphic-design"],
  "sales": ["marketing", "bpo-support"],
  "finance": [],
  "project-management": ["virtual-assistant"],
};

/**
 * Filter jobs to keep only those matching the user's role category.
 * Unclassified jobs (null category) pass through.
 * Unclassified profiles pass all jobs through (no filtering).
 */
export function filterByRoleCategory<T extends { title: string }>(
  jobs: T[],
  profileHeadline: string | null
): T[] {
  const userCategory = getRoleCategory(profileHeadline ?? "");
  if (!userCategory) return jobs; // Can't classify user → no filtering

  const compatible = new Set<RoleCategory>([
    userCategory,
    ...COMPATIBLE_CATEGORIES[userCategory],
  ]);

  return jobs.filter((job) => {
    const jobCategory = getRoleCategory(job.title);
    if (!jobCategory) return true; // Can't classify job → let it through
    return compatible.has(jobCategory);
  });
}

// ─── Skill exclusion / negative signal penalty ───
// Skills that signal a DIFFERENT role from the user's headline.

const ROLE_EXCLUSION_MAP: Record<string, string[]> = {
  "product-design": [
    "illustrator", "print design", "brand identity", "packaging design",
    "editorial design", "typography", "calligraphy",
  ],
  "graphic-design": [
    "wireframing", "user research", "usability testing",
    "information architecture", "prototyping",
  ],
  "frontend-dev": [
    "database administration", "devops", "kubernetes", "terraform",
    "ansible", "jenkins",
  ],
  "backend-dev": [
    "figma", "sketch", "adobe xd", "css animations",
    "responsive design",
  ],
  "bpo-support": [
    "javascript", "python", "react", "node.js", "postgresql",
    "machine learning",
  ],
  "virtual-assistant": [
    "javascript", "python", "react", "data modeling",
    "machine learning", "system design",
  ],
  "marketing": [
    "javascript", "python", "react", "node.js", "postgresql",
    "system design",
  ],
  "finance": [
    "javascript", "python", "react", "figma", "adobe photoshop",
    "machine learning",
  ],
};

const PENALTY_PER_EXCLUSION = 0.15;
const MAX_PENALTY = 0.5;

/**
 * Compute a penalty (0.0 - 0.5) based on how many of the job's skills
 * are exclusion signals for the user's role category.
 */
export function computeSkillMismatchPenalty(
  profileHeadline: string | null,
  jobSkills: string[]
): number {
  const userCategory = getRoleCategory(profileHeadline ?? "");
  if (!userCategory) return 0;

  const exclusions = ROLE_EXCLUSION_MAP[userCategory];
  if (!exclusions || exclusions.length === 0) return 0;

  const exclusionSet = new Set(exclusions.map((s) => s.toLowerCase()));
  const normalizedJobSkills = jobSkills.map((s) => s.toLowerCase());

  let hits = 0;
  for (const skill of normalizedJobSkills) {
    if (exclusionSet.has(skill)) hits++;
  }

  return Math.min(hits * PENALTY_PER_EXCLUSION, MAX_PENALTY);
}

/**
 * Score penalty for jobs whose title can't be classified into any role category.
 * Only applies when the user's profile has a classifiable headline.
 * Returns a flat penalty (e.g. 15 points) to demote unclassified jobs below
 * classified matches without hiding them entirely.
 */
const UNCLASSIFIED_JOB_PENALTY = 15;

export function computeUnclassifiedJobPenalty(
  profileHeadline: string | null,
  jobTitle: string
): number {
  const userCategory = getRoleCategory(profileHeadline ?? "");
  if (!userCategory) return 0; // User is unclassified → no penalty
  const jobCategory = getRoleCategory(jobTitle);
  if (jobCategory) return 0; // Job is classified → no penalty
  return UNCLASSIFIED_JOB_PENALTY;
}
