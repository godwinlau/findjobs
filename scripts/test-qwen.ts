
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

async function testQwen() {
    const modelId = "Qwen/Qwen2.5-72B-Instruct";
    console.log(`Testing ${modelId}...`);
    const url = `https://router.huggingface.co/hf-inference/models/${modelId}`;
    const prompt = "Extract key technical skills from this text: 'We need React, Node.js, and AWS experience.' API Response must be a comma-separated list.";

    try {
        const response = await fetch(url, {
            headers: { Authorization: `Bearer ${HF_API_KEY}`, "Content-Type": "application/json" },
            method: "POST",
            body: JSON.stringify({ inputs: prompt }),
        });

        if (response.ok) {
            const res = await response.json();
            console.log(`SUCCESS [${modelId}]:`, JSON.stringify(res, null, 2));
        } else {
            console.log(`FAILED [${modelId}]: ${response.status} ${response.statusText}`);
            const txt = await response.text();
            console.log(txt);
        }
    } catch (e) {
        console.error(`ERROR [${modelId}]:`, e);
    }
}

testQwen();
