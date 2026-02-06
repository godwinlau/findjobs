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
    skills: ["React", "JavaScript", "TypeScript", "HTML", "CSS", "Git", "Node.js"],
  },
  {
    pattern: /\bangular\b/,
    skills: ["Angular", "TypeScript", "JavaScript", "HTML", "CSS", "Git", "Node.js"],
  },
  {
    pattern: /\bvue\b/,
    skills: ["Vue.js", "JavaScript", "TypeScript", "HTML", "CSS", "Git", "Node.js"],
  },
  {
    pattern: /\bnext\.?js\b/,
    skills: ["React", "Next.js", "JavaScript", "TypeScript", "HTML", "CSS", "Git", "Node.js"],
  },
  {
    pattern: /\bnode\.?js\b/,
    skills: ["Node.js", "JavaScript", "TypeScript", "Git", "SQL"],
  },
  {
    pattern: /\blaravel\b/,
    skills: ["Laravel", "PHP", "MySQL", "SQL", "Git", "REST API Development"],
  },
  {
    pattern: /\bflutter\b/,
    skills: ["Flutter", "Firebase", "Git", "REST API Development"],
  },
  {
    pattern: /\breact\s*native\b/,
    skills: ["React Native", "React", "TypeScript", "JavaScript", "Git"],
  },

  // ── Tech: role-based (broader) ──
  {
    pattern: /front[\s-]?end/,
    skills: ["HTML", "CSS", "JavaScript", "React", "TypeScript", "Git", "Tailwind CSS"],
  },
  {
    pattern: /back[\s-]?end/,
    skills: ["Node.js", "Python", "SQL", "Git", "REST API Development", "Docker"],
  },
  {
    pattern: /full[\s-]?stack/,
    skills: ["HTML", "CSS", "JavaScript", "TypeScript", "React", "Node.js", "SQL", "Git", "Docker"],
  },
  {
    pattern: /\bweb\s*developer\b|web\s*dev\b/,
    skills: ["HTML", "CSS", "JavaScript", "Git", "React"],
  },
  {
    pattern: /\bmobile\s*(app\s*)?developer\b|mobile\s*dev\b|android\s*developer\b|ios\s*developer\b/,
    skills: ["React Native", "Flutter", "Git", "TypeScript", "Firebase"],
  },
  {
    pattern: /\bsoftware\s*(engineer|developer)\b/,
    skills: ["JavaScript", "Python", "Git", "SQL", "TypeScript", "Docker"],
  },
  {
    pattern: /\bdev\s?ops\b|site\s*reliability\b|sre\b/,
    skills: ["Docker", "AWS", "CI/CD Pipelines", "Linux / CLI", "Git", "Kubernetes", "Terraform"],
  },
  {
    pattern: /\bqa\b|quality\s*assurance\s*(engineer|analyst|tester)?\b|test\s*(engineer|automation)\b/,
    skills: ["Unit Testing", "Agile / Scrum", "SQL", "Git"],
  },
  {
    pattern: /\bnetwork\s*(engineer|admin|administrator)\b/,
    skills: ["Linux / CLI", "AWS", "Cybersecurity Basics", "Technical Support"],
  },
  {
    pattern: /\bdata\s*engineer\b/,
    skills: ["Python", "SQL", "ETL / Data Pipelines", "BigQuery", "Docker", "Git"],
  },
  {
    pattern: /\bdata\s*scientist\b/,
    skills: ["Python (Data Science)", "Machine Learning (Basics)", "SQL (Data Analysis)", "Pandas / NumPy", "Statistical Analysis"],
  },
  {
    pattern: /\bml\s*engineer\b|machine\s*learning\s*engineer\b/,
    skills: ["Python (Data Science)", "Machine Learning (Basics)", "Deep Learning", "Docker", "AWS"],
  },
  {
    pattern: /\bcloud\s*(engineer|architect)\b/,
    skills: ["AWS", "Docker", "Kubernetes", "Terraform", "CI/CD Pipelines", "Linux / CLI"],
  },

  // ── Design & Creative ──
  {
    pattern: /\bui\s*\/?\s*ux\b|ux\s*\/?\s*ui\b|ux\s*designer\b|ui\s*designer\b|product\s*designer\b/,
    skills: ["Figma", "UI Design", "UX Design", "UX Research", "Wireframing & Prototyping"],
  },
  {
    pattern: /\bgraphic\s*designer\b/,
    skills: ["Adobe Photoshop", "Adobe Illustrator", "Canva", "Figma", "Brand Identity Design"],
  },
  {
    pattern: /\bmotion\s*(graphics?\s*)?(designer|artist)\b/,
    skills: ["Adobe After Effects", "Adobe Premiere Pro", "Lottie / Micro-animations", "Figma"],
  },
  {
    pattern: /\bvideo\s*(editor|producer)\b/,
    skills: ["Adobe Premiere Pro", "Adobe After Effects", "DaVinci Resolve", "CapCut"],
  },
  {
    pattern: /\bweb\s*designer\b/,
    skills: ["Figma", "HTML", "CSS", "UI Design", "Responsive Design", "Canva"],
  },
  {
    pattern: /\bcontent\s*writer\b|copywriter\b/,
    skills: ["Content Writing", "Copywriting", "SEO", "Blog Writing"],
  },
  {
    pattern: /\btechnical\s*writer\b/,
    skills: ["Technical Writing", "Content Writing", "REST API Development"],
  },

  // ── Data ──
  {
    pattern: /\bdata\s*analyst\b/,
    skills: ["SQL (Data Analysis)", "Excel (Advanced)", "Power BI", "Tableau", "Google Analytics", "Data Cleaning & Wrangling"],
  },
  {
    pattern: /\bbusiness\s*analyst\b/,
    skills: ["SQL (Data Analysis)", "Excel (Advanced)", "Power BI", "Business Intelligence", "Agile / Scrum"],
  },
  {
    pattern: /\bfinancial\s*analyst\b/,
    skills: ["Financial Analysis", "Excel (Advanced)", "Financial Modeling", "Power BI", "Budgeting & Forecasting"],
  },
  {
    pattern: /\bbi\s*(analyst|developer|engineer)\b|business\s*intelligence\b/,
    skills: ["Power BI", "Tableau", "SQL (Data Analysis)", "Business Intelligence", "ETL / Data Pipelines"],
  },

  // ── BPO / Support ──
  {
    pattern: /\bcustomer\s*service\s*representative\b|\bcsr\b/,
    skills: ["Customer Service (Voice)", "English Proficiency", "CRM Management", "Zendesk"],
  },
  {
    pattern: /\bcall\s*center\b/,
    skills: ["Customer Service (Voice)", "English Proficiency", "Neutral English Accent", "CRM Management"],
  },
  {
    pattern: /\bchat\s*support\b/,
    skills: ["Live Chat Support", "Customer Service (Non-Voice)", "Typing Speed (50+ WPM)", "Zendesk"],
  },
  {
    pattern: /\btech(nical)?\s*support\b|help\s*desk\b|it\s*support\b/,
    skills: ["Technical Support", "Zendesk", "Ticketing Systems", "English Proficiency"],
  },
  {
    pattern: /\bcontent\s*moderator\b|trust\s*(&|and)\s*safety\b/,
    skills: ["Content Moderation", "English Proficiency", "Typing Speed (50+ WPM)", "Quality Assurance (BPO)"],
  },
  {
    pattern: /\bvirtual\s*assistant\b/,
    skills: ["Microsoft Office Suite", "Google Workspace", "Calendar Management", "Email Management", "Time Management"],
  },
  {
    pattern: /\bexecutive\s*assistant\b/,
    skills: ["Calendar Management", "Email Management", "Travel Arrangements", "Microsoft Office Suite", "Slack / Teams Communication"],
  },

  // ── Business / Admin / PM ──
  {
    pattern: /\badmin(istrative)?\s*assistant\b|office\s*assistant\b/,
    skills: ["Microsoft Office Suite", "Data Entry", "Email Management", "Calendar Management", "Document Formatting"],
  },
  {
    pattern: /\bproject\s*manager\b/,
    skills: ["Project Management (Asana/Trello)", "Agile / Scrum", "Slack / Teams Communication", "Notion"],
  },
  {
    pattern: /\bproduct\s*manager\b/,
    skills: ["Agile / Scrum", "SQL (Data Analysis)", "Figma", "A/B Testing"],
  },
  {
    pattern: /\bsocial\s*media\b/,
    skills: ["Social Media Management", "Canva", "Content Writing", "Hootsuite / Buffer", "Facebook/Meta Ads"],
  },
  {
    pattern: /\bdigital\s*market(ing|er)\b/,
    skills: ["SEO", "Google Analytics", "Google Ads (SEM)", "Facebook/Meta Ads", "Social Media Management"],
  },
  {
    pattern: /\bseo\s*(specialist|analyst|manager)\b/,
    skills: ["SEO", "Google Analytics", "Semrush / Ahrefs", "Content Writing", "Google Tag Manager"],
  },
  {
    pattern: /\bemail\s*market(ing|er)\b/,
    skills: ["Email Marketing", "Mailchimp", "Copywriting", "HubSpot", "A/B Testing"],
  },
  {
    pattern: /\brecruiter\b|talent\s*acquisition\b/,
    skills: ["LinkedIn Outreach", "English Proficiency", "Negotiation", "Microsoft Office Suite"],
  },
  {
    pattern: /\bhr\b|human\s*resources?\b/,
    skills: ["Microsoft Office Suite", "Payroll Processing", "English Proficiency", "Negotiation"],
  },
  {
    pattern: /\bcommunity\s*manager\b/,
    skills: ["Community Management", "Social Media Management", "Content Writing", "Content Moderation"],
  },

  // ── Finance ──
  {
    pattern: /\baccountant\b/,
    skills: ["Bookkeeping", "Excel (Advanced)", "QuickBooks", "Tax Preparation (PH)", "Financial Reporting"],
  },
  {
    pattern: /\bbookkeeper\b/,
    skills: ["Bookkeeping", "QuickBooks", "Xero", "Excel (Advanced)", "Accounts Payable / Receivable"],
  },
  {
    pattern: /\bpayroll\b/,
    skills: ["Payroll Processing", "Excel (Advanced)", "QuickBooks", "Tax Preparation (PH)"],
  },
  {
    pattern: /\bauditor\b/,
    skills: ["Auditing", "Compliance & Regulatory", "Financial Reporting", "Excel (Advanced)"],
  },

  // ── Sales ──
  {
    pattern: /\bsales\s*(representative|associate|agent)\b/,
    skills: ["Cold Calling", "Negotiation", "Lead Generation", "Salesforce CRM", "B2C Sales"],
  },
  {
    pattern: /\baccount\s*(executive|manager)\b/,
    skills: ["Account Management", "B2B Sales", "Negotiation", "Salesforce CRM", "Proposal Writing"],
  },
  {
    pattern: /\bbdr\b|business\s*development\s*representative\b/,
    skills: ["Lead Generation", "Cold Calling", "Cold Emailing", "LinkedIn Outreach", "Salesforce CRM"],
  },
  {
    pattern: /\binside\s*sales\b/,
    skills: ["Cold Calling", "Lead Generation", "Salesforce CRM", "Negotiation", "B2B Sales"],
  },
  {
    pattern: /\btelemarketing\b|telesales\b/,
    skills: ["Telemarketing", "Cold Calling", "Neutral English Accent", "Upselling / Cross-selling"],
  },
  {
    pattern: /\breal\s*estate\b/,
    skills: ["Real Estate Sales", "Negotiation", "Sales Presentation", "Lead Generation"],
  },

  // ── Engineering ──
  {
    pattern: /\bcivil\s*engineer\b/,
    skills: ["Civil Engineering", "AutoCAD", "Revit", "Structural Analysis", "Project Management (Construction)"],
  },
  {
    pattern: /\belectrical\s*engineer\b/,
    skills: ["Electrical Engineering", "AutoCAD", "PLC Programming", "Electronics / PCB Design"],
  },
  {
    pattern: /\bmechanical\s*engineer\b/,
    skills: ["Mechanical Engineering", "SolidWorks", "AutoCAD", "MATLAB", "HVAC Design"],
  },
  {
    pattern: /\bsite\s*(supervisor|manager|engineer)\b/,
    skills: ["Project Management (Construction)", "Safety Management (OSHA)", "Quality Control / Inspection", "AutoCAD"],
  },

  // ── Healthcare ──
  {
    pattern: /\bnurse\b|registered\s*nurse\b|\brn\b/,
    skills: ["Nursing (RN License)", "Electronic Health Records (EHR)", "HIPAA Compliance", "First Aid / BLS"],
  },
  {
    pattern: /\bpharmacist\b/,
    skills: ["Pharmacy", "HIPAA Compliance", "Electronic Health Records (EHR)"],
  },
  {
    pattern: /\bcaregiver\b/,
    skills: ["Caregiving", "First Aid / BLS", "Nursing (RN License)"],
  },
  {
    pattern: /\bmedical\s*coder\b|medical\s*coding\b/,
    skills: ["Medical Coding (ICD-10)", "Medical Billing", "Electronic Health Records (EHR)", "HIPAA Compliance"],
  },
  {
    pattern: /\bmedical\s*biller\b|medical\s*billing\b/,
    skills: ["Medical Billing", "Medical Coding (ICD-10)", "Electronic Health Records (EHR)"],
  },

  // ── Education ──
  {
    pattern: /\bteacher\b|instructor\b/,
    skills: ["Teaching (K-12)", "Curriculum Development", "LMS Administration (Moodle/Canvas)"],
  },
  {
    pattern: /\besl\b|tesol\b|english\s*tutor\b/,
    skills: ["ESL / TESOL Teaching", "English Proficiency", "Online Tutoring"],
  },
  {
    pattern: /\bonline\s*tutor\b|\btutor\b/,
    skills: ["Online Tutoring", "Teaching (K-12)", "ESL / TESOL Teaching"],
  },
  {
    pattern: /\binstructional\s*designer\b/,
    skills: ["Instructional Design", "E-Learning Content Creation", "LMS Administration (Moodle/Canvas)"],
  },
  {
    pattern: /\bcorporate\s*trainer\b/,
    skills: ["Corporate Training", "Instructional Design", "Presentation Design"],
  },

  // ── Trades & Logistics ──
  {
    pattern: /\bwarehouse\s*(supervisor|manager|associate)\b/,
    skills: ["Warehouse Management", "Inventory Management", "Forklift Operation", "Supply Chain Management"],
  },
  {
    pattern: /\blogistics\s*(coordinator|manager|specialist)\b/,
    skills: ["Supply Chain Management", "Warehouse Management", "Shipping / Freight Coordination", "Procurement"],
  },
  {
    pattern: /\belectrician\b/,
    skills: ["Electrical Installation", "Safety Management (OSHA)", "Electrical Engineering"],
  },
  {
    pattern: /\bwelder\b/,
    skills: ["Welding", "Safety Management (OSHA)", "Quality Control / Inspection"],
  },
  {
    pattern: /\bplumber\b/,
    skills: ["Plumbing", "Safety Management (OSHA)", "HVAC Installation & Repair"],
  },
  {
    pattern: /\bdelivery\s*driver\b|courier\b/,
    skills: ["Delivery / Courier Services", "Last-Mile Logistics (Lazada/Shopee)", "Time Management"],
  },

  // ── Operations / Other (broad catch-alls) ──
  {
    pattern: /\bdata\s*entry\b/,
    skills: ["Data Entry", "Typing Speed (50+ WPM)", "Microsoft Office Suite", "Excel (Advanced)"],
  },
  {
    pattern: /\boperations\s*(manager|coordinator|associate)?\b/,
    skills: ["Project Management (Asana/Trello)", "Microsoft Office Suite", "Supply Chain Management"],
  },
  {
    pattern: /\bsales\b/,
    skills: ["Lead Generation", "Negotiation", "Salesforce CRM", "Cold Calling"],
  },
  {
    pattern: /\be[\s-]?commerce\b/,
    skills: ["E-Commerce Management", "Shopify Marketing", "Facebook/Meta Ads", "Inventory Management"],
  },
];

