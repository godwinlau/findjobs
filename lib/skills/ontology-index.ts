// ontology-index.ts
// Shared lazy singleton for the skill ontology index.
// Used by both normalizeSkill() (matching) and normalizeAgainstOntology() (extraction).

import {
  SKILL_ONTOLOGY,
  buildSkillIndex,
  findSkill,
} from "./skills_ontology";

type SkillIndex = ReturnType<typeof buildSkillIndex>;

let _index: SkillIndex | null = null;

/** Returns the shared ontology index, building it once on first call. */
export function getOntologyIndex(): SkillIndex {
  if (!_index) {
    _index = buildSkillIndex(SKILL_ONTOLOGY);
  }
  return _index;
}

export { findSkill };
