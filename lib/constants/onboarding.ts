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

// ─── Work categories (replaces INDUSTRIES for onboarding) ───
export const WORK_CATEGORIES = [
  { value: "tech_it", label: "Tech & IT", icon: "💻" },
  { value: "bpo", label: "BPO / Customer Support", icon: "🎧" },
  { value: "admin", label: "Admin & Office", icon: "📋" },
  { value: "sales", label: "Sales & Marketing", icon: "📈" },
  { value: "design", label: "Design & Creative", icon: "🎨" },
  { value: "accounting", label: "Accounting & Finance", icon: "💰" },
  { value: "healthcare", label: "Healthcare", icon: "🏥" },
  { value: "education", label: "Education", icon: "📚" },
  { value: "skilled_trade", label: "Skilled Trade", icon: "🔧" },
  { value: "other", label: "Other", icon: "✨" },
] as const;

// ─── Skill categories for chip selector (12 clusters, 267 skills) ───
// Derived from PRD skill taxonomy. Each cluster shows all its skills.
export const SKILL_CATEGORIES: Record<string, string[]> = {
  "Software Development": [
    "HTML", "CSS", "JavaScript", "TypeScript", "React", "Next.js", "Vue.js", "Angular",
    "Node.js", "Python", "Java", "PHP", "Laravel", "Ruby on Rails", "C#/.NET", "Go (Golang)",
    "SQL", "PostgreSQL", "MySQL", "MongoDB", "Git", "Docker", "AWS", "Google Cloud (GCP)", "Azure",
    "REST API Development", "GraphQL", "React Native", "Flutter", "Swift (iOS)", "Kotlin (Android)",
    "WordPress", "Shopify / Liquid", "CI/CD Pipelines", "Linux / CLI", "Agile / Scrum",
    "Unit Testing", "Tailwind CSS", "SASS/SCSS", "Webpack / Vite", "Firebase", "Redis",
    "Kubernetes", "Terraform", "Cybersecurity Basics",
  ],
  "Design & Creative": [
    "Figma", "Adobe Photoshop", "Adobe Illustrator", "Adobe InDesign", "Adobe XD", "Sketch",
    "Canva", "Adobe After Effects", "Adobe Premiere Pro", "DaVinci Resolve", "CapCut",
    "UI Design", "UX Design", "UX Research", "Wireframing & Prototyping", "Design Systems",
    "Brand Identity Design", "Typography", "Color Theory", "Print Design", "3D Modeling (Blender)",
    "Photography", "Illustration (Digital)", "Responsive Design", "Accessibility Design (a11y)",
    "Presentation Design", "Infographic Design", "Social Media Graphics",
    "Video Thumbnails & Banners", "Lottie / Micro-animations",
  ],
  "Data & Analytics": [
    "Excel (Advanced)", "Google Sheets (Advanced)", "SQL (Data Analysis)", "Python (Data Science)",
    "R Programming", "Tableau", "Power BI", "Google Data Studio / Looker",
    "Data Cleaning & Wrangling", "Statistical Analysis", "Machine Learning (Basics)", "Deep Learning",
    "NLP (Natural Language Processing)", "Pandas / NumPy", "ETL / Data Pipelines", "BigQuery",
    "Apache Spark", "A/B Testing", "Data Storytelling", "Web Scraping", "Prompt Engineering",
    "AI Tools (ChatGPT, Claude, etc.)", "Business Intelligence", "Data Governance", "Computer Vision",
  ],
  "BPO & Customer Service": [
    "Customer Service (Voice)", "Customer Service (Non-Voice)", "Email Support", "Live Chat Support",
    "Technical Support", "Zendesk", "Freshdesk", "Salesforce Service Cloud", "Intercom",
    "Quality Assurance (BPO)", "Content Moderation", "English Proficiency", "Neutral English Accent",
    "Typing Speed (50+ WPM)", "CRM Management", "Ticketing Systems", "Conflict Resolution",
    "Upselling / Cross-selling", "Multilingual Support", "Data Entry",
  ],
  "Marketing & Content": [
    "SEO", "Google Ads (SEM)", "Facebook/Meta Ads", "Google Analytics", "Social Media Management",
    "Content Writing", "Copywriting", "Email Marketing", "Mailchimp", "HubSpot",
    "WordPress (Content)", "TikTok Marketing", "YouTube Marketing", "Influencer Marketing",
    "Affiliate Marketing", "Brand Strategy", "Market Research", "PR & Communications",
    "Podcast Production", "Shopify Marketing", "Landing Page Optimization",
    "Conversion Rate Optimization", "Google Tag Manager", "Hootsuite / Buffer",
    "Technical Writing", "Blog Writing", "Script Writing (Video)", "Community Management",
    "Semrush / Ahrefs", "E-Commerce Management",
  ],
  "Virtual Assistance & Admin": [
    "Calendar Management", "Email Management", "Travel Arrangements", "Microsoft Office Suite",
    "Google Workspace", "Project Management (Asana/Trello)", "Slack / Teams Communication",
    "Meeting Minutes & Notes", "Invoice & Expense Tracking", "Research & Reporting",
    "Document Formatting", "Notion", "Monday.com", "ClickUp", "Zoom / Google Meet Hosting",
    "Time Management", "Client Communication", "Transcription", "Appointment Setting",
    "File Management (Cloud)",
  ],
  "Finance & Accounting": [
    "Bookkeeping", "QuickBooks", "Xero", "SAP", "Financial Analysis", "Financial Reporting",
    "Payroll Processing", "Tax Preparation (PH)", "Accounts Payable / Receivable",
    "Budgeting & Forecasting", "Auditing", "Cost Accounting", "Invoicing & Billing",
    "Bank Reconciliation", "CPA License (PH)", "Financial Modeling", "Insurance Processing",
    "Compliance & Regulatory", "ERP Systems (General)", "Cryptocurrency / Blockchain",
  ],
  "Sales & Business Dev": [
    "Lead Generation", "Cold Calling", "Cold Emailing", "Salesforce CRM",
    "Pipedrive / CRM Tools", "Negotiation", "B2B Sales", "B2C Sales", "Account Management",
    "Sales Presentation", "LinkedIn Outreach", "Proposal Writing", "Telemarketing",
    "Retail Sales", "Real Estate Sales",
  ],
  "Engineering & Technical": [
    "AutoCAD", "Revit", "SolidWorks", "Civil Engineering", "Electrical Engineering",
    "Mechanical Engineering", "Project Management (Construction)", "Structural Analysis",
    "HVAC Design", "Quality Control / Inspection", "PLC Programming", "Six Sigma / Lean",
    "Safety Management (OSHA)", "Renewable Energy", "Quantity Surveying", "GIS / Mapping",
    "MATLAB", "IoT (Internet of Things)", "Robotics", "Electronics / PCB Design",
  ],
  "Healthcare": [
    "Nursing (RN License)", "Medical Technology", "Pharmacy", "Caregiving",
    "Medical Coding (ICD-10)", "Medical Billing", "HIPAA Compliance",
    "Electronic Health Records (EHR)", "Telemedicine Support", "First Aid / BLS",
    "Dental Assisting", "Physical Therapy", "Nutrition & Dietetics", "Mental Health Support",
    "Medical Transcription",
  ],
  "Education & Training": [
    "Teaching (K-12)", "ESL / TESOL Teaching", "Online Tutoring", "Instructional Design",
    "LMS Administration (Moodle/Canvas)", "Curriculum Development", "Corporate Training",
    "E-Learning Content Creation", "Assessment Design", "Special Education (SPED)",
    "Student Counseling", "Academic Writing",
  ],
  "Skilled Trades & Logistics": [
    "Warehouse Management", "Supply Chain Management", "Inventory Management", "Forklift Operation",
    "Delivery / Courier Services", "Electrical Installation", "Plumbing", "Welding",
    "HVAC Installation & Repair", "Automotive Repair", "Food Handling / HACCP",
    "Heavy Equipment Operation", "Procurement", "Shipping / Freight Coordination",
    "Last-Mile Logistics (Lazada/Shopee)",
  ],
};

// ─── Experience level options (new fine-grained brackets) ───
export const EXPERIENCE_LEVELS = [
  { value: "fresh_graduate", label: "Fresh Graduate / No Experience" },
  { value: "less_than_1yr", label: "Less than 1 year" },
  { value: "1_to_3yr", label: "1–3 years" },
  { value: "3_to_5yr", label: "3–5 years" },
  { value: "5_to_10yr", label: "5–10 years" },
  { value: "10_plus", label: "10+ years" },
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
  less_than_1yr: { min: 18000, max: 28000 },
  "1_to_3yr": { min: 25000, max: 45000 },
  "3_to_5yr": { min: 40000, max: 70000 },
  "5_to_10yr": { min: 60000, max: 100000 },
  "10_plus": { min: 80000, max: 150000 },
  // Legacy values still work
  junior: { min: 25000, max: 40000 },
  mid: { min: 40000, max: 70000 },
  senior: { min: 70000, max: 120000 },
};
