Alright, let’s actually make this thing behave like a skill extractor, not a “random proper-noun collector” 😅

Below is a rewritten version of your pipeline that:
	•	✅ Uses your section heuristics (extractCandidateLines)
	•	✅ Keeps your regex baseline (extractSkillsRegex)
	•	✅ Switches from generic NER → to a text2text model that maps sentences → skills
	•	✅ Normalizes + dedupes skills
	•	✅ Lets you optionally keep or ignore soft skills

I’ll show:
	1.	What the new flow does conceptually
	2.	Full TypeScript code (drop-in replacement)
	3.	What you’d roughly get for that Senior Product Manager JD

⸻

1. New flow (high level)

Instead of:

JD → NER → tokens like “Sales”, “Marketing”, “Product”

We’re doing:
	1.	extractCandidateLines(text)
→ only skill-ish / responsibility lines.
	2.	For each candidate line:
call Hugging Face text2text model (e.g. google/flan-t5-base) with a prompt like:
“Extract the core professional skills from this requirement. Return ONLY a comma-separated list of skills.”
	3.	Parse that comma-separated output → normalize each skill.
	4.	Merge with your extractSkillsRegex output.
	5.	Filter with isIgnored depending on whether you want hard-only or hard+soft skills.

So we’re using the model as a sentence → capability compressor, which is what you did manually earlier (“Create smart short-term and long-term plans…” → Strategic planning).

⸻

2. Rewritten TypeScript code

You can keep this in the same file where you had extractSkillsHybrid.
I’ll:
	•	Keep extractCandidateLines (slightly reused)
	•	Replace the NER stuff with a skill extractor call
	•	Add an includeSoftSkills option

import { extractSkills as extractSkillsRegex } from "./queries";

const HF_SKILL_MODEL_ID = "google/flan-t5-base"; // text2text model

interface HFText2TextOutput {
  generated_text: string;
}

// Heuristic sections that likely contain skills / responsibilities
const SECTION_KEYWORDS = [
  "responsibilities",
  "skills",
  "requirements",
  "qualifications",
  "experience",
  "what you need",
  "about the role",
  "competencies",
];

/**
 * Step 1: Extract lines that likely contain skills or responsibilities.
 * Focus on relevant sections and bullet points.
 */
function extractCandidateLines(text: string): string[] {
  const lines = text.split(/\n+/);
  const candidates: string[] = [];
  let isRelevantSection = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const lower = line.toLowerCase();

    // Section header detection
    const isHeader =
      SECTION_KEYWORDS.some(
        (kw) => lower.includes(kw) && lower.length < 80
      ) && !/[.:]/.test(lower); // crude heuristic: headers often lack punctuation

    if (isHeader) {
      isRelevantSection = true;
      continue; // don't add header itself
    }

    // Bullets are almost always candidate lines under relevant sections
    const isBullet = /^[-•*>]/.test(line);

    if (isRelevantSection && (isBullet || line.length > 20)) {
      candidates.push(line.replace(/^[-•*>\s]+/, "").trim());
    }
  }

  // If nothing found (rare), fall back to whole text
  if (candidates.length === 0) return lines.map((l) => l.trim()).filter(Boolean);

  return candidates;
}

/**
 * Normalize a skill string into a clean, consistent form.
 */
function normalizeSkill(skill: string): string {
  let s = skill.trim();

  // Remove "skills:" prefix
  s = s.replace(/^skills?:?\s*/i, "");

  // Remove leading/trailing bullets / punctuation
  s = s.replace(/^[-•*>\s]+/, "").replace(/[:;,.!?]+$/, "");

  // Collapse spaces
  s = s.replace(/\s+/g, " ");

  return s;
}

// Soft skills we may want to optionally ignore when `includeSoftSkills === false`
const SOFT_SKILL_TERMS = [
  "communication",
  "leadership",
  "teamwork",
  "motivation",
  "initiative",
  "creativity",
  "problem solving",
  "time management",
  "critical thinking",
  "adaptability",
  "collaboration",
  "interpersonal",
  "organization",
  "presentation",
  "negotiation",
  "conflict resolution",
  "decision making",
  "analytical",
  "detail oriented",
  "self starter",
  "work ethic",
];

const GENERIC_NON_SKILLS = [
  // Job titles / generic terms you don't want as "skills"
  "senior",
  "junior",
  "lead",
  "manager",
  "director",
  "vp",
  "head",
  "team",
  "client",
  "company",
  "services",
  "solutions",
  "inc",
  "ltd",
  "corp",
  "group",
  "department",
  "division",
  "branch",
  "office",
  "agency",
  "firm",
  "engineer",
  "developer",
  "analyst",
  "consultant",
  "specialist",
  "experience",
  "requirements",
  "qualification",
  "degree",
  "university",
  "bachelor",
  "master",
  "phd",
  "diploma",
  "certificate",
  "license",
];

