
import { createClient } from "@supabase/supabase-js";
import fs from 'fs';
import path from 'path';

// Load env vars manually
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const vars = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
    vars.forEach(v => {
        const re = new RegExp(`${v}=(.+)`);
        const match = envContent.match(re);
        if (match) process.env[v] = match[1].trim();
    });
}

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function check() {
    // Get 20 random jobs with skills
    const { data, error } = await supabase
        .from("jobs")
        .select("id, title, skills_required")
        .not("skills_required", "is", null)
        .limit(20);

    if (error) {
        console.error(error);
        return;
    }

    console.log(`Found ${data.length} jobs with skills:\n`);

    for (const job of data) {
        console.log(`📋 ${job.title}`);
        console.log(`   Skills: ${JSON.stringify(job.skills_required)}`);
        console.log();
    }
}

check();
