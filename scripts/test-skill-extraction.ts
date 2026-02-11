
import { extractSkillsHybrid, extractSkillsSync, extractSkillsWithMetadata } from '../lib/skills/huggingface';
import fs from 'fs';
import path from 'path';

// Load env vars manually
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/HUGGINGFACE_API_KEY=(.+)/);
    if (match) {
        process.env.HUGGINGFACE_API_KEY = match[1].trim();
    }
}

const SAMPLES = [
    {
        label: "Mobile Application Developer – iOS & Android (Full Remote)",
        text: `We are looking for an experienced Native Mobile Application Developer to build, maintain, and optimize i OS and Android applications. This is a remote, full-time role working closely with a UK-based engineering team.

Key Responsibilities

• Design, build, and maintain native mobile apps for i OS (Swift) and Android (Kotlin)

• Write clean, maintainable code following platform-specific best practices

• Implement scalable and secure mobile application architecture

• Integrate mobile apps with REST APIs and authentication services (OAuth, JWT)

• Optimize applications for performance, responsiveness, and reliability

• Apply SOLID principles and clean architecture

• Ensure compliance with OWASP Mobile security standards

• Participate in code reviews and continuous improvement initiatives

• Configure and manage build, signing, and release processes for App Store and Google Play

• Write and maintain unit and integration tests

• Troubleshoot and resolve bugs, crashes, and performance issues

• Collaborate with UK-based developers, PMs, and stakeholders

• Participate in stand-ups, sprint planning, and retrospectives

Technical Requirements
At least 3 years of experience in native mobile development (i OS and/or Android)
Strong hands-on experience with Swift and/or Kotlin
Solid understanding of mobile app lifecycle, architecture, and state management
Experience building and integrating RESTful APIs
Familiarity with App Store and Google Play publishing processes
Knowledge of secure coding practices and mobile security standards
Proficient in Git and collaborative workflows
Experience with CI/CD pipelines for mobile builds is a plus
`,
    },
    {
        label: "UI/UX Designer onsite",
        text: `Responsibilities
Understand mobile gaming industry trends and their choices of UI/UX aesthetics and conventions
Collaborate with game designers to conceptualize the UI/UX and ensure its consistency with game design (templates, assets, UI style guides, etc)
Create wireframes, storyboards, user flows, and prototypes to effectively communicate interaction and design ideas
Learn insights from user data to improve the visual quality and engagement of user interfaces
Frequent communication with PH art team to create production UI assets across multiple titles using draw-overs and examples
Help improve our UI production pipeline and process to deliver key milestones effectively (specifications, optimizations, wikis, guides, etc)
Design and conduct UX research via playtest sessions & surveys to validate the usability of new and existing features or designs
Requirements
An online portfolio is required to show works featuring game UI/UX before being considered for an interview. Include images and a Demo reel if possible. Please indicate the link on your resume.

BA/BS Multimedia degree or other related field
Experience as a UI/UX Designer, ideally within the video games industry is an advantage
Must demonstrate UI/UX design skills with a strong portfolio
Experience creating wireframes, storyboards, user flows, visual designs, and
mobile prototypes as well as clear documentation.

`,
    },
    {
        label: "Data Analyst",
        text: `Hiring a Data Analyst with strong SQL and Excel skills.
Experience with Python, Pandas, and data visualization tools like Tableau or Power BI.
Must be comfortable with statistical analysis and A/B testing.
Familiarity with BigQuery or Snowflake is preferred.`,
    },
    {
        label: "Customer Service Representative - PH (Remote)",
        text: `Overview:

Snapscale is seeking a Customer Service Representative to join our growing team. This role is ideal for a customer-focused professional who excels at communication, problem-solving, and delivering consistent, high-quality service. As a key point of contact for our customers, you will help ensure a positive experience by responding to inquiries, resolving issues efficiently, and supporting company operations through accurate documentation and coordination.

Key Responsibilities:

Interact with customers via phone, email, or in-person to provide information and resolve inquiries or issues
Handle customer complaints, providing appropriate solutions and alternatives within established guidelines
Assist with collections and invoicing while supporting additional in-scope administrative tasks, including conducting call checks and related operational support activities
Maintain a positive, empathetic, and professional attitude toward customers at all times
Process orders, forms, applications, and requests accurately and efficiently
Keep detailed records of customer interactions, transactions, comments, and complaints
Communicate and coordinate with internal departments to ensure customer needs are met
Follow communication procedures, guidelines, and company policies
Stay knowledgeable about company products, services, and policies
Ensure customer satisfaction and provide feedback to the customer service manager

Perks:

Health Maintenance Organization (HMO)
Competitive pay
Government-mandated benefits
13th month pay
Night differential pay
Internet allowance
Perfect attendance bonus
Yearly salary increase
Opportunities for career growth and development
Fun and supportive working environment

Requirements:

Minimum of 1 year relevant experience in the BPO or customer service industry
Accounts Receivable and Billing experience (preferred)
Strong verbal communication skills with the ability to speak clearly, professionally, and confidently on calls
Excellent written communication skills for handling professional email and chat correspondence
Highly organized, detail-oriented, and capable of managing multiple tasks while meeting deadlines
Demonstrates patience, composure, and a solutions-focused approach in high-pressure situations
Collaborative team player with a proactive mindset and strong sense of ownership and accountability
Ability to follow processes, adapt to feedback, and maintain high service quality standards
Comfortable using CRM systems, ticketing tools, and standard office software`,
    },
];

async function runTest() {
    console.log("=== SKILL EXTRACTION PIPELINE TEST ===\n");

    // --- Test 1: Sync extraction (Pass 1 + 2 only, no API) ---
    console.log("--- TEST 1: Sync Extraction (regex + synonym, no API) ---\n");
    for (const sample of SAMPLES) {
        console.log(`[${sample.label}]`);
        const skills = extractSkillsSync(sample.text);
        console.log(`  Found ${skills.length} skills: ${skills.join(", ")}`);
        console.log();
    }

    // --- Test 2: Async extraction with embeddings (Pass 1 + 2 + 3) ---
    const hasApiKey = !!process.env.HUGGINGFACE_API_KEY;
    console.log(`--- TEST 2: Async Extraction (all 3 passes, embeddings=${hasApiKey}) ---\n`);
    for (const sample of SAMPLES) {
        console.log(`[${sample.label}]`);
        try {
            const skills = await extractSkillsHybrid(sample.text);
            console.log(`  Found ${skills.length} skills: ${skills.join(", ")}`);
        } catch (error) {
            console.error(`  ERROR:`, error);
        }
        console.log();
    }

    // --- Test 3: Full metadata for first sample ---
    console.log("--- TEST 3: Full Metadata (first sample) ---\n");
    try {
        const result = await extractSkillsWithMetadata(SAMPLES[0].text, { includeSoftSkills: true });
        console.log(`Total skills: ${result.metadata.total_skills_found}`);
        console.log(`Pass breakdown: regex=${result.metadata.pass_breakdown.regex}, synonym=${result.metadata.pass_breakdown.synonym}, embedding=${result.metadata.pass_breakdown.embedding}`);
        console.log();
        for (const skill of result.skills) {
            console.log(`  ${skill.label.padEnd(25)} | domain=${skill.domain.padEnd(6)} | tier=${skill.tier.padEnd(10)} | conf=${skill.confidence.toFixed(2)} | method=${skill.matchMethod}`);
        }
    } catch (error) {
        console.error("  ERROR:", error);
    }

    console.log("\n=== DONE ===");
}

runTest();
