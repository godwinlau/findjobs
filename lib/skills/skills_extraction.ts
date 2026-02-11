// skill_extraction.ts
// Hybrid 3-Pass Skill Extraction Pipeline for JD Parsing
// Pass 1: Regex / Exact Match (tools, acronyms, proper nouns)
// Pass 2: Synonym Fuzzy Match (Levenshtein + trigram)
// Pass 3: Embedding Cosine Similarity (semantic catch-all)

import {
    SKILL_ONTOLOGY,
    SkillNode,
    buildSkillIndex,
    type SkillTier,
  } from "./skills_ontology";
  
  // ---------------------------------------------------------------------------
  // TYPES
  // ---------------------------------------------------------------------------
  
  export type MatchMethod = "regex" | "synonym" | "embedding";
  
  export interface ExtractedSkill {
    skillId: string;
    label: string;
    domain: string;
    tier: SkillTier;
    confidence: number; // 0-1
    matchMethod: MatchMethod;
    matchedText: string; // the original text that triggered the match
  }
  
  export interface ExtractionResult {
    skills: ExtractedSkill[];
    raw_lines: string[];
    metadata: {
      total_lines_processed: number;
      total_skills_found: number;
      extraction_time_ms: number;
      pass_breakdown: {
        regex: number;
        synonym: number;
        embedding: number;
      };
    };
  }
  
  // ---------------------------------------------------------------------------
  // CONFIG
  // ---------------------------------------------------------------------------
  
  const CONFIG = {
    EMBEDDING_THRESHOLD: 0.50,
    FUZZY_THRESHOLD: 0.15, // normalized Levenshtein (lower = stricter)
    TRIGRAM_THRESHOLD: 0.70, // Jaccard (higher = stricter)
  
    CONFIDENCE: {
      regex: 0.95,
      synonym_exact: 0.90,
      synonym_fuzzy: 0.70,
      embedding_high: 0.80, // cosine > 0.7
      embedding_mid: 0.60,  // cosine 0.5-0.7
    },
  
    TIER_WEIGHT: {
      core: 3,
      important: 2,
      supporting: 1,
    } as Record<SkillTier, number>,
  };
  
  // ---------------------------------------------------------------------------
  // SECTION DETECTION
  // ---------------------------------------------------------------------------
  
  const RELEVANT_SECTION_PATTERNS = [
    /responsibilit/i,
    /requirements?\s*[:]/i,
    /^(key |minimum |basic |job |position )?requirements?$/i,
    /qualification/i,
    /^(required |key |technical |core |essential )?skills?\s*([:&]|and|$)/i,
    /^experience\s*[:&]/i,
    /^(required |preferred |minimum )?experience$/i,
    /what you('ll| will) (do|bring|need)/i,
    /you('ll| will) bring/i,
    /who you are/i,
    /your (role|mission|impact)/i,
    /^nice to have/i,
    /^must have\s*[:]/i,
    /^preferred\s*(qualifications?|skills?|requirements?)/i,
    /tech(nical)? stack/i,
    /tools? (we use|you('ll| will) use)/i,
    /day.to.day/i,
    /key (duties|tasks)/i,
    /the (gig|role|job|position)\b/i,
    /what you('ll| will) do/i,
    /core responsibilities/i,
    /job description/i,
    /job responsibilities/i,
    /job requirements/i,
    /position requirements/i,
    /about the (position|role)/i,
    /we('re| are) looking for/i,
    /you('ll| will) need/i,
    /bonus points/i,
    /about the role/i,
    /you('ll| will) love this/i,
    /role and responsibilities/i,
    /skills and qualifications/i,
    /what we('re| are) looking for/i,
    /what you('ll| will) do/i,
    /what (are you|you are) expected to do/i,
    /great fit if/i,
    /ideal candidate/i,
    /expected to do/i,
    /you are expected/i,
  ];
  
  const NOISE_SECTION_PATTERNS = [
    /about (us|the company|our)/i,
    /company (overview|description|culture)/i,
    /benefits?\b/i,
    /perks?\b/i,
    /rewards?\b/i,
    /check out the rewards/i,
    /why (join|work|you('ll| will) love)/i,
    /what('s| is) next/i,
    /equal opportunity/i,
    /what you gain/i,
    /what we offer/i,
    /what to expect in the process/i,
    /our \d+ values/i,
    /we would be grateful/i,
    /application process/i,
    /eeo\b/i,
    /disclaimer/i,
    /legal\b/i,
    /diversity/i,
    /how to apply/i,
    /application (process|instructions)/i,
    /recruitment process/i,
    /additional information/i,
    /only shortlisted/i,
    /kindly attach/i,
    /what we offer/i,
    /compensation/i,
    /salary\b/i,
    /leave credits/i,
    /allowance/i,
    /can('t| not) wait to see/i,
    /drop us a/i,
    /tell us your rate/i,
    /show (off|us)/i,
    /job type:/i,
    /work (location|setup|schedule):/i,
    /work location/i,
    /key information to note/i,
    /if you('d| would) like to apply/i,
    /submit(ting)? your (cv|resume)/i,
    /referral bonus/i,
    /if we have not contacted/i,
    /application has not been/i,
    /follow our linkedin/i,
    /in.mailing us/i,
    /apply now/i,
    /ready to (shape|join|start|make)/i,
    /let('s| us) (innovate|build|create|grow)/i,
    /how we partner/i,
    /we invite you to/i,
    /DEI\b/i,
    /we believe that innovation/i,
    /we are committed to/i,
    /inclusive (environment|and equitable)/i,
    /will neither solicit/i,
    /is committed to providing equal/i,
    /people first/i,
    /explore.*career opportunities/i,
  ];
  
  /**
   * Normalize common spaced-out tech terms found in LinkedIn JDs.
   * LinkedIn's text processing often inserts spaces into compound terms.
   */
  function normalizeJDText(text: string): string {
    return text
      // Fix missing apostrophes (LinkedIn stripping)
      .replace(/Youll\b/g, "You'll")
      .replace(/youll\b/g, "you'll")
      .replace(/Were\b/g, "We're")
      .replace(/were\b(?! )/g, "we're")
      .replace(/Weve\b/g, "We've")
      .replace(/weve\b/g, "we've")
      .replace(/Whats\b/g, "What's")
      .replace(/whats\b/g, "what's")
      .replace(/Dont\b/g, "Don't")
      .replace(/dont\b/g, "don't")
      .replace(/Youre\b/g, "You're")
      .replace(/youre\b/g, "you're")
      // Fix spaced tech terms common in LinkedIn scraping
      .replace(/i\s+OS/g, "iOS")
      .replace(/\.\s*NET/gi, ".NET")
      .replace(/ASP\s*\.\s*NET/gi, "ASP.NET")
      .replace(/Java\s+Script/gi, "JavaScript")
      .replace(/\bLiqui\b/g, "Liquid")
      .replace(/Tik\s+Tok/gi, "TikTok")
      .replace(/Cap\s+Cut/gi, "CapCut")
      .replace(/Click\s+Up/gi, "ClickUp")
      .replace(/Big\s+Commerce/gi, "BigCommerce")
      .replace(/Digital\s+Ocean/gi, "DigitalOcean")
      .replace(/Cloud\s+Flare/gi, "Cloudflare")
      .replace(/Elastic\s+Search/gi, "Elasticsearch")
      .replace(/Rabbit\s+MQ/gi, "RabbitMQ")
      .replace(/Chat\s+GPT/gi, "ChatGPT")
      .replace(/Mid\s*journey/gi, "Midjourney")
      .replace(/Type\s+Script/gi, "TypeScript")
      .replace(/Node\s*\.\s*js/gi, "Node.js")
      .replace(/Node\s+JS\b/g, "Node.js")
      .replace(/Next\s*\.\s*js/gi, "Next.js")
      .replace(/Vue\s*\.\s*js/gi, "Vue.js")
      .replace(/Vue\s+js\b/gi, "Vue.js")
      .replace(/Express\s*\.\s*js/gi, "Express.js")
      .replace(/React\s*\.\s*js/gi, "React.js")
      .replace(/My\s*SQL/gi, "MySQL")
      .replace(/Post\s*Gres/gi, "PostgreSQL")
      .replace(/Kuburnetes/gi, "Kubernetes")
      .replace(/Word\s+Press/gi, "WordPress")
      .replace(/Mongo\s+DB/gi, "MongoDB")
      .replace(/j\s*Query/g, "jQuery")
      .replace(/Share\s+Point/gi, "SharePoint")
      .replace(/Power\s+Point/gi, "PowerPoint")
      .replace(/Power\s+Apps/gi, "PowerApps")
      .replace(/Power\s+Automate/gi, "PowerAutomate")
      .replace(/Git\s+Hub/gi, "GitHub")
      .replace(/Git\s+Lab/gi, "GitLab")
      .replace(/Py\s+Torch/gi, "PyTorch")
      .replace(/Tensor\s+Flow/gi, "TensorFlow")
      .replace(/Scikit\s*-?\s*learn/gi, "Scikit-learn")
      .replace(/Power\s+BI/gi, "Power BI")
      .replace(/Dev\s+Ops/gi, "DevOps")
      .replace(/Code\s+Igniter/gi, "CodeIgniter")
      .replace(/Connect\s+OS/gi, "ConnectOS")
      .replace(/x\s+Unit/gi, "xUnit")
      .replace(/N\s*Unit/gi, "NUnit")
      // CRITICAL: Re-insert line breaks where newlines were stripped from description_plain
      // Must protect known camelCase terms first, then split remaining merged words
      .replace(/([a-z])([A-Z][a-z]{2,})/g, (match, lower, upper) => {
        // Known camelCase tech terms that should NOT be split
        const knownTerms = [
          "JavaScript", "TypeScript", "CoffeeScript", "ActionScript", "AppleScript",
          "WordPress", "WooCommerce", "BigCommerce",
          "DevOps", "GitOps", "FinOps", "MLOps", "DataOps",
          "GitHub", "GitLab", "BitBucket",
          "InDesign", "InVision", "OpenSearch", "ElasticSearch",
          "CodeIgniter", "NestJS",
          "PowerShell", "PowerPoint", "PowerApps", "PowerAutomate", "SharePoint",
          "HubSpot", "MailChimp", "SalesForce",
          "ChatGPT", "MidJourney",
          "LinkedIn", "TikTok", "YouTube", "FaceBook", "SnapChat",
          "ClickUp", "BaseLinker", "QuickBooks",
          "PyTorch", "TensorFlow", "FastAPI", "StreamLit",
          "CloudFlare", "DigitalOcean",
          "LottieFiles",
          "GoHighLevel",
        ];
        // Check if the full match is part of a known term
        for (const term of knownTerms) {
          if (term.includes(match) || term.toLowerCase().includes(match.toLowerCase())) {
            return match; // Don't split
          }
        }
        return lower + "\n" + upper;
      });
  }
  
  export function extractRelevantLines(rawText: string): string[] {
    // Normalize spaced-out terms first
    const normalizedText = normalizeJDText(rawText);
    
    const lines = normalizedText
      .split(/\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 5);
  
    let inRelevantSection = false;
    let inNoiseSection = false;
    const relevantLines: string[] = [];
    let foundSections = false;
  
    for (const line of lines) {
      // Strip emojis, bullets, and special chars for header detection
      const cleanLine = line
        .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{2B55}\u{FE00}-\u{FEFF}\u{200D}\u{20E3}]/gu, "")
        .replace(/^[\s*•·\-–—⚡🚀💡📌📝✨☎️✉️✅❌🔥📍]+/u, "")
        .trim();
  
      // Short lines that match section patterns are headers (skip as content)
      // Long lines that match are content that happens to contain header keywords
      const isShortEnoughForHeader = cleanLine.length < 60;
      const matchesRelevant = RELEVANT_SECTION_PATTERNS.some((p) => p.test(cleanLine));
      const matchesNoise = NOISE_SECTION_PATTERNS.some((p) => p.test(cleanLine));
  
      if (matchesRelevant) {
        inRelevantSection = true;
        inNoiseSection = false;
        foundSections = true;
        // If it's a long line, also include it as content (has skills in it)
        if (!isShortEnoughForHeader) {
          relevantLines.push(cleanLine);
        }
        continue;
      }
      if (matchesNoise && isShortEnoughForHeader) {
        inRelevantSection = false;
        inNoiseSection = true;
        foundSections = true;
        continue;
      }
  
      // Before any section header is found, include all lines as pre-section content.
      // After sections are found, only include lines inside relevant sections.
      if (!foundSections || (inRelevantSection && !inNoiseSection)) {
        // Strip bullet prefixes from content lines too
        const cleaned = line
          .replace(/^[\s*•·\-–—⚡🚀💡📌📝✨☎️✉️✅❌🔥📍]+/u, "")
          .trim();
        if (cleaned.length > 5) {
          relevantLines.push(cleaned);
        }
      }
    }
  
    // Fallback: if no sections detected, use all non-noise lines
    if (!foundSections || relevantLines.length < 3) {
      return lines.filter((l) => !NOISE_SECTION_PATTERNS.some((p) => p.test(l)));
    }
  
    return relevantLines;
  }
  
  // ---------------------------------------------------------------------------
  // PASS 1 — REGEX / EXACT MATCH
  // ---------------------------------------------------------------------------
  
  function buildRegexPatterns(ontology: SkillNode[]): Map<RegExp, string> {
    const patterns = new Map<RegExp, string>();
  
    for (const node of ontology) {
      const terms = [node.label, ...node.synonyms];
      for (const term of terms) {
        if (term.length < 2) continue;
        
        // Build a regex that handles special chars in skill names.
        // \b doesn't work around dots, hashes, plus signs, etc.
        // Use lookbehind/lookahead for word boundaries that handle these cases.
        const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        
        // For terms with special chars (., #, +, /), use lookaround instead of \b
        const hasSpecialChars = /[.#\+\/\-]/.test(term);
        
        let pattern: RegExp;
        if (hasSpecialChars) {
          // Match the term preceded by start-of-string or non-alphanumeric,
          // and followed by end-of-string or non-alphanumeric
          pattern = new RegExp(`(?:^|[^a-zA-Z0-9])${escaped}(?:$|[^a-zA-Z0-9])`, "i");
        } else {
          // Allow optional plural suffix (s, es, ing, er) after the term
          // This handles "UI designs" matching "UI Design", "API integrations" matching "API Integration", etc.
          pattern = new RegExp(`\\b${escaped}(?:s|es|ing|er)?\\b`, "i");
        }
        
        patterns.set(pattern, node.id);
      }
    }
    return patterns;
  }
  
  function runRegexPass(
    lines: string[],
    patterns: Map<RegExp, string>,
    ontologyById: Map<string, SkillNode>
  ): ExtractedSkill[] {
    const found = new Map<string, ExtractedSkill>();
  
    for (const line of lines) {
      for (const [pattern, skillId] of patterns) {
        if (pattern.test(line) && !found.has(skillId)) {
          const node = ontologyById.get(skillId)!;
          found.set(skillId, {
            skillId: node.id,
            label: node.label,
            domain: node.domain,
            tier: node.tier,
            confidence: CONFIG.CONFIDENCE.regex,
            matchMethod: "regex",
            matchedText: line,
          });
        }
      }
    }
    return Array.from(found.values());
  }
  
  // ---------------------------------------------------------------------------
  // PASS 2 — SYNONYM FUZZY MATCH
  // ---------------------------------------------------------------------------
  
  function levenshtein(a: string, b: string): number {
    const m = a.length;
    const n = b.length;
    const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
        );
      }
    }
    return dp[m][n];
  }
  
  function normalizedLevenshtein(a: string, b: string): number {
    const maxLen = Math.max(a.length, b.length);
    if (maxLen === 0) return 0;
    return levenshtein(a, b) / maxLen;
  }
  
  function trigrams(str: string): Set<string> {
    const s = `  ${str} `;
    const result = new Set<string>();
    for (let i = 0; i < s.length - 2; i++) {
      result.add(s.substring(i, i + 3));
    }
    return result;
  }
  
  function trigramSimilarity(a: string, b: string): number {
    const ta = trigrams(a.toLowerCase());
    const tb = trigrams(b.toLowerCase());
    let intersection = 0;
    for (const t of ta) {
      if (tb.has(t)) intersection++;
    }
    const union = ta.size + tb.size - intersection;
    return union === 0 ? 0 : intersection / union;
  }
  
  function extractCandidatePhrases(line: string): string[] {
    const phrases = line
      .split(/[,;|•·\-–—]|\band\b|\bor\b/i)
      .map((p) => p.trim())
      .filter((p) => p.length >= 2 && p.length <= 60);
    if (line.length <= 120) phrases.push(line.trim());
    return phrases;
  }
  
  function runSynonymPass(
    lines: string[],
    ontology: SkillNode[],
    alreadyFound: Set<string>
  ): ExtractedSkill[] {
    const found = new Map<string, ExtractedSkill>();
  
    const termPairs: { term: string; node: SkillNode }[] = [];
    for (const node of ontology) {
      termPairs.push({ term: node.label.toLowerCase(), node });
      for (const syn of node.synonyms) {
        termPairs.push({ term: syn.toLowerCase(), node });
      }
    }
  
    for (const line of lines) {
      const candidates = extractCandidatePhrases(line);
  
      for (const candidate of candidates) {
        const candidateLower = candidate.toLowerCase();
  
        for (const { term, node } of termPairs) {
          if (alreadyFound.has(node.id) || found.has(node.id)) continue;
  
          if (candidateLower === term) {
            // Exact full match — highest synonym confidence
            found.set(node.id, {
              skillId: node.id,
              label: node.label,
              domain: node.domain,
              tier: node.tier,
              confidence: CONFIG.CONFIDENCE.synonym_exact,
              matchMethod: "synonym",
              matchedText: candidate,
            });
            continue;
          }
          
          // Substring includes match — only for terms >= 8 chars to avoid
          // short generic words like "teams", "support", "management" matching everywhere
          if (term.length >= 8 && candidateLower.includes(term)) {
            found.set(node.id, {
              skillId: node.id,
              label: node.label,
              domain: node.domain,
              tier: node.tier,
              confidence: CONFIG.CONFIDENCE.synonym_exact,
              matchMethod: "synonym",
              matchedText: candidate,
            });
            continue;
          }
  
          if (term.length >= 6 && candidateLower.length >= 6) {
            // Prevent short fragments matching long skill names
            const lengthRatio = Math.min(candidateLower.length, term.length) / Math.max(candidateLower.length, term.length);
            if (lengthRatio < 0.6) continue;
  
            const levDist = normalizedLevenshtein(candidateLower, term);
            const triSim = trigramSimilarity(candidateLower, term);
  
            if (levDist <= CONFIG.FUZZY_THRESHOLD || triSim >= CONFIG.TRIGRAM_THRESHOLD) {
              found.set(node.id, {
                skillId: node.id,
                label: node.label,
                domain: node.domain,
                tier: node.tier,
                confidence: CONFIG.CONFIDENCE.synonym_fuzzy,
                matchMethod: "synonym",
                matchedText: candidate,
              });
            }
          }
        }
      }
    }
    return Array.from(found.values());
  }
  
  // ---------------------------------------------------------------------------
  // PASS 3 — EMBEDDING COSINE SIMILARITY
  // ---------------------------------------------------------------------------
  
  function cosineSimilarity(a: number[], b: number[]): number {
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }
  
  /** Replace with your actual embedding provider */
  export type EmbedFn = (texts: string[]) => Promise<number[][]>;
  
  /** Pre-compute once at startup and cache */
  export async function precomputeOntologyEmbeddings(
    ontology: SkillNode[],
    embedFn: EmbedFn
  ): Promise<Map<string, number[]>> {
    const labels = ontology.map((n) => n.label);
    const embeddings = await embedFn(labels);
    const map = new Map<string, number[]>();
    ontology.forEach((node, i) => map.set(node.id, embeddings[i]));
    return map;
  }
  
  async function runEmbeddingPass(
    lines: string[],
    ontology: SkillNode[],
    ontologyEmbeddings: Map<string, number[]>,
    embedFn: EmbedFn,
    alreadyFound: Set<string>
  ): Promise<ExtractedSkill[]> {
    if (lines.length === 0) return [];
  
    const lineEmbeddings = await embedFn(lines);
    const found = new Map<string, ExtractedSkill>();
  
    for (let i = 0; i < lines.length; i++) {
      for (const node of ontology) {
        if (alreadyFound.has(node.id) || found.has(node.id)) continue;
  
        const skillEmb = ontologyEmbeddings.get(node.id);
        if (!skillEmb) continue;
  
        const similarity = cosineSimilarity(lineEmbeddings[i], skillEmb);
  
        if (similarity >= CONFIG.EMBEDDING_THRESHOLD) {
          const confidence =
            similarity > 0.7
              ? CONFIG.CONFIDENCE.embedding_high
              : CONFIG.CONFIDENCE.embedding_mid;
  
          const existing = found.get(node.id);
          if (!existing || confidence > existing.confidence) {
            found.set(node.id, {
              skillId: node.id,
              label: node.label,
              domain: node.domain,
              tier: node.tier,
              confidence,
              matchMethod: "embedding",
              matchedText: lines[i],
            });
          }
        }
      }
    }
    return Array.from(found.values());
  }
  
  // ---------------------------------------------------------------------------
  // PASS 4 — LLM VERIFICATION (Groq free tier — Llama 3.1 8B)
  // ---------------------------------------------------------------------------
  
  /**
   * Sends synonym/fuzzy matches to Groq's free Llama model for yes/no verification.
   * Only verifies skills matched by synonym/embedding — regex matches are trusted.
   * 
   * Groq free tier: 30 req/min, 14,400 req/day, <500ms response.
   * Uses llama-3.1-8b-instant (fast, good at structured tasks).
   * 
   * Single API call per JD — batches all suspicious skills into one prompt.
   * Returns the set of verified skill IDs (false positives removed).
   * 
   * Requires GROQ_API_KEY in env. Get one free at https://console.groq.com
   */
  async function verifySkillsWithLLM(
    suspiciousSkills: ExtractedSkill[],
    jdContext: string,
  ): Promise<Set<string>> {
    if (suspiciousSkills.length === 0) return new Set();
  
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_API_KEY) {
      // No API key — skip verification, return all as valid
      return new Set(suspiciousSkills.map((s) => s.skillId));
    }
  
    // Build a compact prompt — minimize tokens
    const skillList = suspiciousSkills
      .map((s, i) => `${i + 1}. "${s.label}" (matched from: "${s.matchedText.substring(0, 80)}")`)
      .join("\n");
  
    // Use first 600 chars of JD for context
    const jdSnippet = jdContext.substring(0, 600);
  
    const prompt = `You are a skill extraction validator for a job matching platform. A job description was analyzed and the following skills were extracted using fuzzy text matching. Some may be false positives.
  
  For each skill, respond ONLY with the number followed by YES if the job genuinely requires this skill as a core competency, or NO if it was a false match (the word appeared in a different context).
  
  Job description excerpt:
  "${jdSnippet}"
  
  Skills to verify:
  ${skillList}
  
  Rules:
  - YES = the job actually requires hands-on use of this skill
  - NO = the skill name appeared coincidentally or in a different context (e.g., "CRM migration" does not mean "CRM Management" as a daily task)
  - If unsure, say NO
  
  Respond ONLY with numbered YES/NO, one per line:`;
  
    try {
      let response: Response | null = null;
      let lastError = "";
      
      // Retry up to 3 times with exponential backoff for rate limits
      for (let attempt = 0; attempt < 3; attempt++) {
        response = await fetch(
          "https://api.groq.com/openai/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${GROQ_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "llama-3.1-8b-instant",
              messages: [{ role: "user", content: prompt }],
              max_tokens: 100,
              temperature: 0.1,
            }),
          }
        );
  
        if (response.ok) break;
  
        if (response.status === 429) {
          const waitMs = Math.pow(2, attempt + 1) * 1000; // 2s, 4s, 8s
          console.warn(`  Rate limited, waiting ${waitMs / 1000}s (attempt ${attempt + 1}/3)...`);
          await new Promise((r) => setTimeout(r, waitMs));
          continue;
        }
  
        // Non-rate-limit error — don't retry
        lastError = await response.text().catch(() => "");
        console.warn(`LLM verification failed (${response.status}): ${lastError.substring(0, 100)}`);
        return new Set(suspiciousSkills.map((s) => s.skillId));
      }
  
      if (!response || !response.ok) {
        console.warn("LLM verification: max retries exceeded, keeping all skills");
        return new Set(suspiciousSkills.map((s) => s.skillId));
      }
  
      const data = await response.json();
      const text = data.choices?.[0]?.message?.content || "";
  
      // Parse YES/NO responses — handle markdown, extra whitespace, preamble
      const verified = new Set<string>();
      let parsedCount = 0;
      
      // Split on newlines and look for numbered YES/NO patterns anywhere in response
      const lines = text.trim().split(/\n/);
  
      for (const line of lines) {
        // Match "1. YES", "1.YES", "1) YES", "1: YES" etc — flexible formatting
        const match = line.trim().match(/^(\d+)[.):\s]+\s*(YES|NO)/i);
        if (match) {
          parsedCount++;
          const idx = parseInt(match[1], 10) - 1;
          const isValid = match[2].toUpperCase() === "YES";
          if (isValid && idx >= 0 && idx < suspiciousSkills.length) {
            verified.add(suspiciousSkills[idx].skillId);
          }
        }
      }
  
      // Only fall back if we couldn't parse ANY lines at all
      // (parsedCount === 0 means the response format was completely unexpected)
      if (parsedCount === 0) {
        console.warn("LLM verification: could not parse response, keeping all skills. Response:", text.substring(0, 200));
        return new Set(suspiciousSkills.map((s) => s.skillId));
      }
  
      // If we parsed responses but all were NO, return empty set (all rejected)
      // This is a valid outcome — the LLM said none of the fuzzy matches are real
      return verified;
    } catch (err) {
      console.warn("LLM verification error:", err);
      return new Set(suspiciousSkills.map((s) => s.skillId));
    }
  }
  
  // ---------------------------------------------------------------------------
  // MAIN EXTRACTION PIPELINE
  // ---------------------------------------------------------------------------
  
  export interface ExtractionOptions {
    embedFn?: EmbedFn;
    ontologyEmbeddings?: Map<string, number[]>;
    skipEmbeddingPass?: boolean;
    skipLLMVerification?: boolean;
    ontology?: SkillNode[];
  }
  
  /**
   * Full 3-pass hybrid extraction pipeline.
   *
   * Usage:
   * ```ts
   * // With embeddings (full power):
   * const result = await extractSkillsFromJD(jdText, {
   *   embedFn: myEmbedFn,
   *   ontologyEmbeddings: cachedEmbeddings,
   * });
   *
   * // Without embeddings (MVP):
   * const result = await extractSkillsFromJD(jdText, { skipEmbeddingPass: true });
   * ```
   */
  export async function extractSkillsFromJD(
    rawText: string,
    options: ExtractionOptions = {}
  ): Promise<ExtractionResult> {
    const start = performance.now();
    const ontology = options.ontology ?? SKILL_ONTOLOGY;
    const index = buildSkillIndex(ontology);
    
    // Normalize spaced-out tech terms before extraction
    const normalizedText = normalizeJDText(rawText);
    const relevantLines = extractRelevantLines(normalizedText);
    const regexPatterns = buildRegexPatterns(ontology);
  
    // PASS 1
    const regexResults = runRegexPass(relevantLines, regexPatterns, index.byId);
    const foundIds = new Set(regexResults.map((r) => r.skillId));
  
    // PASS 2
    const synonymResults = runSynonymPass(relevantLines, ontology, foundIds);
    for (const r of synonymResults) foundIds.add(r.skillId);
  
    // PASS 3 (optional)
    let embeddingResults: ExtractedSkill[] = [];
    if (!options.skipEmbeddingPass && options.embedFn) {
      let ontologyEmb = options.ontologyEmbeddings;
      if (!ontologyEmb) {
        ontologyEmb = await precomputeOntologyEmbeddings(ontology, options.embedFn);
      }
      embeddingResults = await runEmbeddingPass(
        relevantLines, ontology, ontologyEmb, options.embedFn, foundIds
      );
    }
  
    // MERGE & DEDUPE
    const allResults = [...regexResults, ...synonymResults, ...embeddingResults];
    const deduped = new Map<string, ExtractedSkill>();
    for (const result of allResults) {
      const existing = deduped.get(result.skillId);
      if (!existing || result.confidence > existing.confidence) {
        deduped.set(result.skillId, result);
      }
    }
  
    let validated = validateExtractedSkills(
      Array.from(deduped.values()).sort((a, b) => {
        const tierDiff = CONFIG.TIER_WEIGHT[b.tier] - CONFIG.TIER_WEIGHT[a.tier];
        if (tierDiff !== 0) return tierDiff;
        return b.confidence - a.confidence;
      })
    );
  
    // PASS 4 — LLM verification on synonym/embedding matches only
    if (!options.skipLLMVerification) {
      const suspicious = validated.filter(
        (s) => s.matchMethod === "synonym" || s.matchMethod === "embedding"
      );
      if (suspicious.length > 0) {
        const verifiedIds = await verifySkillsWithLLM(suspicious, rawText);
        // Keep all regex matches + only verified synonym/embedding matches
        validated = validated.filter(
          (s) => s.matchMethod === "regex" || verifiedIds.has(s.skillId)
        );
      }
    }
  
    return {
      skills: validated,
      raw_lines: relevantLines,
      metadata: {
        total_lines_processed: relevantLines.length,
        total_skills_found: validated.length,
        extraction_time_ms: Math.round(performance.now() - start),
        pass_breakdown: {
          regex: regexResults.length,
          synonym: synonymResults.length,
          embedding: embeddingResults.length,
        },
      },
    };
  }
  
  // ---------------------------------------------------------------------------
  // SYNC VERSION (Pass 1 + 2 only, no embeddings — perfect for MVP)
  // ---------------------------------------------------------------------------
  
  export function extractSkillsFromJDSync(
    rawText: string,
    ontology: SkillNode[] = SKILL_ONTOLOGY
  ): ExtractionResult {
    const start = performance.now();
    const index = buildSkillIndex(ontology);
    
    // Normalize spaced-out tech terms
    const normalizedText = normalizeJDText(rawText);
    const relevantLines = extractRelevantLines(normalizedText);
    const regexPatterns = buildRegexPatterns(ontology);
  
    const regexResults = runRegexPass(relevantLines, regexPatterns, index.byId);
    const foundIds = new Set(regexResults.map((r) => r.skillId));
    const synonymResults = runSynonymPass(relevantLines, ontology, foundIds);
  
    const allResults = [...regexResults, ...synonymResults];
    const deduped = new Map<string, ExtractedSkill>();
    for (const result of allResults) {
      const existing = deduped.get(result.skillId);
      if (!existing || result.confidence > existing.confidence) {
        deduped.set(result.skillId, result);
      }
    }
  
    const skills = validateExtractedSkills(
      Array.from(deduped.values()).sort((a, b) => {
        const tierDiff = CONFIG.TIER_WEIGHT[b.tier] - CONFIG.TIER_WEIGHT[a.tier];
        if (tierDiff !== 0) return tierDiff;
        return b.confidence - a.confidence;
      })
    );
  
    return {
      skills,
      raw_lines: relevantLines,
      metadata: {
        total_lines_processed: relevantLines.length,
        total_skills_found: skills.length,
        extraction_time_ms: Math.round(performance.now() - start),
        pass_breakdown: { regex: regexResults.length, synonym: synonymResults.length, embedding: 0 },
      },
    };
  }
  
  /**
   * Post-extraction validation — catches false positives that pass regex/synonym
   * but are contextually wrong.
   */
  function validateExtractedSkills(skills: ExtractedSkill[]): ExtractedSkill[] {
    if (skills.length === 0) return skills;
  
    // Count skills per domain
    const domainCounts = new Map<string, number>();
    for (const s of skills) {
      domainCounts.set(s.domain, (domainCounts.get(s.domain) ?? 0) + 1);
    }
  
    // Find the dominant domain (if any)
    const totalSkills = skills.length;
    const maxDomainCount = Math.max(...domainCounts.values());
    const dominantRatio = maxDomainCount / totalSkills;
  
    return skills.filter((s) => {
      // Rule 1: Drop low-confidence synonym matches that are lone domain outliers
      // e.g., "Podcast Editing" appearing in a compliance JD
      const domainCount = domainCounts.get(s.domain) ?? 0;
      if (
        s.matchMethod === "synonym" &&
        s.confidence < 0.85 &&
        domainCount === 1 &&
        totalSkills > 3 &&
        dominantRatio > 0.5
      ) {
        return false;
      }
  
      // Rule 2: Drop synonym matches with very low confidence
      if (s.matchMethod === "synonym" && s.confidence < 0.65) {
        return false;
      }
  
      return true;
    });
  }
  
  // ---------------------------------------------------------------------------
  // MATCHING — Candidate vs Job (weighted)
  // ---------------------------------------------------------------------------
  
  export interface MatchResult {
    score: number; // 0-1 weighted
    matchedSkills: string[];
    missingSkills: string[];
    totalWeight: number;
    matchedWeight: number;
  }
  
  export function computeMatchScore(
    candidateSkillIds: string[],
    jobSkillIds: string[],
    ontology: SkillNode[] = SKILL_ONTOLOGY
  ): MatchResult {
    const index = buildSkillIndex(ontology);
    const candidateSet = new Set(candidateSkillIds);
  
    let totalWeight = 0;
    let matchedWeight = 0;
    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];
  
    for (const jobSkillId of jobSkillIds) {
      const node = index.byId.get(jobSkillId);
      const weight = node ? CONFIG.TIER_WEIGHT[node.tier] : 1;
      totalWeight += weight;
  
      if (candidateSet.has(jobSkillId)) {
        matchedWeight += weight;
        matchedSkills.push(jobSkillId);
      } else {
        missingSkills.push(jobSkillId);
      }
    }
  
    return {
      score: totalWeight > 0 ? matchedWeight / totalWeight : 0,
      matchedSkills,
      missingSkills,
      totalWeight,
      matchedWeight,
    };
  }