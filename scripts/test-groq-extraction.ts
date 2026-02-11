#!/usr/bin/env npx tsx
/**
 * Quick smoke test for Groq LLM skill extraction.
 * Usage: npx tsx scripts/test-groq-extraction.ts
 */

import { extractSkillsLLM, extractSkillsWithStructured } from "../lib/skills/groq-extraction";

const SAMPLE_JDS = [
  {
    title: "Full-Stack Developer",
    text: `We are looking for a Full-Stack Developer with strong experience in React, Node.js, and PostgreSQL.
    Must have experience with TypeScript, REST APIs, and Git.
    Nice to have: Docker, AWS, CI/CD pipelines.
    At least 3 years of experience in web development.`,
  },
  {
    title: "Virtual Assistant",
    text: `Hiring a Virtual Assistant to manage emails, calendar scheduling, and social media accounts.
    Must be proficient in Google Workspace, Canva, and basic bookkeeping.
    Experience with Shopify and customer support is a plus.
    Excellent English communication required.`,
  },
  {
    title: "Data Analyst",
    text: `Data Analyst role requiring SQL, Python, and Excel expertise.
    Experience with Tableau or Power BI for data visualization.
    Knowledge of statistics and A/B testing methodologies.
    Familiarity with BigQuery and ETL processes preferred.`,
  },
];

async function main() {
  console.log("=== Groq LLM Extraction Test ===\n");

  if (!process.env.GROQ_API_KEY) {
    console.error("GROQ_API_KEY not set. Export it first:");
    console.error("  export GROQ_API_KEY=your_key_here");
    process.exit(1);
  }

  for (const sample of SAMPLE_JDS) {
    console.log(`--- ${sample.title} ---`);

    // Test raw LLM extraction
    const llmResult = await extractSkillsLLM(sample.text);
    console.log(`  LLM raw skills: ${llmResult.raw.length}`);
    console.log(`  Mapped to ontology: ${llmResult.mapped.length}`);
    console.log(`  Unmapped: ${llmResult.unmapped.length}`);

    if (llmResult.mapped.length > 0) {
      console.log("  Mapped skills:");
      for (const s of llmResult.mapped) {
        console.log(`    - ${s.label} [${s.importance}] (${s.domain}, conf: ${s.confidence})`);
      }
    }
    if (llmResult.unmapped.length > 0) {
      console.log("  Unmapped skills:");
      for (const s of llmResult.unmapped) {
        console.log(`    - ${s.name} [${s.importance}] (${s.category})`);
      }
    }

    // Test the full wrapper (with fallback)
    const structured = await extractSkillsWithStructured(sample.text);
    console.log(`  Final skills_required: [${structured.skills_required.join(", ")}]`);
    console.log(`  Final skills_structured count: ${structured.skills_structured.length}`);
    console.log();
  }

  // Test fallback: empty GROQ_API_KEY scenario
  console.log("--- Fallback test (simulated) ---");
  const fallback = await extractSkillsWithStructured(
    "Looking for someone with React and Node.js experience"
  );
  console.log(`  Fallback result: [${fallback.skills_required.join(", ")}]`);
  console.log(`  Structured count: ${fallback.skills_structured.length}`);
}

main().catch(console.error);
