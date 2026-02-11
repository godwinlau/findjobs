// groq-extraction.ts
// LLM-based skill extraction using Groq (llama-3.1-8b-instant)
// Replaces the 4-pass pipeline with a single LLM call + ontology normalization.

import {
  SKILL_ONTOLOGY,
  buildSkillIndex,
  type SkillNode,
  type SkillTier,
} from "./skills_ontology";
import { extractSkillsFromJDSync } from "./skills_extraction";

// ---------------------------------------------------------------------------
// TYPES
// ---------------------------------------------------------------------------

export interface LLMExtractedSkill {
  name: string;
  importance: "core" | "important" | "nice_to_have";
  category: string;
  confidence: number;
}

export interface NormalizedExtractedSkill {
  skillId: string;
  label: string;
  importance: "core" | "important" | "nice_to_have";
  confidence: number;
  domain: string;
  tier: SkillTier;
}

export interface LLMExperience {
  min_years: number | null;
  max_years: number | null;
  level: "entry" | "junior" | "mid" | "senior" | null;
}

export interface LLMSalary {
  min: number | null;
  max: number | null;
  currency: "PHP" | "USD" | "GBP" | "EUR" | null;
  period: "monthly" | "yearly" | "hourly" | "weekly" | null;
}

export interface StructuredExtractionResult {
  mapped: NormalizedExtractedSkill[];
  unmapped: LLMExtractedSkill[];
  raw: LLMExtractedSkill[];
  experience: LLMExperience;
  salary: LLMSalary;
}

/** JSONB shape stored in `jobs.skills_structured` */
export interface SkillStructuredEntry {
  skillId: string;
  label: string;
  importance: "core" | "important" | "nice_to_have";
  confidence: number;
  domain: string;
  tier: SkillTier;
}

// ---------------------------------------------------------------------------
// RATE LIMITING (Groq free tier: 30 req/min)
// ---------------------------------------------------------------------------

let _lastCallTime = 0;
const MIN_INTERVAL_MS = 4000; // ~15 calls/min to stay within Groq free tier TPM

async function waitForRateLimit(): Promise<void> {
  const now = Date.now();
  const elapsed = now - _lastCallTime;
  if (elapsed < MIN_INTERVAL_MS) {
    await new Promise((r) => setTimeout(r, MIN_INTERVAL_MS - elapsed));
  }
  _lastCallTime = Date.now();
}

// ---------------------------------------------------------------------------
// ONTOLOGY INDEX (lazy singleton)
// ---------------------------------------------------------------------------

let _index: ReturnType<typeof buildSkillIndex> | null = null;

function getIndex() {
  if (!_index) {
    _index = buildSkillIndex(SKILL_ONTOLOGY);
  }
  return _index;
}

// ---------------------------------------------------------------------------
// LLM EXTRACTION
// ---------------------------------------------------------------------------

const EXTRACTION_PROMPT = `You are a job posting analysis engine for the Philippines market.

Given a job description, extract skills, experience requirements, and salary information.

Return a JSON object with this exact structure:
{
  "skills": [
    {
      "name": "skill name (use standard industry names, e.g. 'React' not 'ReactJS')",
      "importance": "core" | "important" | "nice_to_have",
      "category": "development" | "design" | "marketing" | "sales" | "bpo" | "admin" | "finance" | "tools" | "content" | "soft" | "other",
      "confidence": 0.0 to 1.0
    }
  ],
  "experience": {
    "min_years": null or number,
    "max_years": null or number,
    "level": null | "entry" | "junior" | "mid" | "senior"
  },
  "salary": {
    "min": null or number,
    "max": null or number,
    "currency": "PHP" | "USD" | "GBP" | "EUR" | null,
    "period": "monthly" | "yearly" | "hourly" | "weekly" | null
  }
}

Skill rules:
- "core" = hard technical skills or tools that are explicitly required and critical to the role (e.g. React, Zendesk, SQL)
- "important" = mentioned as needed/preferred, domain competencies
- "nice_to_have" = bonus/plus/advantageous
- Soft skills (time management, problem solving, communication, teamwork, leadership, attention to detail) should NEVER be "core" — mark them "nice_to_have" unless the JD explicitly emphasizes them as a key differentiator, then "important" at most
- Keep skill names concise (1-3 words)
- Do NOT include generic phrases like "good communication" unless specifically listed as a requirement
- Do NOT include job titles or company names as skills
- Only extract skills that are ACTUALLY mentioned in the text — do not infer or guess skills
- Normalize common abbreviations: JS → JavaScript, TS → TypeScript, etc.
- confidence should reflect how clearly the skill is stated (explicit mention = 0.95, inferred = 0.7)

Experience rules:
- Extract years of experience ONLY if explicitly stated (e.g. "3-5 years", "at least 2 years", "minimum 1 year")
- Map to level: 0-1yr = "entry", 1-3yr = "junior", 3-5yr = "mid", 5+yr = "senior"
- If only a level keyword is mentioned (e.g. "senior", "fresh graduate") without years, set min_years/max_years to null but still set level
- If nothing about experience is mentioned, set all fields to null

Salary rules:
- Extract salary ONLY if explicitly stated with a number (e.g. "₱25,000-35,000/month", "$500-800 USD")
- Use the raw numbers as stated — do NOT convert currencies or periods
- If not mentioned, set all fields to null`;

