
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

async function testModel(modelId: string) {
    console.log(`Testing ${modelId}...`);
    const url = `https://router.huggingface.co/hf-inference/models/${modelId}`;
    const prompt = "Extract skills from: 'Experience with React and Node.js is required.'";

    try {
        const response = await fetch(url, {
            headers: { Authorization: `Bearer ${HF_API_KEY}`, "Content-Type": "application/json" },
            method: "POST",
            body: JSON.stringify({ inputs: prompt }),
        });

        if (response.ok) {
            const res = await response.json();
            console.log(`SUCCESS [${modelId}]:`, JSON.stringify(res, null, 2));
            return true;
        } else {
            console.log(`FAILED [${modelId}]: ${response.status} ${response.statusText}`);
            return false;
        }
    } catch (e) {
        console.error(`ERROR [${modelId}]:`, e);
        return false;
    }
}

async function run() {
    await testModel("google/flan-t5-base");
    await testModel("google/flan-t5-small");
    await testModel("google/flan-t5-large");
}

run();