function isIgnored(skill: string, includeSoftSkills: boolean): boolean {
  const lower = skill.toLowerCase();

  if (skill.length <= 1) return true;
  if (/^[^a-z0-9]+$/i.test(skill)) return true;

  // Ignore generic non-skill tokens
  if (GENERIC_NON_SKILLS.some((g) => lower === g)) return true;

  // Ignore soft skills only if requested
  if (!includeSoftSkills) {
    if (SOFT_SKILL_TERMS.some((soft) => lower === soft)) return true;
  }

  return false;
}

/**
 * Calls Hugging Face Inference API with a text2text model (e.g. T5)
 * to extract skills from a single requirement line.
 */
async function queryHfSkillExtractor(line: string): Promise<string[]> {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    console.warn("HUGGINGFACE_API_KEY is not set. Skipping AI skill extraction.");
    return [];
  }

  const prompt = `
Extract the core professional skills from the following job requirement. 
Return ONLY a comma-separated list of skills, no explanations.

Requirement: ${line}

Skills:
`.trim();

  try {
    const response = await fetch(
      `https://router.huggingface.co/hf-inference/models/${HF_SKILL_MODEL_ID}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ inputs: prompt }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Hugging Face API Error: ${response.status} ${response.statusText}`,
        errorText
      );
      return [];
    }

    const result = await response.json();

    // HF text2text router usually returns an array of { generated_text }
    if (!Array.isArray(result) || !result[0]?.generated_text) {
      console.warn("Unexpected HF text2text response format:", result);
      return [];
    }

    const output = (result[0] as HFText2TextOutput).generated_text;
    const rawSkills = output
      .split(",")
      .map((s) => normalizeSkill(s))
      .filter(Boolean);

    return rawSkills;
  } catch (error) {
    console.error("Failed to query Hugging Face skill extractor:", error);
    return [];
  }
}

interface ExtractSkillsOptions {
  includeSoftSkills?: boolean; // default: true
}

/**
 * Main entry: Extract skills from a job description using:
 * 1. Regex-based extraction (baseline)
 * 2. Text2text LLM extraction over candidate lines
 * 3. Normalization + dedupe + optional soft-skill filtering
 */
export async function extractSkillsHybrid(
  text: string,
  options: ExtractSkillsOptions = {}
): Promise<string[]> {
  const includeSoftSkills = options.includeSoftSkills ?? true;

  // 1. Baseline skills from regex
  const regexSkills = extractSkillsRegex(text)
    .map(normalizeSkill)
    .filter((s) => !isIgnored(s, includeSoftSkills));

  // 2. Narrow text to candidate lines
  const candidateLines = extractCandidateLines(text);

  const aiSkillsSet = new Set<string>();

  // 3. For each candidate line, call the HF skill extractor
  // (You can later batch this if you hit performance issues)
  for (const line of candidateLines) {
    // Hard limit prompt size just in case
    const truncatedLine = line.slice(0, 400);

    const extracted = await queryHfSkillExtractor(truncatedLine);

    for (const rawSkill of extracted) {
      const skill = normalizeSkill(rawSkill);
      if (!skill) continue;
      if (isIgnored(skill, includeSoftSkills)) continue;

      aiSkillsSet.add(skill);
    }
  }

  // 4. Merge regex + AI skills with case-insensitive dedupe
  const finalSkills = new Set<string>();

  const addSkill = (skill: string) => {
    const lower = skill.toLowerCase();
    const exists = [...finalSkills].some((s) => s.toLowerCase() === lower);
    if (!exists) finalSkills.add(skill);
  };

  regexSkills.forEach(addSkill);
  aiSkillsSet.forEach(addSkill);

  // 5. Sorted for stable output
  return Array.from(finalSkills).sort((a, b) =>
    a.toLowerCase().localeCompare(b.toLowerCase())
  );
}


⸻

3. What you’d get for that Senior Product Manager JD

With this rewritten approach (and assuming the T5 model behaves decently), you’d get skills much closer to what you manually extracted earlier.

Something along the lines of (not exact, but typically similar):
	•	Strategic planning
	•	Budget management
	•	Profit optimization
	•	Supply chain coordination
	•	Pricing strategy
	•	Product launch management
	•	Go-to-market planning
	•	Marketing collateral creation
	•	Sales enablement
	•	Brand management
	•	Stakeholder management
	•	Key opinion leader engagement
	•	Distributor relationship management
	•	Customer insight gathering
	•	Self-starter mindset (if includeSoftSkills: true)
	•	Effective communication (if includeSoftSkills: true)
	•	Problem solving (if includeSoftSkills: true)
	•	Multi-brand management
	•	Target achievement

Way better than:

“Business, Growth, Key, Opinion, Leaders, Marketing, Product, Sales…”

⸻

4. How to call it

Example usage:

const jd = `... that full Senior Product Manager description ...`;

const skills = await extractSkillsHybrid(jd, {
  includeSoftSkills: true, // or false if you only want hard/functional skills
});

console.log(skills);


⸻

If you want, next step we can:
	•	Add a second function that tags each skill as hard / soft / functional, or
	•	Wrap this into a tiny API route (Next.js / Express) so you can hit it from a UI where you paste a JD and see extracted skills instantly.