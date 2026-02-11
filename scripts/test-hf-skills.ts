import fs from 'fs';
import path from 'path';

// Load environment variables from .env.local manually
const envPath = path.resolve(process.cwd(), '.env.local');
let HUGGINGFACE_API_KEY = "";

if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/HUGGINGFACE_API_KEY=(.+)/);
    if (match) {
        HUGGINGFACE_API_KEY = match[1].trim();
    }
}

if (!HUGGINGFACE_API_KEY) {
    console.error("Error: HUGGINGFACE_API_KEY not found in .env.local");
    process.exit(1);
}

const JOB_DESCRIPTION_SAMPLE = `
We are looking for a Senior Software Engineer with experience in React, Node.js, and TypeScript.
You should be familiar with AWS, Docker, and Kubernetes.
Strong communication skills and leadership ability are required.
Experience with Python and machine learning is a plus.
`;

const LLM_MODEL = "HuggingFaceH4/zephyr-7b-beta";

async function runTest() {
    console.log("Testing LLM for skill extraction...");
    const prompt = `<|system|>
You are a helpful assistant that extracts skills from job descriptions.
<|user|>
Extract all technical skills from the following text as a JSON list of strings. Do not include soft skills. Return ONLY the JSON list.
Text: "${JOB_DESCRIPTION_SAMPLE.replace(/\n/g, " ")}"
<|assistant|>`;

    // Correct URL with hf-inference
    const url = `https://router.huggingface.co/hf-inference/models/${LLM_MODEL}`;

    console.log(`Querying ${url}...`);
    try {
        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
                "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({
                inputs: prompt,
                parameters: { max_new_tokens: 200, return_full_text: false, temperature: 0.1 }
            }),
        });

        if (!response.ok) {
            console.error("Error:", await response.text());
            // Fallback to api-inference if router fails (just in case, though usually router is the new way)
            console.log("Retrying with api-inference.huggingface.co...");
            const urlOld = `https://api-inference.huggingface.co/models/${LLM_MODEL}`;
            const response2 = await fetch(urlOld, {
                headers: {
                    Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
                    "Content-Type": "application/json",
                },
                method: "POST",
                body: JSON.stringify({
                    inputs: prompt,
                    parameters: { max_new_tokens: 200, return_full_text: false, temperature: 0.1 }
                }),
            });
            if (!response2.ok) {
                console.error("Error 2:", await response2.text());
            } else {
                const result = await response2.json();
                console.log("Result (Fallback):", JSON.stringify(result, null, 2));
            }

        } else {
            const result = await response.json();
            console.log("Result:", JSON.stringify(result, null, 2));
        }
    } catch (err) {
        console.error(err);
    }
}

runTest();
