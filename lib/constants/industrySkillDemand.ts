// Industry → Skill demand mapping
// Each skill has a demand weight (0-100) representing how important it is for that industry.
// Keys use lowercase canonical names from PRD taxonomy (matched via normalize()).
// Includes both work category keys and legacy industry names for backward compat.

const _bpo: Record<string, number> = {
  "customer service (voice)": 95, "customer service (non-voice)": 90, "english proficiency": 85,
  "live chat support": 80, "email support": 80, "typing speed (50+ wpm)": 75,
  "zendesk": 70, "crm management": 65, "salesforce service cloud": 60,
  "data entry": 60, "conflict resolution": 50, "content moderation": 45,
  "ticketing systems": 55, "neutral english accent": 45,
};

const _techIt: Record<string, number> = {
  "javascript": 90, "react": 85, "typescript": 80, "git": 75, "node.js": 70,
  "css": 65, "html": 65, "next.js": 60, "python": 60, "sql": 70, "java": 55,
  "php": 40, "docker": 50, "aws": 55, "rest api development": 60,
  "tailwind css": 45, "agile / scrum": 50, "ci/cd pipelines": 45,
  "figma": 40, "unit testing": 50,
};

const _bankingFinance: Record<string, number> = {
  "excel (advanced)": 90, "microsoft office suite": 85, "bookkeeping": 85,
  "quickbooks": 75, "financial analysis": 80, "payroll processing": 65,
  "tax preparation (ph)": 60, "sap": 60, "accounts payable / receivable": 70,
  "budgeting & forecasting": 65, "financial reporting": 70, "sql": 40,
  "power bi": 45, "data entry": 55, "auditing": 50, "bank reconciliation": 45,
};

const _healthcare: Record<string, number> = {
  "nursing (rn license)": 90, "electronic health records (ehr)": 85,
  "hipaa compliance": 80, "medical coding (icd-10)": 75, "medical billing": 70,
  "caregiving": 65, "first aid / bls": 60, "telemedicine support": 55,
  "medical transcription": 50, "data entry": 45, "english proficiency": 40,
};

const _education: Record<string, number> = {
  "teaching (k-12)": 90, "esl / tesol teaching": 85, "curriculum development": 75,
  "online tutoring": 70, "instructional design": 65,
  "lms administration (moodle/canvas)": 60, "academic writing": 55,
  "e-learning content creation": 50, "canva": 45, "google workspace": 50,
  "microsoft office suite": 45, "assessment design": 40,
};

const _retailEcommerce: Record<string, number> = {
  "e-commerce management": 90, "social media management": 80, "facebook/meta ads": 75,
  "google ads (sem)": 70, "seo": 65, "shopify marketing": 60, "content writing": 55,
  "copywriting": 55, "google analytics": 65, "canva": 50, "email marketing": 50,
  "inventory management": 55, "market research": 55,
};

const _manufacturing: Record<string, number> = {
  "excel (advanced)": 75, "data entry": 70, "quality control / inspection": 80,
  "sap": 65, "microsoft office suite": 60, "six sigma / lean": 70,
  "safety management (osha)": 65, "supply chain management": 55,
  "project management (construction)": 50, "autocad": 45,
};

const _admin: Record<string, number> = {
  "microsoft office suite": 90, "excel (advanced)": 85, "google workspace": 75,
  "data entry": 80, "calendar management": 70, "email management": 65,
  "project management (asana/trello)": 60, "document formatting": 55,
  "notion": 45, "slack / teams communication": 50, "time management": 60,
  "research & reporting": 55, "client communication": 50,
};

const _sales: Record<string, number> = {
  "lead generation": 90, "cold calling": 85, "negotiation": 85,
  "salesforce crm": 70, "b2b sales": 75, "b2c sales": 65,
  "account management": 70, "cold emailing": 60, "linkedin outreach": 55,
  "sales presentation": 60, "proposal writing": 50, "crm management": 55,
  "social media management": 45, "hubspot": 50,
};

const _design: Record<string, number> = {
  "figma": 85, "adobe photoshop": 70, "adobe illustrator": 65, "canva": 75,
  "ui design": 80, "ux design": 80, "brand identity design": 55,
  "adobe premiere pro": 50, "adobe after effects": 45, "typography": 40,
  "wireframing & prototyping": 60, "design systems": 50, "responsive design": 45,
};

const _skilledTrade: Record<string, number> = {
  "warehouse management": 80, "supply chain management": 75, "inventory management": 70,
  "electrical installation": 65, "welding": 60, "plumbing": 55,
  "hvac installation & repair": 55, "automotive repair": 50, "forklift operation": 60,
  "safety management (osha)": 70, "quality control / inspection": 65,
  "procurement": 50, "shipping / freight coordination": 55,
};

export const industrySkillDemand: Record<string, Record<string, number>> = {
  // ── New work category keys ──
  tech_it: _techIt,
  bpo: _bpo,
  admin: _admin,
  sales: _sales,
  design: _design,
  accounting: _bankingFinance,
  healthcare: _healthcare,
  education: _education,
  skilled_trade: _skilledTrade,
  other: {
    "time management": 50, "client communication": 50, "microsoft office suite": 40,
    "google workspace": 40, "english proficiency": 50, "research & reporting": 40,
  },

  // ── Legacy industry keys (backward compat) ──
  "BPO / Outsourcing": _bpo,
  "IT / Software": _techIt,
  "Banking / Finance": _bankingFinance,
  Healthcare: _healthcare,
  Education: _education,
  "Retail / E-commerce": _retailEcommerce,
  Manufacturing: _manufacturing,
  "Real Estate": {
    "negotiation": 85, "lead generation": 80, "sales presentation": 70,
    "account management": 65, "salesforce crm": 55, "social media management": 50,
    "canva": 45, "excel (advanced)": 55, "proposal writing": 50,
    "cold calling": 50, "market research": 55,
  },
  Telecommunications: {
    "customer service (voice)": 85, "english proficiency": 80, "technical support": 75,
    "zendesk": 55, "crm management": 50, "sql": 50,
    "data entry": 45, "ticketing systems": 55, "live chat support": 50,
  },
  "Media / Advertising": {
    "canva": 80, "figma": 70, "copywriting": 85, "content writing": 80,
    "social media management": 90, "google analytics": 65, "seo": 60,
    "adobe photoshop": 55, "adobe illustrator": 50, "facebook/meta ads": 65,
    "market research": 50, "video thumbnails & banners": 40,
  },
  Government: {
    "microsoft office suite": 80, "data entry": 70,
    "excel (advanced)": 65, "google workspace": 45,
    "bookkeeping": 40, "time management": 50,
    "research & reporting": 55, "project management (asana/trello)": 40,
    "english proficiency": 50,
  },
  "Hospitality / Tourism": {
    "customer service (voice)": 95, "english proficiency": 90,
    "time management": 65, "conflict resolution": 55,
    "microsoft office suite": 40, "social media management": 45, "canva": 35,
    "negotiation": 30,
  },
};
