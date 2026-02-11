
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

const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;
if (!HF_API_KEY) {
    console.error("Missing API Key");
    process.exit(1);
}

const JOB_DESCRIPTION_SAMPLE = `
We are looking for a Senior Software Engineer with experience in React, Node.js, and TypeScript.
You should be familiar with AWS, Docker, and Kubernetes.
Strong communication skills and leadership ability are required.
Experience with Python and machine learning is a plus.
We also use Jira and Confluence.
Looking for someone who knows their way around a Linux terminal.
`;

const MODEL_ID = "Qwen/Qwen2.5-72B-Instruct";

async function runTest() {
    console.log(`Testing LLM extraction with ${MODEL_ID}...`);

    const prompt = `<|im_start|>system
You are an expert technical recruiter. Extract all technical skills, tools, and programming languages from the text below. 
Rules:
1. Return ONLY a JSON list of strings (e.g. ["React", "Python"]).
2. Exclude soft skills like "communication" or "leadership".
3. Normalize names (e.g., "React.js" -> "React").
4. Do not include any explanation or markdown formatting outside the JSON.
<|im_end|>
<|im_start|>user
Text:
"${JOB_DESCRIPTION_SAMPLE.replace(/\n/g, " ")}"
<|im_end|>
<|im_start|>assistant
`;

    const payload = {
        inputs: prompt,
        parameters: {
            max_new_tokens: 500,
            temperature: 0.1,
            return_full_text: false
        }
    };

    // Try standard router URL
    const url = `https://router.huggingface.co/models/${MODEL_ID}`;

    try {
        console.log(`Querying ${url}...`);
        const response = await fetch(url, {
            headers: { Authorization: `Bearer ${HF_API_KEY}`, "Content-Type": "application/json" },
            method: "POST",
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            console.error("Error Status:", response.status);
            console.error("Error Body:", await response.text());
            return;
        }

        const result = await response.json();
        // console.log("Raw Result:", JSON.stringify(result, null, 2));

        if (Array.isArray(result) && result[0]?.generated_text) {
            try {
                let text = result[0].generated_text;
                console.log("Generated Text:\n", text);

                const start = text.indexOf('[');
                const end = text.lastIndexOf(']');
                if (start !== -1 && end !== -1) {
                    const jsonString = text.substring(start, end + 1);
                    const skills = JSON.parse(jsonString);
                    console.log("\nParsed Skills:", skills);
                } else {
                    console.log("\nCould not find JSON in output");
                }
            } catch (e) {
                console.log("JSON Parse Error.");
            }
        }

    } catch (err) {
        console.error(err);
    }
}

runTest();
