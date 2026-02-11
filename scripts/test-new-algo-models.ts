
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

async function testFlanT5() {
    console.log("Testing google/flan-t5-large...");
    const url = "https://router.huggingface.co/models/google/flan-t5-large";
    const prompt = "Extract skills from: 'Experience with React and Node.js is required.'";

    try {
        const response = await fetch(url, {
            headers: { Authorization: `Bearer ${HF_API_KEY}`, "Content-Type": "application/json" },
            method: "POST",
            body: JSON.stringify({ inputs: prompt }),
        });
        const res = await response.json();
        console.log("FLAN-T5 Result:", JSON.stringify(res, null, 2));
    } catch (e) {
        console.error("FLAN-T5 Error:", e);
    }
}

async function testEmbeddings() {
    console.log("Testing sentence-transformers/all-MiniLM-L6-v2...");
    const url = "https://router.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2";

    try {
        const response = await fetch(url, {
            headers: { Authorization: `Bearer ${HF_API_KEY}`, "Content-Type": "application/json" },
            method: "POST",
            body: JSON.stringify({ inputs: ["React", "React.js", "Communication"] }),
        });

        if (!response.ok) {
            // Try standard model url fallback
            const url2 = "https://router.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2";
            console.log("Retrying with models/ endpoint...");
            const response2 = await fetch(url2, {
                headers: { Authorization: `Bearer ${HF_API_KEY}`, "Content-Type": "application/json" },
                method: "POST",
                body: JSON.stringify({ inputs: ["React", "React.js", "Communication"] }),
            });
            const res2 = await response2.json();
            // Embeddings are huge arrays, just check length
            if (Array.isArray(res2) && res2.length > 0) {
                console.log(`Embeddings success. Got ${res2.length} items.`);
            } else {
                console.log("Embeddings Result:", JSON.stringify(res2).substring(0, 200));
            }
        } else {
            const res = await response.json();
            if (Array.isArray(res)) {
                console.log(`Embeddings success. Got ${res.length} items.`);
            } else {
                console.log("Embeddings Result:", JSON.stringify(res).substring(0, 200));
            }
        }

    } catch (e) {
        console.error("Embeddings Error:", e);
    }
}

async function run() {
    await testFlanT5();
    console.log("---");
    await testEmbeddings();
}

run();
