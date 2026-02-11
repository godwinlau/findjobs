
import { extractSkillsHybrid } from '../lib/skills/huggingface';

// Mock env if needed
if (!process.env.HUGGINGFACE_API_KEY) {
    const fs = require('fs');
    const path = require('path');
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const match = envContent.match(/HUGGINGFACE_API_KEY=(.+)/);
        if (match) process.env.HUGGINGFACE_API_KEY = match[1].trim();
    }
}

const testCases = [
    {
        name: "Product Manager",
        text: `
We are looking for a Product Manager with experience in strategic planning and go-to-market strategy.
Requirements:
- 5+ years of experience in product management
- Strong understanding of agile methodologies and scrum
- Experience with budget management and P&L
- Proficiency in Jira and Confluence
- Excellent communication and leadership skills
        `
    },
    {
        name: "Software Engineer",
        text: `
Job Title: Full Stack Developer
We are hiring at Jollibee Foods Corporation for a Software Engineer.

Skills Required:
- Proficiency in JavaScript, TypeScript, and React
- Experience with Node.js and Express
- Database experience with PostgreSQL and MongoDB
- Familiarity with AWS and Docker
- Knowledge of REST APIs and GraphQL
- Experience with Git and CI/CD pipelines
        `
    },
    {
        name: "Social Media Manager",
        text: `
Company: J & T Express Philippines

Role: Social Media Manager

Responsibilities:
- Manage social media platforms including Facebook, Instagram, TikTok, and YouTube
- Create content using Canva and Adobe Suite
- Develop content marketing and copywriting strategies
- Analyze performance using Google Analytics
        `
    },
    {
        name: "Finance Analyst",
        text: `
We at Chevron Holdings are looking for a Finance Analyst.

Requirements:
- Strong Excel and financial modeling skills
- Experience with SAP and QuickBooks
- Knowledge of financial reporting and analysis
- Proficiency in Power BI or Tableau
- Understanding of accounting principles
        `
    },
    {
        name: "Virtual Assistant / Admin",
        text: `
Remote Virtual Assistant Position at ClearDesk

Skills:
- Proficiency in Microsoft Office and Google Workspace
- Experience with calendar management and scheduling
- Email management and data entry
- Knowledge of Slack and Microsoft Teams
- Strong organizational skills
        `
    }
];

async function run() {
    for (const testCase of testCases) {
        console.log(`\n📋 ${testCase.name}`);
        console.log("-".repeat(50));

        const skills = await extractSkillsHybrid(testCase.text, { includeSoftSkills: false });
        console.log("Skills:", skills);
    }
}

run();