// ─── Skill Aliases ───
// Normalizes common skill name variations to canonical forms used in
// SKILL_TAXONOMY. Applied to both job and profile skills before comparison.
// Keys MUST be lowercase.

export const SKILL_ALIASES: Record<string, string> = {
  // ── JavaScript / TypeScript ──
  js: "JavaScript",
  ecmascript: "JavaScript",
  es6: "JavaScript",
  es2015: "JavaScript",
  ts: "TypeScript",

  // ── React ──
  reactjs: "React",
  "react.js": "React",
  "react js": "React",

  // ── Next.js ──
  nextjs: "Next.js",
  "next js": "Next.js",

  // ── Node.js ──
  nodejs: "Node.js",
  node: "Node.js",
  "node js": "Node.js",

  // ── Vue.js ──
  vuejs: "Vue.js",
  "vue.js": "Vue.js",
  "vue js": "Vue.js",
  vue: "Vue.js",

  // ── Python ──
  python3: "Python",
  "python 3": "Python",

  // ── PHP / Laravel ──
  laravel: "Laravel",

  // ── SQL & Databases ──
  mysql: "MySQL",
  postgresql: "PostgreSQL",
  postgres: "PostgreSQL",
  "ms sql": "SQL",
  mssql: "SQL",
  nosql: "MongoDB",
  mongo: "MongoDB",

  // ── C# / .NET ──
  "c#": "C#/.NET",
  csharp: "C#/.NET",
  ".net": "C#/.NET",
  dotnet: "C#/.NET",
  "asp.net": "C#/.NET",

  // ── Go ──
  golang: "Go (Golang)",
  go: "Go (Golang)",

  // ── Ruby ──
  ruby: "Ruby on Rails",
  rails: "Ruby on Rails",
  ror: "Ruby on Rails",

  // ── React Native / Flutter ──
  "react-native": "React Native",
  rn: "React Native",

  // ── Swift / Kotlin ──
  swift: "Swift (iOS)",
  ios: "Swift (iOS)",
  kotlin: "Kotlin (Android)",
  android: "Kotlin (Android)",

  // ── Cloud ──
  "amazon web services": "AWS",
  gcp: "Google Cloud (GCP)",
  "google cloud": "Google Cloud (GCP)",

  // ── DevOps / Infra ──
  k8s: "Kubernetes",
  "ci/cd": "CI/CD Pipelines",
  cicd: "CI/CD Pipelines",
  linux: "Linux / CLI",
  cli: "Linux / CLI",
  bash: "Linux / CLI",

  // ── Git ──
  github: "Git",
  gitlab: "Git",
  "version control": "Git",

  // ── Frontend tools ──
  tailwind: "Tailwind CSS",
  tailwindcss: "Tailwind CSS",
  sass: "SASS/SCSS",
  scss: "SASS/SCSS",
  webpack: "Webpack / Vite",
  vite: "Webpack / Vite",

  // ── REST / GraphQL ──
  "rest api": "REST API Development",
  "rest apis": "REST API Development",
  restful: "REST API Development",
  api: "REST API Development",

  // ── Agile ──
  scrum: "Agile / Scrum",
  agile: "Agile / Scrum",
  "scrum master": "Agile / Scrum",

  // ── WordPress / Shopify ──
  wp: "WordPress",
  shopify: "Shopify / Liquid",
  liquid: "Shopify / Liquid",

  // ── Adobe Design tools ──
  photoshop: "Adobe Photoshop",
  "adobe photoshop": "Adobe Photoshop",
  ps: "Adobe Photoshop",
  illustrator: "Adobe Illustrator",
  "adobe illustrator": "Adobe Illustrator",
  ai: "Adobe Illustrator",
  indesign: "Adobe InDesign",
  "adobe indesign": "Adobe InDesign",
  xd: "Adobe XD",
  "adobe xd": "Adobe XD",
  "after effects": "Adobe After Effects",
  ae: "Adobe After Effects",
  "premiere pro": "Adobe Premiere Pro",
  premiere: "Adobe Premiere Pro",
  pp: "Adobe Premiere Pro",
  davinci: "DaVinci Resolve",
  capcut: "CapCut",

  // ── Design concepts ──
  "ui/ux": "UI Design",
  "ux/ui": "UX Design",
  "user interface": "UI Design",
  "user experience": "UX Design",
  "user research": "UX Research",
  wireframing: "Wireframing & Prototyping",
  prototyping: "Wireframing & Prototyping",
  "design system": "Design Systems",
  "design systems": "Design Systems",
  branding: "Brand Identity Design",
  "brand design": "Brand Identity Design",
  a11y: "Accessibility Design (a11y)",
  accessibility: "Accessibility Design (a11y)",
  lottie: "Lottie / Micro-animations",
  "micro animations": "Lottie / Micro-animations",
  blender: "3D Modeling (Blender)",
  "3d modeling": "3D Modeling (Blender)",

  // ── Data & Analytics ──
  excel: "Excel (Advanced)",
  "ms excel": "Excel (Advanced)",
  "microsoft excel": "Excel (Advanced)",
  "google sheets": "Google Sheets (Advanced)",
  "data analysis": "SQL (Data Analysis)",
  "data analytics": "SQL (Data Analysis)",
  "data visualization": "Tableau",
  "power bi": "Power BI",
  powerbi: "Power BI",
  "looker studio": "Google Data Studio / Looker",
  "data studio": "Google Data Studio / Looker",
  looker: "Google Data Studio / Looker",
  "data cleaning": "Data Cleaning & Wrangling",
  "data wrangling": "Data Cleaning & Wrangling",
  statistics: "Statistical Analysis",
  "machine learning": "Machine Learning (Basics)",
  ml: "Machine Learning (Basics)",
  "deep learning": "Deep Learning",
  dl: "Deep Learning",
  nlp: "NLP (Natural Language Processing)",
  pandas: "Pandas / NumPy",
  numpy: "Pandas / NumPy",
  etl: "ETL / Data Pipelines",
  bigquery: "BigQuery",
  spark: "Apache Spark",
  "a/b testing": "A/B Testing",
  "ab testing": "A/B Testing",
  "web scraping": "Web Scraping",
  "prompt engineering": "Prompt Engineering",
  chatgpt: "AI Tools (ChatGPT, Claude, etc.)",
  "ai tools": "AI Tools (ChatGPT, Claude, etc.)",
  bi: "Business Intelligence",

  // ── BPO & Customer Service ──
  "customer service": "Customer Service (Voice)",
  "customer support": "Customer Service (Voice)",
  "voice support": "Customer Service (Voice)",
  "non-voice": "Customer Service (Non-Voice)",
  "non voice": "Customer Service (Non-Voice)",
  "email support": "Email Support",
  "chat support": "Live Chat Support",
  "live chat": "Live Chat Support",
  "tech support": "Technical Support",
  "technical support": "Technical Support",
  zendesk: "Zendesk",
  freshdesk: "Freshdesk",
  "service cloud": "Salesforce Service Cloud",
  intercom: "Intercom",
  "quality assurance": "Quality Assurance (BPO)",
  qa: "Quality Assurance (BPO)",
  "qa testing": "Quality Assurance (BPO)",
  "content moderation": "Content Moderation",
  "english proficiency": "English Proficiency",
  "typing speed": "Typing Speed (50+ WPM)",
  wpm: "Typing Speed (50+ WPM)",
  crm: "CRM Management",
  "crm management": "CRM Management",
  "customer relationship management": "CRM Management",
  "data entry": "Data Entry",

  // ── Marketing & Content ──
  "search engine optimization": "SEO",
  seo: "SEO",
  sem: "Google Ads (SEM)",
  "google ads": "Google Ads (SEM)",
  adwords: "Google Ads (SEM)",
  "facebook ads": "Facebook/Meta Ads",
  "meta ads": "Facebook/Meta Ads",
  "fb ads": "Facebook/Meta Ads",
  "google analytics": "Google Analytics",
  ga: "Google Analytics",
  ga4: "Google Analytics",
  "social media": "Social Media Management",
  "social media management": "Social Media Management",
  "content writing": "Content Writing",
  copywriting: "Copywriting",
  "email marketing": "Email Marketing",
  mailchimp: "Mailchimp",
  hubspot: "HubSpot",
  "tiktok marketing": "TikTok Marketing",
  tiktok: "TikTok Marketing",
  "youtube marketing": "YouTube Marketing",
  "market research": "Market Research",
  "public relations": "PR & Communications",
  pr: "PR & Communications",
  "landing page": "Landing Page Optimization",
  cro: "Conversion Rate Optimization",
  gtm: "Google Tag Manager",
  "tag manager": "Google Tag Manager",
  hootsuite: "Hootsuite / Buffer",
  buffer: "Hootsuite / Buffer",
  "technical writing": "Technical Writing",
  "blog writing": "Blog Writing",
  blogging: "Blog Writing",
  semrush: "Semrush / Ahrefs",
  ahrefs: "Semrush / Ahrefs",
  ecommerce: "E-Commerce Management",
  "e-commerce": "E-Commerce Management",

  // ── VA & Admin ──
  "microsoft office": "Microsoft Office Suite",
  "ms office": "Microsoft Office Suite",
  msoffice: "Microsoft Office Suite",
  "office 365": "Microsoft Office Suite",
  "microsoft 365": "Microsoft Office Suite",
  "ms word": "Microsoft Office Suite",
  "google workspace": "Google Workspace",
  gsuite: "Google Workspace",
  "g suite": "Google Workspace",
  "google apps": "Google Workspace",
  "project management": "Project Management (Asana/Trello)",
  pm: "Project Management (Asana/Trello)",
  pmp: "Project Management (Asana/Trello)",
  asana: "Project Management (Asana/Trello)",
  trello: "Project Management (Asana/Trello)",
  jira: "Project Management (Asana/Trello)",
  notion: "Notion",
  "monday.com": "Monday.com",
  monday: "Monday.com",
  clickup: "ClickUp",
  slack: "Slack / Teams Communication",
  "microsoft teams": "Slack / Teams Communication",
  teams: "Slack / Teams Communication",
  zoom: "Zoom / Google Meet Hosting",
  "google meet": "Zoom / Google Meet Hosting",
  transcription: "Transcription",

  // ── Finance & Accounting ──
  bookkeeping: "Bookkeeping",
  quickbooks: "QuickBooks",
  qb: "QuickBooks",
  xero: "Xero",
  sap: "SAP",
  "financial analysis": "Financial Analysis",
  payroll: "Payroll Processing",
  "tax preparation": "Tax Preparation (PH)",
  "tax prep": "Tax Preparation (PH)",
  "accounts payable": "Accounts Payable / Receivable",
  "accounts receivable": "Accounts Payable / Receivable",
  "ap/ar": "Accounts Payable / Receivable",
  auditing: "Auditing",
  audit: "Auditing",
  cpa: "CPA License (PH)",
  "financial modeling": "Financial Modeling",
  erp: "ERP Systems (General)",

  // ── Sales ──
  "lead generation": "Lead Generation",
  "lead gen": "Lead Generation",
  "cold calling": "Cold Calling",
  "cold emailing": "Cold Emailing",
  salesforce: "Salesforce CRM",
  "salesforce crm": "Salesforce CRM",
  pipedrive: "Pipedrive / CRM Tools",
  negotiation: "Negotiation",
  "b2b": "B2B Sales",
  "b2c": "B2C Sales",
  "account management": "Account Management",
  telemarketing: "Telemarketing",

  // ── Engineering ──
  autocad: "AutoCAD",
  revit: "Revit",
  solidworks: "SolidWorks",
  "civil engineering": "Civil Engineering",
  "electrical engineering": "Electrical Engineering",
  "mechanical engineering": "Mechanical Engineering",
  "six sigma": "Six Sigma / Lean",
  lean: "Six Sigma / Lean",
  osha: "Safety Management (OSHA)",
  "safety management": "Safety Management (OSHA)",
  matlab: "MATLAB",
  iot: "IoT (Internet of Things)",
  robotics: "Robotics",
  plc: "PLC Programming",
  gis: "GIS / Mapping",

  // ── Healthcare ──
  nursing: "Nursing (RN License)",
  "rn license": "Nursing (RN License)",
  "registered nurse": "Nursing (RN License)",
  caregiving: "Caregiving",
  caregiver: "Caregiving",
  "medical coding": "Medical Coding (ICD-10)",
  "icd-10": "Medical Coding (ICD-10)",
  "medical billing": "Medical Billing",
  hipaa: "HIPAA Compliance",
  ehr: "Electronic Health Records (EHR)",
  "electronic health records": "Electronic Health Records (EHR)",
  telemedicine: "Telemedicine Support",
  "first aid": "First Aid / BLS",
  bls: "First Aid / BLS",
  "medical transcription": "Medical Transcription",

  // ── Education ──
  teaching: "Teaching (K-12)",
  esl: "ESL / TESOL Teaching",
  tesol: "ESL / TESOL Teaching",
  tutoring: "Online Tutoring",
  "instructional design": "Instructional Design",
  lms: "LMS Administration (Moodle/Canvas)",
  moodle: "LMS Administration (Moodle/Canvas)",
  canvas: "LMS Administration (Moodle/Canvas)",
  "curriculum development": "Curriculum Development",
  "corporate training": "Corporate Training",
  "academic writing": "Academic Writing",

  // ── Trades & Logistics ──
  "warehouse management": "Warehouse Management",
  "supply chain": "Supply Chain Management",
  "inventory management": "Inventory Management",
  forklift: "Forklift Operation",
  "electrical installation": "Electrical Installation",
  plumbing: "Plumbing",
  welding: "Welding",
  hvac: "HVAC Installation & Repair",
  "automotive repair": "Automotive Repair",
  procurement: "Procurement",
  logistics: "Shipping / Freight Coordination",
  shipping: "Shipping / Freight Coordination",
  freight: "Shipping / Freight Coordination",
};
