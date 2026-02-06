// Maps work categories → default skill suggestions for onboarding Screen 3
// When a user selects work categories in Step 1, these skills are shown first in Step 3
// Uses canonical skill names from PRD taxonomy (ph_job_app_skill_taxonomy.xlsx)

export const CATEGORY_SKILL_MAP: Record<string, string[]> = {
  tech_it: [
    "HTML", "CSS", "JavaScript", "TypeScript", "React", "Next.js",
    "Node.js", "Python", "SQL", "Git", "AWS", "Docker",
  ],
  bpo: [
    "Customer Service (Voice)", "Customer Service (Non-Voice)", "Email Support",
    "Live Chat Support", "English Proficiency", "Typing Speed (50+ WPM)",
    "Zendesk", "Salesforce Service Cloud", "CRM Management", "Data Entry",
  ],
  admin: [
    "Microsoft Office Suite", "Google Workspace", "Calendar Management",
    "Email Management", "Project Management (Asana/Trello)", "Document Formatting",
    "Research & Reporting", "Notion", "Slack / Teams Communication",
  ],
  sales: [
    "SEO", "Google Ads (SEM)", "Facebook/Meta Ads", "Social Media Management",
    "Copywriting", "Email Marketing", "Lead Generation", "Cold Calling",
    "CRM Management", "Content Writing",
  ],
  design: [
    "Figma", "Adobe Photoshop", "Adobe Illustrator", "Canva", "UI Design",
    "UX Design", "Adobe Premiere Pro", "Adobe After Effects",
    "Brand Identity Design", "Typography",
  ],
  accounting: [
    "Bookkeeping", "QuickBooks", "Excel (Advanced)", "Financial Analysis",
    "Payroll Processing", "Tax Preparation (PH)", "SAP",
    "Accounts Payable / Receivable", "Budgeting & Forecasting",
  ],
  healthcare: [
    "Nursing (RN License)", "Medical Coding (ICD-10)", "Medical Billing",
    "Caregiving", "Electronic Health Records (EHR)", "HIPAA Compliance",
    "Telemedicine Support", "First Aid / BLS", "Medical Transcription",
  ],
  education: [
    "Teaching (K-12)", "ESL / TESOL Teaching", "Online Tutoring",
    "Instructional Design", "LMS Administration (Moodle/Canvas)",
    "Curriculum Development", "Academic Writing",
  ],
  skilled_trade: [
    "Warehouse Management", "Supply Chain Management", "Electrical Installation",
    "Welding", "HVAC Installation & Repair", "Automotive Repair",
    "Forklift Operation", "Plumbing",
  ],
  other: [
    "Time Management", "Client Communication", "Microsoft Office Suite",
    "Google Workspace", "Research & Reporting", "English Proficiency",
  ],
};
