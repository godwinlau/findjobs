// huggingface.ts
// Refactored Skill Extraction — Ontology-Based Hybrid Pipeline
//
// WHAT CHANGED:
// - Removed: flat TECHNICAL_SKILLS / BUSINESS_SKILLS / SOFT_SKILLS maps
// - Removed: BERT NER (dslim/bert-base-NER) — wrong model for skill extraction
// - Removed: extractFromSkillsMap() — replaced by 3-pass pipeline
// - Added: Ontology-backed extraction (regex → synonym → embedding)
// - Added: Confidence scores & match metadata
// - Added: Weighted matching (core > important > supporting)
// - Added: Optional HuggingFace embedding pass (sentence-transformers)

import {
    SKILL_ONTOLOGY,
    buildSkillIndex,
    type SkillNode,
  } from "./skills_ontology";
  
  import {
    extractSkillsFromJD,
    extractSkillsFromJDSync,
    precomputeOntologyEmbeddings,
    computeMatchScore,
    type ExtractedSkill,
    type ExtractionResult,
    type ExtractionOptions,
    type MatchResult,
    type EmbedFn,
  } from "./skills_extraction";
  
  // ---------------------------------------------------------------------------
  // CONFIG
  // ---------------------------------------------------------------------------
  
  // Swap this model for better short-phrase accuracy if needed.
  // Benchmarked options:
  //   - "sentence-transformers/all-MiniLM-L6-v2"  (fast, decent)
  //   - "BAAI/bge-small-en-v1.5"                   (better for short phrases)
  //   - "thenlper/gte-small"                        (good balance)
  const HF_EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2";
  
  // Cache ontology embeddings in memory — computed once on first use
  let _cachedOntologyEmbeddings: Map<string, number[]> | null = null;
  
  // ---------------------------------------------------------------------------
  // HUGGINGFACE EMBEDDING PROVIDER
  // ---------------------------------------------------------------------------
  
  /**
   * Calls the HuggingFace Inference API for sentence embeddings.
   * This replaces the old BERT NER call with something actually useful.
   *
   * Returns: array of embedding vectors (one per input text)
   */
  async function hfEmbed(texts: string[]): Promise<number[][]> {
    const apiKey = process.env.HUGGINGFACE_API_KEY;
    if (!apiKey) {
      console.warn("HUGGINGFACE_API_KEY not set. Skipping embedding pass.");
      return [];
    }
  
    try {
      const response = await fetch(
        `https://router.huggingface.co/hf-inference/models/${HF_EMBEDDING_MODEL}/pipeline/feature-extraction`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: texts,
            options: { wait_for_model: true },
          }),
        }
      );
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `HF Embedding API Error: ${response.status} ${response.statusText}`,
          errorText
        );
        return [];
      }
  
      const result = await response.json();
  
      // HF returns array of arrays for batch embedding
      if (!Array.isArray(result) || !Array.isArray(result[0])) {
        console.warn("Unexpected HF embedding response format:", result);
        return [];
      }
  
      return result as number[][];
    } catch (error) {
      console.error("Failed to query HF Embedding API:", error);
      return [];
    }
  }
  
  /**
   * Wrapper that conforms to the EmbedFn interface.
   * Handles batching for large inputs (HF has a ~512 token limit per input).
   */
  const hfEmbedFn: EmbedFn = async (texts: string[]): Promise<number[][]> => {
    const BATCH_SIZE = 32; // HF inference works best with smaller batches
    const allEmbeddings: number[][] = [];
  
    for (let i = 0; i < texts.length; i += BATCH_SIZE) {
      const batch = texts.slice(i, i + BATCH_SIZE);
      const batchEmbeddings = await hfEmbed(batch);
  
      if (batchEmbeddings.length === 0) {
        // If embedding fails, return empty — pipeline will fall back to Pass 1+2
        return [];
      }
  
      allEmbeddings.push(...batchEmbeddings);
    }
  
    return allEmbeddings;
  };
  
  // ---------------------------------------------------------------------------
  // MAIN EXTRACTION API (drop-in replacement for old extractSkillsHybrid)
  // ---------------------------------------------------------------------------
  
  interface ExtractSkillsOptions {
    /** Include soft skills in results (default: false) */
    includeSoftSkills?: boolean;
    /** Use HF embedding model for Pass 3 (default: true if API key exists) */
    useEmbeddings?: boolean;
    /** Return full metadata (default: false — returns just skill labels for backward compat) */
    fullResults?: boolean;
  }
  
  /**
   * Extract skills from a job description.
   *
   * Drop-in replacement for the old extractSkillsHybrid().
   * Returns sorted skill labels (string[]) by default for backward compatibility.
   *
   * For full metadata (confidence, match method, tier), set fullResults: true.
   */
  export async function extractSkillsHybrid(
    text: string,
    options: ExtractSkillsOptions = {}
  ): Promise<string[]> {
    const {
      includeSoftSkills = false,
      useEmbeddings = !!process.env.HUGGINGFACE_API_KEY,
    } = options;
  
    // Run the 3-pass pipeline
    const extractionOptions: ExtractionOptions = {
      skipEmbeddingPass: !useEmbeddings,
    };
  
    if (useEmbeddings) {
      extractionOptions.embedFn = hfEmbedFn;
  
      // Lazy-load cached ontology embeddings
      if (!_cachedOntologyEmbeddings) {
        console.log("Computing ontology embeddings (one-time)...");
        _cachedOntologyEmbeddings = await precomputeOntologyEmbeddings(
          SKILL_ONTOLOGY,
          hfEmbedFn
        );
        console.log(
          `Cached ${_cachedOntologyEmbeddings.size} ontology embeddings.`
        );
      }
      extractionOptions.ontologyEmbeddings = _cachedOntologyEmbeddings!;
    }

    const result = await extractSkillsFromJD(text, extractionOptions);

    // Filter out soft skills if not requested
    let skills = result.skills;
    if (!includeSoftSkills) {
      skills = skills.filter((s) => s.domain !== "soft");
    }
  
    // Return sorted labels (backward compatible)
    return skills
      .map((s) => s.label)
      .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  }
  
  /**
   * Extract skills with full metadata.
   * Use this for your dashboard, admin panel, or debugging.
   */
  export async function extractSkillsWithMetadata(
    text: string,
    options: Omit<ExtractSkillsOptions, "fullResults"> = {}
  ): Promise<ExtractionResult> {
    const {
      includeSoftSkills = false,
      useEmbeddings = !!process.env.HUGGINGFACE_API_KEY,
    } = options;
  
    const extractionOptions: ExtractionOptions = {
      skipEmbeddingPass: !useEmbeddings,
    };
  
    if (useEmbeddings) {
      extractionOptions.embedFn = hfEmbedFn;
  
      if (!_cachedOntologyEmbeddings) {
        _cachedOntologyEmbeddings = await precomputeOntologyEmbeddings(
          SKILL_ONTOLOGY,
          hfEmbedFn
        );
      }
      extractionOptions.ontologyEmbeddings = _cachedOntologyEmbeddings!;
    }

    const result = await extractSkillsFromJD(text, extractionOptions);

    if (!includeSoftSkills) {
      result.skills = result.skills.filter((s) => s.domain !== "soft");
      result.metadata.total_skills_found = result.skills.length;
    }
  
    return result;
  }
  
  /**
   * Sync extraction (Pass 1 + 2 only, no HF API call).
   * Use this when you need instant results or don't have an API key.
   */
  export function extractSkillsSync(
    text: string,
    includeSoftSkills = false
  ): string[] {
    const result = extractSkillsFromJDSync(text);
  
    let skills = result.skills;
    if (!includeSoftSkills) {
      skills = skills.filter((s) => s.domain !== "soft");
    }
  
    return skills
      .map((s) => s.label)
      .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  }
  
  // ---------------------------------------------------------------------------
  // MATCHING API
  // ---------------------------------------------------------------------------
  
  export { computeMatchScore, type MatchResult };
  
  // ---------------------------------------------------------------------------
  // RE-EXPORTS for convenience
  // ---------------------------------------------------------------------------
  
  export {
    SKILL_ONTOLOGY,
    buildSkillIndex,
    type SkillNode,
    type ExtractedSkill,
    type ExtractionResult,
  };
  
  // Re-export role presets
  export {
    ROLE_SKILL_PRESETS,
    getPresetById,
    getPresetsByCategory,
    getAllSkillIdsForPreset,
    getRoleCategories,
    searchPresets,
    type RolePreset,
    type RoleCategory,
  } from "./roles_skills_presets";