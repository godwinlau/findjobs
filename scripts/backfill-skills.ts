import { createClient } from "@supabase/supabase-js";
import { extractSkillsFromJD } from "../lib/skills/skills_extraction";
import fs from 'fs';
import path from 'path';

// Load env vars manually
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');

    // Load specific vars needed
    const vars = [
        'NEXT_PUBLIC_SUPABASE_URL',
        'SUPABASE_SERVICE_ROLE_KEY',
        'GROQ_API_KEY'
    ];

    vars.forEach(v => {
        const re = new RegExp(`${v}=(.+)`);
        const match = envContent.match(re);
        if (match) {
            process.env[v] = match[1].trim();
        }
    });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
});

async function backfill() {
    console.log("Starting skills backfill...");

    // 1. Fetch jobs — optionally target a single job by ID
    const targetJobId = process.argv[2];

    let query = supabase
        .from("jobs")
        .select("id, title, description_plain, skills_required")
        .eq("is_active", true);

    if (targetJobId) {
        query = supabase
            .from("jobs")
            .select("id, title, description_plain, skills_required")
            .eq("id", targetJobId);
    }

    const { data: jobs, error } = await query;

    if (error) {
        console.error("Error fetching jobs:", error);
        return;
    }

    console.log(`Found ${jobs.length} active jobs.\n`);

    let processed = 0;
    let updated = 0;
    let skipped = 0;
    let errors = 0;

    for (const job of jobs) {
        if (!job.description_plain) {
            skipped++;
            processed++;
            console.log(`[${processed}/${jobs.length}] SKIPPED (no description) | ${job.title?.substring(0, 50)}`);
            continue;
        }

        try {
            const result = await extractSkillsFromJD(job.description_plain);
            const newSkills = result.skills.map((s: any) => s.label);

            if (newSkills.length > 0) {
                const { error: updateError } = await supabase
                    .from("jobs")
                    .update({ skills_required: newSkills })
                    .eq("id", job.id);

                if (updateError) {
                    errors++;
                    console.error(`[${processed + 1}/${jobs.length}] ❌ DB update failed ${job.id}: ${updateError.message}`);
                } else {
                    updated++;
                    const oldCount = (job.skills_required || []).length;
                    console.log(`[${processed + 1}/${jobs.length}] ✅ ${oldCount} → ${newSkills.length} skills | ${job.title?.substring(0, 50)}`);
                }
            } else {
                skipped++;
                console.log(`[${processed + 1}/${jobs.length}] ⏭ No skills extracted | ${job.title?.substring(0, 50)}`);
            }
        } catch (err: any) {
            errors++;
            console.error(`[${processed + 1}/${jobs.length}] ❌ ${job.id}: ${err.message}`);
        }

        processed++;

        // 2.5s delay to avoid Groq 429 rate limits
        await new Promise(r => setTimeout(r, 2500));
    }

    console.log("\n--------------------------------------------------");
    console.log(`✅ Done: ${processed} processed, ${updated} updated, ${skipped} skipped, ${errors} errors`);
}

backfill();