export async function extractSkillsLLM(
  jdText: string
): Promise<StructuredExtractionResult> {
  const empty: StructuredExtractionResult = {
    mapped: [], unmapped: [], raw: [],
    experience: { min_years: null, max_years: null, level: null },
    salary: { min: null, max: null, currency: null, period: null },
  };

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return empty;

  // Truncate long JDs to stay within token limits
  const truncated = jdText.slice(0, 2000);

  await waitForRateLimit();

  let llmSkills: LLMExtractedSkill[] = [];
  let experience: LLMExperience = { min_years: null, max_years: null, level: null };
  let salary: LLMSalary = { min: null, max: null, currency: null, period: null };

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: EXTRACTION_PROMPT },
            { role: "user", content: truncated },
          ],
          response_format: { type: "json_object" },
          temperature: 0.1,
          max_tokens: 1024,
        }),
      });

      if (res.status === 429) {
        // Rate limited — wait longer (TPM resets per minute)
        const delay = (attempt + 1) * 15_000; // 15s, 30s, 45s
        console.warn(`Groq 429 — waiting ${delay / 1000}s (attempt ${attempt + 1}/3)`);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }

      if (!res.ok) {
        const errText = await res.text();
        console.error(`Groq API error ${res.status}: ${errText}`);
        break;
      }

      const json = await res.json();
      const content = json.choices?.[0]?.message?.content;
      if (!content) break;

      const parsed = JSON.parse(content);

      // Parse skills
      if (Array.isArray(parsed.skills)) {
        llmSkills = parsed.skills.map((s: Record<string, unknown>) => ({
          name: String(s.name ?? ""),
          importance: (["core", "important", "nice_to_have"].includes(s.importance as string)
            ? s.importance
            : "important") as LLMExtractedSkill["importance"],
          category: String(s.category ?? "other"),
          confidence: typeof s.confidence === "number" ? Math.min(1, Math.max(0, s.confidence)) : 0.8,
        }));
      }

      // Parse experience
      if (parsed.experience && typeof parsed.experience === "object") {
        const exp = parsed.experience;
        experience = {
          min_years: typeof exp.min_years === "number" ? exp.min_years : null,
          max_years: typeof exp.max_years === "number" ? exp.max_years : null,
          level: (["entry", "junior", "mid", "senior"].includes(exp.level) ? exp.level : null) as LLMExperience["level"],
        };
      }

      // Parse salary
      if (parsed.salary && typeof parsed.salary === "object") {
        const sal = parsed.salary;
        salary = {
          min: typeof sal.min === "number" ? sal.min : null,
          max: typeof sal.max === "number" ? sal.max : null,
          currency: (["PHP", "USD", "GBP", "EUR"].includes(sal.currency) ? sal.currency : null) as LLMSalary["currency"],
          period: (["monthly", "yearly", "hourly", "weekly"].includes(sal.period) ? sal.period : null) as LLMSalary["period"],
        };
      }

      break;
    } catch (err) {
      if (attempt === 2) {
        console.error("Groq extraction failed after 3 attempts:", err);
      }
    }
  }

  if (llmSkills.length === 0) {
    return { ...empty, experience, salary };
  }

  // Normalize skills against ontology
  const result = normalizeAgainstOntology(llmSkills);
  return { ...result, experience, salary };
}

// ---------------------------------------------------------------------------
// ONTOLOGY NORMALIZATION
// ---------------------------------------------------------------------------

