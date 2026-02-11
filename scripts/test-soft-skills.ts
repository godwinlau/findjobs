
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

async function run() {
    const text = `
    We need a Strong Leader with excellent Communication skills.
    Must know React and TypeScript.
    `;

    console.log("--- Testing with includeSoftSkills: true ---");
    const skillsWithSoft = await extractSkillsHybrid(text, { includeSoftSkills: true });
    console.log("Skills:", skillsWithSoft);

    console.log("\n--- Testing with includeSoftSkills: false (default) ---");
    const skillsWithoutSoft = await extractSkillsHybrid(text, { includeSoftSkills: false });
    console.log("Skills:", skillsWithoutSoft);
}

run();
