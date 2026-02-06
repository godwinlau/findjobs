// ─── Skill Taxonomy (PRD: 267 skills / 12 clusters) ───
// Source: ph_job_app_skill_taxonomy.xlsx

export interface SkillCluster {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface SkillEntry {
  id: number;
  name: string;
  clusterId: string;
  subcategory: string;
  hasProficiency: boolean;
}

export const SKILL_CLUSTERS: SkillCluster[] = [
  { id: "DEV", name: "Software Development", description: "Web, mobile, backend, full-stack development", icon: "💻" },
  { id: "DES", name: "Design & Creative", description: "UI/UX, graphic design, motion, branding", icon: "🎨" },
  { id: "DATA", name: "Data & Analytics", description: "Data analysis, BI, data science, ML basics", icon: "📊" },
  { id: "BPO", name: "BPO & Customer Service", description: "Voice/non-voice support, chat, email, moderation", icon: "🎧" },
  { id: "MKT", name: "Marketing & Content", description: "Digital marketing, SEO, social media, copywriting", icon: "📣" },
  { id: "VA", name: "Virtual Assistance & Admin", description: "Admin support, scheduling, research, coordination", icon: "📋" },
  { id: "FIN", name: "Finance & Accounting", description: "Bookkeeping, auditing, financial analysis", icon: "💰" },
  { id: "SALES", name: "Sales & Business Dev", description: "Lead gen, account management, B2B/B2C sales", icon: "📈" },
  { id: "ENG", name: "Engineering & Technical", description: "Civil, electrical, mechanical, construction", icon: "🔩" },
  { id: "HC", name: "Healthcare", description: "Nursing, medtech, pharma, telemedicine", icon: "🏥" },
  { id: "EDU", name: "Education & Training", description: "Teaching, tutoring, e-learning, corporate training", icon: "📚" },
  { id: "TRADE", name: "Skilled Trades & Logistics", description: "Supply chain, warehousing, driving, technician work", icon: "🔧" },
];

export const SKILL_TAXONOMY: SkillEntry[] = [
  // ─── DEV: Software Development (1-45) ───
  { id: 1, name: "HTML", clusterId: "DEV", subcategory: "Frontend", hasProficiency: true },
  { id: 2, name: "CSS", clusterId: "DEV", subcategory: "Frontend", hasProficiency: true },
  { id: 3, name: "JavaScript", clusterId: "DEV", subcategory: "Frontend", hasProficiency: true },
  { id: 4, name: "TypeScript", clusterId: "DEV", subcategory: "Frontend", hasProficiency: true },
  { id: 5, name: "React", clusterId: "DEV", subcategory: "Frontend Framework", hasProficiency: true },
  { id: 6, name: "Next.js", clusterId: "DEV", subcategory: "Frontend Framework", hasProficiency: true },
  { id: 7, name: "Vue.js", clusterId: "DEV", subcategory: "Frontend Framework", hasProficiency: true },
  { id: 8, name: "Angular", clusterId: "DEV", subcategory: "Frontend Framework", hasProficiency: true },
  { id: 9, name: "Node.js", clusterId: "DEV", subcategory: "Backend", hasProficiency: true },
  { id: 10, name: "Python", clusterId: "DEV", subcategory: "Backend / General", hasProficiency: true },
  { id: 11, name: "Java", clusterId: "DEV", subcategory: "Backend / Enterprise", hasProficiency: true },
  { id: 12, name: "PHP", clusterId: "DEV", subcategory: "Backend", hasProficiency: true },
  { id: 13, name: "Laravel", clusterId: "DEV", subcategory: "Backend Framework", hasProficiency: true },
  { id: 14, name: "Ruby on Rails", clusterId: "DEV", subcategory: "Backend Framework", hasProficiency: true },
  { id: 15, name: "C#/.NET", clusterId: "DEV", subcategory: "Backend / Enterprise", hasProficiency: true },
  { id: 16, name: "Go (Golang)", clusterId: "DEV", subcategory: "Backend", hasProficiency: true },
  { id: 17, name: "SQL", clusterId: "DEV", subcategory: "Database", hasProficiency: true },
  { id: 18, name: "PostgreSQL", clusterId: "DEV", subcategory: "Database", hasProficiency: true },
  { id: 19, name: "MySQL", clusterId: "DEV", subcategory: "Database", hasProficiency: true },
  { id: 20, name: "MongoDB", clusterId: "DEV", subcategory: "Database", hasProficiency: true },
  { id: 21, name: "Git", clusterId: "DEV", subcategory: "DevOps / Tooling", hasProficiency: true },
  { id: 22, name: "Docker", clusterId: "DEV", subcategory: "DevOps", hasProficiency: true },
  { id: 23, name: "AWS", clusterId: "DEV", subcategory: "Cloud", hasProficiency: true },
  { id: 24, name: "Google Cloud (GCP)", clusterId: "DEV", subcategory: "Cloud", hasProficiency: true },
  { id: 25, name: "Azure", clusterId: "DEV", subcategory: "Cloud", hasProficiency: true },
  { id: 26, name: "REST API Development", clusterId: "DEV", subcategory: "Backend", hasProficiency: true },
  { id: 27, name: "GraphQL", clusterId: "DEV", subcategory: "Backend / API", hasProficiency: true },
  { id: 28, name: "React Native", clusterId: "DEV", subcategory: "Mobile", hasProficiency: true },
  { id: 29, name: "Flutter", clusterId: "DEV", subcategory: "Mobile", hasProficiency: true },
  { id: 30, name: "Swift (iOS)", clusterId: "DEV", subcategory: "Mobile", hasProficiency: true },
  { id: 31, name: "Kotlin (Android)", clusterId: "DEV", subcategory: "Mobile", hasProficiency: true },
  { id: 32, name: "WordPress", clusterId: "DEV", subcategory: "CMS", hasProficiency: true },
  { id: 33, name: "Shopify / Liquid", clusterId: "DEV", subcategory: "E-Commerce", hasProficiency: true },
  { id: 34, name: "CI/CD Pipelines", clusterId: "DEV", subcategory: "DevOps", hasProficiency: true },
  { id: 35, name: "Linux / CLI", clusterId: "DEV", subcategory: "Systems", hasProficiency: true },
  { id: 36, name: "Agile / Scrum", clusterId: "DEV", subcategory: "Methodology", hasProficiency: false },
  { id: 37, name: "Unit Testing", clusterId: "DEV", subcategory: "QA / Testing", hasProficiency: true },
  { id: 38, name: "Tailwind CSS", clusterId: "DEV", subcategory: "Frontend", hasProficiency: true },
  { id: 39, name: "SASS/SCSS", clusterId: "DEV", subcategory: "Frontend", hasProficiency: true },
  { id: 40, name: "Webpack / Vite", clusterId: "DEV", subcategory: "Tooling", hasProficiency: true },
  { id: 41, name: "Firebase", clusterId: "DEV", subcategory: "Backend / BaaS", hasProficiency: true },
  { id: 42, name: "Redis", clusterId: "DEV", subcategory: "Database / Cache", hasProficiency: true },
  { id: 43, name: "Kubernetes", clusterId: "DEV", subcategory: "DevOps / Cloud", hasProficiency: true },
  { id: 44, name: "Terraform", clusterId: "DEV", subcategory: "Infrastructure", hasProficiency: true },
  { id: 45, name: "Cybersecurity Basics", clusterId: "DEV", subcategory: "Security", hasProficiency: false },

  // ─── DES: Design & Creative (46-75) ───
  { id: 46, name: "Figma", clusterId: "DES", subcategory: "UI/UX Tools", hasProficiency: true },
  { id: 47, name: "Adobe Photoshop", clusterId: "DES", subcategory: "Graphic Design", hasProficiency: true },
  { id: 48, name: "Adobe Illustrator", clusterId: "DES", subcategory: "Graphic Design", hasProficiency: true },
  { id: 49, name: "Adobe InDesign", clusterId: "DES", subcategory: "Print / Layout", hasProficiency: true },
  { id: 50, name: "Adobe XD", clusterId: "DES", subcategory: "UI/UX Tools", hasProficiency: true },
  { id: 51, name: "Sketch", clusterId: "DES", subcategory: "UI/UX Tools", hasProficiency: true },
  { id: 52, name: "Canva", clusterId: "DES", subcategory: "Visual Design", hasProficiency: true },
  { id: 53, name: "Adobe After Effects", clusterId: "DES", subcategory: "Motion / Video", hasProficiency: true },
  { id: 54, name: "Adobe Premiere Pro", clusterId: "DES", subcategory: "Video Editing", hasProficiency: true },
  { id: 55, name: "DaVinci Resolve", clusterId: "DES", subcategory: "Video Editing", hasProficiency: true },
  { id: 56, name: "CapCut", clusterId: "DES", subcategory: "Video Editing", hasProficiency: true },
  { id: 57, name: "UI Design", clusterId: "DES", subcategory: "UI/UX", hasProficiency: true },
  { id: 58, name: "UX Design", clusterId: "DES", subcategory: "UI/UX", hasProficiency: true },
  { id: 59, name: "UX Research", clusterId: "DES", subcategory: "UI/UX", hasProficiency: true },
  { id: 60, name: "Wireframing & Prototyping", clusterId: "DES", subcategory: "UI/UX", hasProficiency: true },
  { id: 61, name: "Design Systems", clusterId: "DES", subcategory: "UI/UX", hasProficiency: true },
  { id: 62, name: "Brand Identity Design", clusterId: "DES", subcategory: "Branding", hasProficiency: true },
  { id: 63, name: "Typography", clusterId: "DES", subcategory: "Visual Design", hasProficiency: false },
  { id: 64, name: "Color Theory", clusterId: "DES", subcategory: "Visual Design", hasProficiency: false },
  { id: 65, name: "Print Design", clusterId: "DES", subcategory: "Print", hasProficiency: true },
  { id: 66, name: "3D Modeling (Blender)", clusterId: "DES", subcategory: "3D / Specialized", hasProficiency: true },
  { id: 67, name: "Photography", clusterId: "DES", subcategory: "Visual Content", hasProficiency: true },
  { id: 68, name: "Illustration (Digital)", clusterId: "DES", subcategory: "Illustration", hasProficiency: true },
  { id: 69, name: "Responsive Design", clusterId: "DES", subcategory: "UI/UX", hasProficiency: false },
  { id: 70, name: "Accessibility Design (a11y)", clusterId: "DES", subcategory: "UI/UX", hasProficiency: false },
  { id: 71, name: "Presentation Design", clusterId: "DES", subcategory: "Visual Design", hasProficiency: true },
  { id: 72, name: "Infographic Design", clusterId: "DES", subcategory: "Visual Design", hasProficiency: true },
  { id: 73, name: "Social Media Graphics", clusterId: "DES", subcategory: "Marketing Design", hasProficiency: true },
  { id: 74, name: "Video Thumbnails & Banners", clusterId: "DES", subcategory: "Marketing Design", hasProficiency: true },
  { id: 75, name: "Lottie / Micro-animations", clusterId: "DES", subcategory: "Motion / UI", hasProficiency: true },

  // ─── DATA: Data & Analytics (76-100) ───
  { id: 76, name: "Excel (Advanced)", clusterId: "DATA", subcategory: "Spreadsheets", hasProficiency: true },
  { id: 77, name: "Google Sheets (Advanced)", clusterId: "DATA", subcategory: "Spreadsheets", hasProficiency: true },
  { id: 78, name: "SQL (Data Analysis)", clusterId: "DATA", subcategory: "Querying", hasProficiency: true },
  { id: 79, name: "Python (Data Science)", clusterId: "DATA", subcategory: "Programming", hasProficiency: true },
  { id: 80, name: "R Programming", clusterId: "DATA", subcategory: "Programming", hasProficiency: true },
  { id: 81, name: "Tableau", clusterId: "DATA", subcategory: "Visualization", hasProficiency: true },
  { id: 82, name: "Power BI", clusterId: "DATA", subcategory: "Visualization", hasProficiency: true },
  { id: 83, name: "Google Data Studio / Looker", clusterId: "DATA", subcategory: "Visualization", hasProficiency: true },
  { id: 84, name: "Data Cleaning & Wrangling", clusterId: "DATA", subcategory: "Data Prep", hasProficiency: true },
  { id: 85, name: "Statistical Analysis", clusterId: "DATA", subcategory: "Analysis", hasProficiency: true },
  { id: 86, name: "Machine Learning (Basics)", clusterId: "DATA", subcategory: "ML / AI", hasProficiency: true },
  { id: 87, name: "Deep Learning", clusterId: "DATA", subcategory: "ML / AI", hasProficiency: true },
  { id: 88, name: "NLP (Natural Language Processing)", clusterId: "DATA", subcategory: "ML / AI", hasProficiency: true },
  { id: 89, name: "Pandas / NumPy", clusterId: "DATA", subcategory: "Libraries", hasProficiency: true },
  { id: 90, name: "ETL / Data Pipelines", clusterId: "DATA", subcategory: "Data Engineering", hasProficiency: true },
  { id: 91, name: "BigQuery", clusterId: "DATA", subcategory: "Cloud Data", hasProficiency: true },
  { id: 92, name: "Apache Spark", clusterId: "DATA", subcategory: "Big Data", hasProficiency: true },
  { id: 93, name: "A/B Testing", clusterId: "DATA", subcategory: "Experimentation", hasProficiency: false },
  { id: 94, name: "Data Storytelling", clusterId: "DATA", subcategory: "Communication", hasProficiency: false },
  { id: 95, name: "Web Scraping", clusterId: "DATA", subcategory: "Data Collection", hasProficiency: true },
  { id: 96, name: "Prompt Engineering", clusterId: "DATA", subcategory: "AI Tools", hasProficiency: false },
  { id: 97, name: "AI Tools (ChatGPT, Claude, etc.)", clusterId: "DATA", subcategory: "AI Tools", hasProficiency: false },
  { id: 98, name: "Business Intelligence", clusterId: "DATA", subcategory: "Strategy", hasProficiency: false },
  { id: 99, name: "Data Governance", clusterId: "DATA", subcategory: "Compliance", hasProficiency: false },
  { id: 100, name: "Computer Vision", clusterId: "DATA", subcategory: "ML / AI", hasProficiency: true },

  // ─── BPO: BPO & Customer Service (101-120) ───
  { id: 101, name: "Customer Service (Voice)", clusterId: "BPO", subcategory: "Voice Support", hasProficiency: true },
  { id: 102, name: "Customer Service (Non-Voice)", clusterId: "BPO", subcategory: "Non-Voice", hasProficiency: true },
  { id: 103, name: "Email Support", clusterId: "BPO", subcategory: "Non-Voice", hasProficiency: true },
  { id: 104, name: "Live Chat Support", clusterId: "BPO", subcategory: "Non-Voice", hasProficiency: true },
  { id: 105, name: "Technical Support", clusterId: "BPO", subcategory: "Tech Support", hasProficiency: true },
  { id: 106, name: "Zendesk", clusterId: "BPO", subcategory: "Tools", hasProficiency: true },
  { id: 107, name: "Freshdesk", clusterId: "BPO", subcategory: "Tools", hasProficiency: true },
  { id: 108, name: "Salesforce Service Cloud", clusterId: "BPO", subcategory: "Tools / CRM", hasProficiency: true },
  { id: 109, name: "Intercom", clusterId: "BPO", subcategory: "Tools", hasProficiency: true },
  { id: 110, name: "Quality Assurance (BPO)", clusterId: "BPO", subcategory: "QA", hasProficiency: true },
  { id: 111, name: "Content Moderation", clusterId: "BPO", subcategory: "Trust & Safety", hasProficiency: true },
  { id: 112, name: "English Proficiency", clusterId: "BPO", subcategory: "Language", hasProficiency: true },
  { id: 113, name: "Neutral English Accent", clusterId: "BPO", subcategory: "Language", hasProficiency: false },
  { id: 114, name: "Typing Speed (50+ WPM)", clusterId: "BPO", subcategory: "Efficiency", hasProficiency: false },
  { id: 115, name: "CRM Management", clusterId: "BPO", subcategory: "Tools / CRM", hasProficiency: true },
  { id: 116, name: "Ticketing Systems", clusterId: "BPO", subcategory: "Tools", hasProficiency: true },
  { id: 117, name: "Conflict Resolution", clusterId: "BPO", subcategory: "Soft Skills", hasProficiency: false },
  { id: 118, name: "Upselling / Cross-selling", clusterId: "BPO", subcategory: "Sales", hasProficiency: false },
  { id: 119, name: "Multilingual Support", clusterId: "BPO", subcategory: "Language", hasProficiency: false },
  { id: 120, name: "Data Entry", clusterId: "BPO", subcategory: "Back Office", hasProficiency: true },

  // ─── MKT: Marketing & Content (121-150) ───
  { id: 121, name: "SEO", clusterId: "MKT", subcategory: "Search", hasProficiency: true },
  { id: 122, name: "Google Ads (SEM)", clusterId: "MKT", subcategory: "Paid Ads", hasProficiency: true },
  { id: 123, name: "Facebook/Meta Ads", clusterId: "MKT", subcategory: "Paid Ads", hasProficiency: true },
  { id: 124, name: "Google Analytics", clusterId: "MKT", subcategory: "Analytics", hasProficiency: true },
  { id: 125, name: "Social Media Management", clusterId: "MKT", subcategory: "Social Media", hasProficiency: true },
  { id: 126, name: "Content Writing", clusterId: "MKT", subcategory: "Content", hasProficiency: true },
  { id: 127, name: "Copywriting", clusterId: "MKT", subcategory: "Content", hasProficiency: true },
  { id: 128, name: "Email Marketing", clusterId: "MKT", subcategory: "Email", hasProficiency: true },
  { id: 129, name: "Mailchimp", clusterId: "MKT", subcategory: "Email Tools", hasProficiency: true },
  { id: 130, name: "HubSpot", clusterId: "MKT", subcategory: "CRM / Marketing", hasProficiency: true },
  { id: 131, name: "WordPress (Content)", clusterId: "MKT", subcategory: "CMS", hasProficiency: true },
  { id: 132, name: "TikTok Marketing", clusterId: "MKT", subcategory: "Social Media", hasProficiency: true },
  { id: 133, name: "YouTube Marketing", clusterId: "MKT", subcategory: "Video Marketing", hasProficiency: true },
  { id: 134, name: "Influencer Marketing", clusterId: "MKT", subcategory: "Strategy", hasProficiency: false },
  { id: 135, name: "Affiliate Marketing", clusterId: "MKT", subcategory: "Performance", hasProficiency: false },
  { id: 136, name: "Brand Strategy", clusterId: "MKT", subcategory: "Strategy", hasProficiency: false },
  { id: 137, name: "Market Research", clusterId: "MKT", subcategory: "Research", hasProficiency: true },
  { id: 138, name: "PR & Communications", clusterId: "MKT", subcategory: "Comms", hasProficiency: false },
  { id: 139, name: "Podcast Production", clusterId: "MKT", subcategory: "Audio / Content", hasProficiency: true },
  { id: 140, name: "Shopify Marketing", clusterId: "MKT", subcategory: "E-Commerce", hasProficiency: true },
  { id: 141, name: "Landing Page Optimization", clusterId: "MKT", subcategory: "CRO", hasProficiency: true },
  { id: 142, name: "Conversion Rate Optimization", clusterId: "MKT", subcategory: "CRO", hasProficiency: true },
  { id: 143, name: "Google Tag Manager", clusterId: "MKT", subcategory: "Analytics", hasProficiency: true },
  { id: 144, name: "Hootsuite / Buffer", clusterId: "MKT", subcategory: "Social Tools", hasProficiency: true },
  { id: 145, name: "Technical Writing", clusterId: "MKT", subcategory: "Content", hasProficiency: true },
  { id: 146, name: "Blog Writing", clusterId: "MKT", subcategory: "Content", hasProficiency: true },
  { id: 147, name: "Script Writing (Video)", clusterId: "MKT", subcategory: "Video Content", hasProficiency: true },
  { id: 148, name: "Community Management", clusterId: "MKT", subcategory: "Social Media", hasProficiency: true },
  { id: 149, name: "Semrush / Ahrefs", clusterId: "MKT", subcategory: "SEO Tools", hasProficiency: true },
  { id: 150, name: "E-Commerce Management", clusterId: "MKT", subcategory: "E-Commerce", hasProficiency: true },

  // ─── VA: Virtual Assistance & Admin (151-170) ───
  { id: 151, name: "Calendar Management", clusterId: "VA", subcategory: "Admin", hasProficiency: false },
  { id: 152, name: "Email Management", clusterId: "VA", subcategory: "Admin", hasProficiency: false },
  { id: 153, name: "Travel Arrangements", clusterId: "VA", subcategory: "Admin", hasProficiency: false },
  { id: 154, name: "Microsoft Office Suite", clusterId: "VA", subcategory: "Productivity", hasProficiency: true },
  { id: 155, name: "Google Workspace", clusterId: "VA", subcategory: "Productivity", hasProficiency: true },
  { id: 156, name: "Project Management (Asana/Trello)", clusterId: "VA", subcategory: "PM Tools", hasProficiency: true },
  { id: 157, name: "Slack / Teams Communication", clusterId: "VA", subcategory: "Comms", hasProficiency: false },
  { id: 158, name: "Meeting Minutes & Notes", clusterId: "VA", subcategory: "Admin", hasProficiency: false },
  { id: 159, name: "Invoice & Expense Tracking", clusterId: "VA", subcategory: "Finance Admin", hasProficiency: true },
  { id: 160, name: "Research & Reporting", clusterId: "VA", subcategory: "Research", hasProficiency: true },
  { id: 161, name: "Document Formatting", clusterId: "VA", subcategory: "Admin", hasProficiency: false },
  { id: 162, name: "Notion", clusterId: "VA", subcategory: "PM / Knowledge", hasProficiency: true },
  { id: 163, name: "Monday.com", clusterId: "VA", subcategory: "PM Tools", hasProficiency: true },
  { id: 164, name: "ClickUp", clusterId: "VA", subcategory: "PM Tools", hasProficiency: true },
  { id: 165, name: "Zoom / Google Meet Hosting", clusterId: "VA", subcategory: "Comms", hasProficiency: false },
  { id: 166, name: "Time Management", clusterId: "VA", subcategory: "Soft Skills", hasProficiency: false },
  { id: 167, name: "Client Communication", clusterId: "VA", subcategory: "Soft Skills", hasProficiency: false },
  { id: 168, name: "Transcription", clusterId: "VA", subcategory: "Specialized", hasProficiency: true },
  { id: 169, name: "Appointment Setting", clusterId: "VA", subcategory: "Sales Support", hasProficiency: false },
  { id: 170, name: "File Management (Cloud)", clusterId: "VA", subcategory: "Admin", hasProficiency: false },

  // ─── FIN: Finance & Accounting (171-190) ───
  { id: 171, name: "Bookkeeping", clusterId: "FIN", subcategory: "Accounting", hasProficiency: true },
  { id: 172, name: "QuickBooks", clusterId: "FIN", subcategory: "Accounting Software", hasProficiency: true },
  { id: 173, name: "Xero", clusterId: "FIN", subcategory: "Accounting Software", hasProficiency: true },
  { id: 174, name: "SAP", clusterId: "FIN", subcategory: "ERP", hasProficiency: true },
  { id: 175, name: "Financial Analysis", clusterId: "FIN", subcategory: "Analysis", hasProficiency: true },
  { id: 176, name: "Financial Reporting", clusterId: "FIN", subcategory: "Reporting", hasProficiency: true },
  { id: 177, name: "Payroll Processing", clusterId: "FIN", subcategory: "HR / Finance", hasProficiency: true },
  { id: 178, name: "Tax Preparation (PH)", clusterId: "FIN", subcategory: "Tax", hasProficiency: true },
  { id: 179, name: "Accounts Payable / Receivable", clusterId: "FIN", subcategory: "Operations", hasProficiency: true },
  { id: 180, name: "Budgeting & Forecasting", clusterId: "FIN", subcategory: "Planning", hasProficiency: true },
  { id: 181, name: "Auditing", clusterId: "FIN", subcategory: "Compliance", hasProficiency: true },
  { id: 182, name: "Cost Accounting", clusterId: "FIN", subcategory: "Accounting", hasProficiency: true },
  { id: 183, name: "Invoicing & Billing", clusterId: "FIN", subcategory: "Operations", hasProficiency: true },
  { id: 184, name: "Bank Reconciliation", clusterId: "FIN", subcategory: "Operations", hasProficiency: true },
  { id: 185, name: "CPA License (PH)", clusterId: "FIN", subcategory: "Certification", hasProficiency: false },
  { id: 186, name: "Financial Modeling", clusterId: "FIN", subcategory: "Analysis", hasProficiency: true },
  { id: 187, name: "Insurance Processing", clusterId: "FIN", subcategory: "Insurance", hasProficiency: true },
  { id: 188, name: "Compliance & Regulatory", clusterId: "FIN", subcategory: "Compliance", hasProficiency: false },
  { id: 189, name: "ERP Systems (General)", clusterId: "FIN", subcategory: "ERP", hasProficiency: true },
  { id: 190, name: "Cryptocurrency / Blockchain", clusterId: "FIN", subcategory: "Emerging", hasProficiency: false },

  // ─── SALES: Sales & Business Dev (191-205) ───
  { id: 191, name: "Lead Generation", clusterId: "SALES", subcategory: "Outbound", hasProficiency: true },
  { id: 192, name: "Cold Calling", clusterId: "SALES", subcategory: "Outbound", hasProficiency: true },
  { id: 193, name: "Cold Emailing", clusterId: "SALES", subcategory: "Outbound", hasProficiency: true },
  { id: 194, name: "Salesforce CRM", clusterId: "SALES", subcategory: "CRM", hasProficiency: true },
  { id: 195, name: "Pipedrive / CRM Tools", clusterId: "SALES", subcategory: "CRM", hasProficiency: true },
  { id: 196, name: "Negotiation", clusterId: "SALES", subcategory: "Soft Skills", hasProficiency: false },
  { id: 197, name: "B2B Sales", clusterId: "SALES", subcategory: "Strategy", hasProficiency: true },
  { id: 198, name: "B2C Sales", clusterId: "SALES", subcategory: "Strategy", hasProficiency: true },
  { id: 199, name: "Account Management", clusterId: "SALES", subcategory: "Retention", hasProficiency: true },
  { id: 200, name: "Sales Presentation", clusterId: "SALES", subcategory: "Communication", hasProficiency: true },
  { id: 201, name: "LinkedIn Outreach", clusterId: "SALES", subcategory: "Social Selling", hasProficiency: true },
  { id: 202, name: "Proposal Writing", clusterId: "SALES", subcategory: "Communication", hasProficiency: true },
  { id: 203, name: "Telemarketing", clusterId: "SALES", subcategory: "Outbound", hasProficiency: true },
  { id: 204, name: "Retail Sales", clusterId: "SALES", subcategory: "In-Person", hasProficiency: true },
  { id: 205, name: "Real Estate Sales", clusterId: "SALES", subcategory: "Industry", hasProficiency: true },

  // ─── ENG: Engineering & Technical (206-225) ───
  { id: 206, name: "AutoCAD", clusterId: "ENG", subcategory: "CAD", hasProficiency: true },
  { id: 207, name: "Revit", clusterId: "ENG", subcategory: "BIM", hasProficiency: true },
  { id: 208, name: "SolidWorks", clusterId: "ENG", subcategory: "CAD / 3D", hasProficiency: true },
  { id: 209, name: "Civil Engineering", clusterId: "ENG", subcategory: "Discipline", hasProficiency: false },
  { id: 210, name: "Electrical Engineering", clusterId: "ENG", subcategory: "Discipline", hasProficiency: false },
  { id: 211, name: "Mechanical Engineering", clusterId: "ENG", subcategory: "Discipline", hasProficiency: false },
  { id: 212, name: "Project Management (Construction)", clusterId: "ENG", subcategory: "Management", hasProficiency: true },
  { id: 213, name: "Structural Analysis", clusterId: "ENG", subcategory: "Analysis", hasProficiency: true },
  { id: 214, name: "HVAC Design", clusterId: "ENG", subcategory: "Specialized", hasProficiency: true },
  { id: 215, name: "Quality Control / Inspection", clusterId: "ENG", subcategory: "QC", hasProficiency: true },
  { id: 216, name: "PLC Programming", clusterId: "ENG", subcategory: "Automation", hasProficiency: true },
  { id: 217, name: "Six Sigma / Lean", clusterId: "ENG", subcategory: "Process", hasProficiency: false },
  { id: 218, name: "Safety Management (OSHA)", clusterId: "ENG", subcategory: "Safety", hasProficiency: false },
  { id: 219, name: "Renewable Energy", clusterId: "ENG", subcategory: "Emerging", hasProficiency: false },
  { id: 220, name: "Quantity Surveying", clusterId: "ENG", subcategory: "Construction", hasProficiency: true },
  { id: 221, name: "GIS / Mapping", clusterId: "ENG", subcategory: "Geospatial", hasProficiency: true },
  { id: 222, name: "MATLAB", clusterId: "ENG", subcategory: "Software", hasProficiency: true },
  { id: 223, name: "IoT (Internet of Things)", clusterId: "ENG", subcategory: "Emerging", hasProficiency: true },
  { id: 224, name: "Robotics", clusterId: "ENG", subcategory: "Emerging", hasProficiency: true },
  { id: 225, name: "Electronics / PCB Design", clusterId: "ENG", subcategory: "Hardware", hasProficiency: true },

  // ─── HC: Healthcare (226-240) ───
  { id: 226, name: "Nursing (RN License)", clusterId: "HC", subcategory: "Clinical", hasProficiency: false },
  { id: 227, name: "Medical Technology", clusterId: "HC", subcategory: "Laboratory", hasProficiency: true },
  { id: 228, name: "Pharmacy", clusterId: "HC", subcategory: "Pharmaceutical", hasProficiency: true },
  { id: 229, name: "Caregiving", clusterId: "HC", subcategory: "Patient Care", hasProficiency: true },
  { id: 230, name: "Medical Coding (ICD-10)", clusterId: "HC", subcategory: "Health IT", hasProficiency: true },
  { id: 231, name: "Medical Billing", clusterId: "HC", subcategory: "Health IT", hasProficiency: true },
  { id: 232, name: "HIPAA Compliance", clusterId: "HC", subcategory: "Compliance", hasProficiency: false },
  { id: 233, name: "Electronic Health Records (EHR)", clusterId: "HC", subcategory: "Health IT", hasProficiency: true },
  { id: 234, name: "Telemedicine Support", clusterId: "HC", subcategory: "Digital Health", hasProficiency: true },
  { id: 235, name: "First Aid / BLS", clusterId: "HC", subcategory: "Emergency", hasProficiency: false },
  { id: 236, name: "Dental Assisting", clusterId: "HC", subcategory: "Dental", hasProficiency: true },
  { id: 237, name: "Physical Therapy", clusterId: "HC", subcategory: "Rehabilitation", hasProficiency: true },
  { id: 238, name: "Nutrition & Dietetics", clusterId: "HC", subcategory: "Wellness", hasProficiency: true },
  { id: 239, name: "Mental Health Support", clusterId: "HC", subcategory: "Behavioral", hasProficiency: true },
  { id: 240, name: "Medical Transcription", clusterId: "HC", subcategory: "Health IT", hasProficiency: true },

  // ─── EDU: Education & Training (241-252) ───
  { id: 241, name: "Teaching (K-12)", clusterId: "EDU", subcategory: "Teaching", hasProficiency: false },
  { id: 242, name: "ESL / TESOL Teaching", clusterId: "EDU", subcategory: "Language", hasProficiency: true },
  { id: 243, name: "Online Tutoring", clusterId: "EDU", subcategory: "Remote Teaching", hasProficiency: true },
  { id: 244, name: "Instructional Design", clusterId: "EDU", subcategory: "E-Learning", hasProficiency: true },
  { id: 245, name: "LMS Administration (Moodle/Canvas)", clusterId: "EDU", subcategory: "EdTech", hasProficiency: true },
  { id: 246, name: "Curriculum Development", clusterId: "EDU", subcategory: "Teaching", hasProficiency: true },
  { id: 247, name: "Corporate Training", clusterId: "EDU", subcategory: "L&D", hasProficiency: true },
  { id: 248, name: "E-Learning Content Creation", clusterId: "EDU", subcategory: "E-Learning", hasProficiency: true },
  { id: 249, name: "Assessment Design", clusterId: "EDU", subcategory: "Evaluation", hasProficiency: true },
  { id: 250, name: "Special Education (SPED)", clusterId: "EDU", subcategory: "Specialized", hasProficiency: false },
  { id: 251, name: "Student Counseling", clusterId: "EDU", subcategory: "Support", hasProficiency: false },
  { id: 252, name: "Academic Writing", clusterId: "EDU", subcategory: "Research", hasProficiency: true },

  // ─── TRADE: Skilled Trades & Logistics (253-267) ───
  { id: 253, name: "Warehouse Management", clusterId: "TRADE", subcategory: "Logistics", hasProficiency: true },
  { id: 254, name: "Supply Chain Management", clusterId: "TRADE", subcategory: "Logistics", hasProficiency: true },
  { id: 255, name: "Inventory Management", clusterId: "TRADE", subcategory: "Operations", hasProficiency: true },
  { id: 256, name: "Forklift Operation", clusterId: "TRADE", subcategory: "Equipment", hasProficiency: false },
  { id: 257, name: "Delivery / Courier Services", clusterId: "TRADE", subcategory: "Last Mile", hasProficiency: false },
  { id: 258, name: "Electrical Installation", clusterId: "TRADE", subcategory: "Electrical", hasProficiency: true },
  { id: 259, name: "Plumbing", clusterId: "TRADE", subcategory: "Construction", hasProficiency: true },
  { id: 260, name: "Welding", clusterId: "TRADE", subcategory: "Fabrication", hasProficiency: true },
  { id: 261, name: "HVAC Installation & Repair", clusterId: "TRADE", subcategory: "HVAC", hasProficiency: true },
  { id: 262, name: "Automotive Repair", clusterId: "TRADE", subcategory: "Automotive", hasProficiency: true },
  { id: 263, name: "Food Handling / HACCP", clusterId: "TRADE", subcategory: "Food Service", hasProficiency: false },
  { id: 264, name: "Heavy Equipment Operation", clusterId: "TRADE", subcategory: "Construction", hasProficiency: false },
  { id: 265, name: "Procurement", clusterId: "TRADE", subcategory: "Purchasing", hasProficiency: true },
  { id: 266, name: "Shipping / Freight Coordination", clusterId: "TRADE", subcategory: "Logistics", hasProficiency: true },
  { id: 267, name: "Last-Mile Logistics (Lazada/Shopee)", clusterId: "TRADE", subcategory: "E-Commerce", hasProficiency: false },
];

// ─── Cross-cluster skill resolution ───
// Skills that belong to multiple clusters. Resolution depends on user's other skills.

export interface CrossClusterSkill {
  primary: string;
  secondaries: string[];
  resolutionHint: string;
}

export const CROSS_CLUSTER_SKILLS: Record<string, CrossClusterSkill> = {
  "python": { primary: "DEV", secondaries: ["DATA"], resolutionHint: "DEV if paired with web frameworks; DATA if paired with analytics/ML tools" },
  "sql": { primary: "DEV", secondaries: ["DATA", "FIN"], resolutionHint: "DEV if paired with backend tools; DATA if paired with BI; FIN if paired with accounting" },
  "excel (advanced)": { primary: "DATA", secondaries: ["VA", "FIN"], resolutionHint: "DATA if paired with BI tools; VA if paired with admin tools; FIN if paired with accounting" },
  "figma": { primary: "DES", secondaries: ["DEV"], resolutionHint: "DES by default; DEV if paired with code skills" },
  "copywriting": { primary: "MKT", secondaries: ["DES", "VA"], resolutionHint: "MKT unless heavily paired with design or VA tools" },
  "wordpress": { primary: "DEV", secondaries: ["MKT"], resolutionHint: "DEV if paired with code skills; MKT if paired with content/SEO" },
  "shopify / liquid": { primary: "DEV", secondaries: ["MKT"], resolutionHint: "DEV if HTML/Liquid present; MKT if marketing tools present" },
  "google analytics": { primary: "MKT", secondaries: ["DATA"], resolutionHint: "MKT by default; DATA if paired with BI/analysis tools" },
  "project management (asana/trello)": { primary: "VA", secondaries: ["ENG", "DEV"], resolutionHint: "VA if with admin tools; DEV if with Jira/Agile" },
  "canva": { primary: "DES", secondaries: ["MKT", "VA"], resolutionHint: "DES if with other design tools; MKT/VA if only design tool" },
  "data entry": { primary: "BPO", secondaries: ["VA"], resolutionHint: "BPO if voice/non-voice skills present; VA if admin tools present" },
  "crm management": { primary: "BPO", secondaries: ["SALES"], resolutionHint: "BPO if with support tools; SALES if with lead gen tools" },
  "english proficiency": { primary: "BPO", secondaries: ["VA", "EDU", "MKT"], resolutionHint: "High weight in BPO; modifier in other clusters" },
  "technical writing": { primary: "MKT", secondaries: ["DEV", "EDU"], resolutionHint: "DEV for API docs; MKT for content; EDU for courses" },
  "financial analysis": { primary: "FIN", secondaries: ["DATA"], resolutionHint: "FIN if with accounting tools; DATA if with Python/BI" },
  "salesforce crm": { primary: "SALES", secondaries: ["BPO"], resolutionHint: "SALES for Sales Cloud; BPO for Service Cloud" },
  "medical coding (icd-10)": { primary: "HC", secondaries: ["BPO"], resolutionHint: "Always HC but BPO context for hiring" },
  "content moderation": { primary: "BPO", secondaries: ["MKT"], resolutionHint: "BPO in call center context; MKT for social media management" },
  "ai tools (chatgpt, claude, etc.)": { primary: "DATA", secondaries: ["DEV", "MKT", "VA", "BPO", "FIN", "SALES", "ENG", "HC", "EDU", "TRADE", "DES"], resolutionHint: "Boosting signal in any cluster" },
  "typing speed (50+ wpm)": { primary: "BPO", secondaries: ["VA"], resolutionHint: "Modifier skill, not primary cluster signal" },
};

// ─── Helpers ───

// Build a lookup from lowercase skill name → SkillEntry (cached on first call)
let _skillLookup: Map<string, SkillEntry> | null = null;
function getSkillLookup(): Map<string, SkillEntry> {
  if (!_skillLookup) {
    _skillLookup = new Map();
    for (const entry of SKILL_TAXONOMY) {
      _skillLookup.set(entry.name.toLowerCase(), entry);
    }
  }
  return _skillLookup;
}

/** Get all skill names in a given cluster */
export function getSkillsByCluster(clusterId: string): string[] {
  return SKILL_TAXONOMY
    .filter((s) => s.clusterId === clusterId)
    .map((s) => s.name);
}

/** Resolve a skill's cluster, handling cross-cluster skills using context from other user skills */
export function resolveSkillCluster(skillName: string, otherUserSkills: string[] = []): string | null {
  const key = skillName.toLowerCase();
  const lookup = getSkillLookup();

  // Direct taxonomy lookup
  const entry = lookup.get(key);
  if (!entry) return null;

  // Check cross-cluster
  const cross = CROSS_CLUSTER_SKILLS[key];
  if (!cross || otherUserSkills.length === 0) {
    return entry.clusterId;
  }

  // Count how many of user's other skills fall in each candidate cluster
  const candidates = [cross.primary, ...cross.secondaries];
  const clusterCounts: Record<string, number> = {};
  for (const c of candidates) clusterCounts[c] = 0;

  for (const other of otherUserSkills) {
    if (other.toLowerCase() === key) continue;
    const otherEntry = lookup.get(other.toLowerCase());
    if (otherEntry && clusterCounts[otherEntry.clusterId] !== undefined) {
      clusterCounts[otherEntry.clusterId]++;
    }
  }

  // Resolve: pick cluster with most surrounding skills; default to primary
  let best = cross.primary;
  let bestCount = clusterCounts[cross.primary] ?? 0;
  for (const sec of cross.secondaries) {
    const count = clusterCounts[sec] ?? 0;
    if (count > bestCount) {
      best = sec;
      bestCount = count;
    }
  }

  return best;
}

/** Get the properly cased display name for a skill */
export function getSkillDisplayName(skillName: string): string {
  const lookup = getSkillLookup();
  const entry = lookup.get(skillName.toLowerCase());
  return entry ? entry.name : skillName;
}