export function normalizeAgainstOntology(
  llmSkills: LLMExtractedSkill[]
): Pick<StructuredExtractionResult, "mapped" | "unmapped" | "raw"> {
  const { byId, byLabel, bySynonym } = getIndex();
  const mapped: NormalizedExtractedSkill[] = [];
  const unmapped: LLMExtractedSkill[] = [];
  const seenIds = new Set<string>();

  for (const skill of llmSkills) {
    const name = skill.name.trim();
    if (!name) continue;

    const lower = name.toLowerCase();

    // Priority 1: exact label match
    let node = byLabel.get(lower);

    // Priority 2: synonym match
    if (!node) {
      node = bySynonym.get(lower);
    }

    // Priority 3: fuzzy substring match — only for longer names (>=4 chars)
    // to avoid false positives like "REST APIs" matching "R" or "CI/CD" matching "C"
    if (!node && lower.length >= 4) {
      for (const [label, n] of byLabel) {
        if (label.length < 4) continue; // skip short labels like "r", "c", "go"
        if (label.includes(lower) || lower.includes(label)) {
          node = n;
          break;
        }
      }
    }

    // Priority 4: check by ID (some LLM outputs might match IDs)
    if (!node) {
      node = byId.get(lower.replace(/\s+/g, "_"));
    }

    if (node && !seenIds.has(node.id)) {
      seenIds.add(node.id);
      mapped.push({
        skillId: node.id,
        label: node.label,
        importance: skill.importance,
        confidence: skill.confidence,
        domain: node.domain,
        tier: node.tier,
      });
    } else if (!node) {
      unmapped.push(skill);
    }
  }

  return { mapped, unmapped, raw: llmSkills };
}

// ---------------------------------------------------------------------------
// BACKWARD-COMPATIBLE WRAPPER
// ---------------------------------------------------------------------------

export interface ExtractionOutput {
  skills_required: string[];
  skills_structured: SkillStructuredEntry[];
  experience_level: "entry" | "junior" | "mid" | "senior" | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_is_estimate: boolean;
}

// PHP conversion rates for salary normalization
const SALARY_PHP_RATES: Record<string, number> = { PHP: 1, USD: 56, GBP: 72, EUR: 62 };
const SALARY_PERIOD_TO_MONTHLY: Record<string, number> = { monthly: 1, yearly: 1 / 12, hourly: 160, weekly: 4 };

/**
 * Hybrid extraction: LLM first, fallback to regex+synonym if LLM returns nothing.
 * Returns skills, experience level, and salary (normalized to monthly PHP).
 */
export async function extractSkillsWithStructured(
  text: string
): Promise<ExtractionOutput> {
  const empty: ExtractionOutput = {
    skills_required: [], skills_structured: [],
    experience_level: null, salary_min: null, salary_max: null, salary_is_estimate: false,
  };

  if (!text || text.trim().length < 20) return empty;

  const result = await extractSkillsLLM(text);

  // Parse experience level
  let experience_level = result.experience.level;
  if (!experience_level && result.experience.min_years != null) {
    const yrs = result.experience.min_years;
    if (yrs <= 1) experience_level = "entry";
    else if (yrs <= 3) experience_level = "junior";
    else if (yrs <= 5) experience_level = "mid";
    else experience_level = "senior";
  }

  // Parse salary → normalize to monthly PHP
  let salary_min: number | null = null;
  let salary_max: number | null = null;
  let salary_is_estimate = false;
  if (result.salary.min != null || result.salary.max != null) {
    const currencyRate = SALARY_PHP_RATES[result.salary.currency ?? "PHP"] ?? 1;
    const periodRate = SALARY_PERIOD_TO_MONTHLY[result.salary.period ?? "monthly"] ?? 1;
    if (result.salary.min != null) {
      salary_min = Math.round(result.salary.min * currencyRate * periodRate);
    }
    if (result.salary.max != null) {
      salary_max = Math.round(result.salary.max * currencyRate * periodRate);
    }
    salary_is_estimate = true; // LLM-extracted salary is an estimate
  }

  // Build skills output
  if (result.mapped.length > 0) {
    const skills_required = result.mapped.map((s) => s.label);
    const skills_structured: SkillStructuredEntry[] = result.mapped.map((s) => ({
      skillId: s.skillId,
      label: s.label,
      importance: s.importance,
      confidence: s.confidence,
      domain: s.domain,
      tier: s.tier,
    }));
    return { skills_required, skills_structured, experience_level, salary_min, salary_max, salary_is_estimate };
  }

  // Fallback: regex+synonym extraction (sync, no LLM/embeddings)
  const syncResult = extractSkillsFromJDSync(text);
  const skills = syncResult.skills.filter((s) => s.domain !== "soft");
  const skills_required = skills
    .map((s) => s.label)
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

  const skills_structured: SkillStructuredEntry[] = skills.map((s) => ({
    skillId: s.skillId,
    label: s.label,
    importance: "important" as const,
    confidence: s.confidence,
    domain: s.domain,
    tier: s.tier as SkillTier,
  }));

  return { skills_required, skills_structured, experience_level, salary_min, salary_max, salary_is_estimate };
}

/**
 * Drop-in replacement for extractSkillsHybrid — returns just string[] labels.
 * Falls back to regex+synonym if Groq returns nothing.
 */
export async function extractSkillsHybridV2(text: string): Promise<string[]> {
  const { skills_required } = await extractSkillsWithStructured(text);
  return skills_required;
}
