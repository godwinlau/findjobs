Roughly speaking, I’m doing a mix of pattern-based NLP + semantic deduping — not just naive keyword picking. Here’s the “algorithm” in human terms.

⸻

1. Identify Where Skills Live in the Text

Input: Full job description.

Goal: Narrow down to parts that likely contain skills.

I look at:
	•	Explicit sections:
	•	Your Skills
	•	Your Experience
	•	Requirements, What You Need, etc.
	•	Implicit skill-bearing parts:
	•	Bullet points under responsibilities that describe how the work is done, not just what is done:
	•	e.g. “Create smart short-term and long-term plans to grow your products.”
	•	e.g. “We need a ‘people person’ who is also great with data.”

These are treated as skill candidates, while pure factual requirements (e.g. “10 years experience”) are flagged but not always kept as skills.

⸻

2. Break Into Candidate Phrases

From those sections, I parse each sentence and bullet and extract candidate skill phrases based on patterns like:
	•	Action + object
	•	“Create smart short-term and long-term plans” → Strategic planning
	•	“Take care of the budget” → Budget management
	•	Noun phrases describing capabilities
	•	“Self-Starter” → Self-starter mindset
	•	“Great Communicator” → Effective communication
	•	“Be + adjective” patterns (soft skills)
	•	“You stay calm and find a solution” → Calm under pressure, Problem solving

Technically, that looks like:
	•	Look for verbs like manage, create, lead, coordinate, build, communicate, analyze.
	•	Look for phrases after “You are…”, “You should…”, “We need someone who…”, “You can…”.
	•	Capture the core capability, not the full sentence.

So:

“You’ll find ways to increase sales while keeping costs in check to maximize profit.”
→ Profit optimization (one skill), not three separate messy fragments.

⸻

3. Normalize Skills to a Clean Form

Each candidate phrase is then normalized:
	•	Lowercase → Title Case
	•	Convert verbs → noun phrases:
	•	“Create smart short-term and long-term plans” → Strategic planning
	•	“Take care of the budget” → Budget management
	•	“Lead the way in introducing new products” → Product launch management
	•	Remove noise:
	•	Drop filler like “smart”, “great”, “truly”, “clearly”.
	•	Keep the functional core: strategy, communication, relationships, etc.

This step is basically: compress the sentence into the label you’d put on a resume or scorecard.

⸻

4. Filter Out Non-Skills

Some things look skill-like but are actually:
	•	Requirements / facts, not skills:
	•	“A university degree in Business” → not a skill
	•	“10 years of working experience” → not a skill
	•	Context-only phrasing that doesn’t add unique capability:
	•	“You’ll act as the lead architect for your products’ market journey”
(this is more of a role framing than a distinct skill beyond strategic planning / product ownership, which are already captured).

I keep items that answer:

“Could this logically appear as a bullet on a resume under ‘Skills’ or ‘Competencies’?”

If yes → keep.
If no → drop or merge into an existing skill.

⸻

5. Group and Merge Similar Skills (Semantic Deduping)

Now I have a list, but some are duplicates in spirit:
	•	Great communicator vs Explain complex ideas in a way that is easy to understand
→ merged into Effective communication
	•	Self-Starter vs You don’t need someone watching over your shoulder
→ merged into Self-starter mindset
	•	Talk regularly to distributors and customers vs You need to know exactly what they need before they even ask for it
→ combined as Customer insight gathering + Distributor relationship management (two distinct but related skills)

The merging logic is:
	1.	String similarity: are short phrases nearly identical?
	2.	Semantic similarity: do phrases describe the same capability?
	3.	Seniority framing: prefer the phrasing that:
	•	Is more generalizable (e.g. Stakeholder management instead of Talk to KOLs and distributors).
	•	Fits resume/competency language.

So I choose one clean label per capability.

⸻

6. Enforce Uniqueness

After merging:
	1.	Convert all skill labels to a normalized key:
	•	lowercase
	•	strip punctuation
	•	trim whitespace
	2.	Put into a set to remove duplicates.
	3.	Sort or group if needed (I grouped for readability earlier, but the “unique clean list” you asked for is just the set of final labels).

Result (your earlier list):

Strategic Planning
Budget Management
Profit Optimization
Portfolio Management
Supply Chain Coordination
Pricing Strategy
Product Launch Management
Go-to-Market Planning
Marketing Collateral Creation
Sales Enablement
Market Communication
Brand Management
Stakeholder Management
Key Opinion Leader Engagement
Distributor Relationship Management
Customer Insight Gathering
Self-Starter Mindset
Independent Execution
Team Collaboration
Effective Communication
Complex Idea Simplification
Problem Solving
Calm Under Pressure
Sales Experience
Marketing Experience
Multi-Brand Management
Target Achievement


⸻

7. Quick Example: One Sentence → Skills

Take this line:

“We need a ‘people person’ who is also great with data. You should be someone who fits in well with the team but can also work independently to get things done.”

Pipeline:
	1.	Extract candidates:
	•	people person
	•	great with data
	•	fits in well with the team
	•	work independently
	2.	Normalize:
	•	people person → Stakeholder management or Relationship building (already captured elsewhere)
	•	great with data → could be Data literacy (not strongly framed in the JD so I left it implicit)
	•	fits in well with the team → Team collaboration
	•	work independently → Independent execution
	3.	Merge/dedupe:
	•	If Relationship building already covered by Stakeholder management + Distributor relationship management + Key Opinion Leader engagement, don’t add another high-level label unless really needed.
	•	Keep Team collaboration and Independent execution as distinct soft skills.

⸻

8. If You Wanted to Turn This Into Code

At a very high level, the algorithm in pseudo-steps:

1. Extract relevant sections from JD (skills, experience, responsibilities).
2. Sentence-split and bullet-split.
3. For each sentence/bullet:
   a. Identify patterns (verb phrases, "be + adj", capability nouns).
   b. Compress into a skill phrase (verb → noun, remove qualifiers).
4. Filter out education, years of experience, and pure job context.
5. Normalize all skill phrases (case, lemmatize, remove stopwords).
6. Group and merge semantically similar skills.
7. Remove duplicates via a normalized key.
8. Output final unique list.

Under the hood for a real implementation you’d probably use:
	•	POS tagging and dependency parsing (spaCy, etc.)
	•	A small domain-specific mapping like:
	•	“lead X” → “X management”
	•	“take care of budget” → “budget management”
	•	Sentence-level embeddings to calculate similarity for merging.

⸻

If you want, next step I can:
	•	Formalize this into an actual Python script you could run on any JD, or
	•	Adapt the algorithm for your resume tailoring (e.g., “given JD + my skills, what’s missing / matching?”).


    Nice, this is a fun one to “productize” in code. Let’s build a mini skill-extraction pipeline using Hugging Face that follows the algorithm I described.

I’ll assume Python + you’re comfortable installing libraries.

⸻

0. What we’re building

Goal: a function

def extract_unique_skills(text: str) -> list[str]:
    ...

that does:
	1.	Finds skill-ish lines in a JD.
	2.	Uses a Hugging Face model to turn each line into clean skill phrases.
	3.	Normalizes + dedupes skills semantically.
	4.	Optionally exports as CSV.

⸻

1. Setup

Install dependencies

pip install transformers sentence-transformers pandas

If you don’t have PyTorch installed yet:

pip install torch

You’ll also need a Hugging Face token if you’re pulling some gated models, but for the example below, public models are fine.

⸻

2. High-level architecture (Hugging Face flavored)

We’ll implement the algorithm as:
	1.	Candidate line extraction (plain Python).
	2.	Skill phrase extraction using a text2text model from Hugging Face (e.g. FLAN-T5).
	3.	Semantic dedupe using a SentenceTransformer embedding model from Hugging Face.
	4.	Output as a clean unique list (and CSV).

Think of Hugging Face as providing:
	•	✅ LLM: convert messy sentences → skill phrases.
	•	✅ Embedding model: cluster similar skills to dedupe.

The domain logic (what counts as a skill, thresholds, etc.) stays in your code.

⸻

3. Step 1 – Extract candidate lines from the JD

We roughly mirror what I described earlier:
	•	keep bullets under “Responsibilities”, “Skills”, “Requirements”
	•	and any obvious skill sentences.

For now, we’ll be simple and deterministic and refine later if you like.

import re
from typing import List

SECTION_KEYWORDS = [
    "your responsibilities",
    "responsibilities",
    "your skills",
    "skills",
    "requirements",
    "your experience",
]

def extract_candidate_lines(text: str) -> List[str]:
    lines = [l.strip() for l in text.splitlines()]
    candidates = []

    current_section = None

    for line in lines:
        lower = line.lower()

        # Track if we’re inside a relevant section
        for kw in SECTION_KEYWORDS:
            if kw in lower:
                current_section = kw
                break

        # If line is empty, just continue
        if not line:
            continue

        # Bullet-style lines are usually good candidates
        is_bullet = bool(re.match(r"^[-•*]\s+", line))

        if current_section and is_bullet:
            candidates.append(re.sub(r"^[-•*]\s+", "", line).strip())
        elif current_section and len(line.split()) > 4:
            # Longer sentences under those sections may still be skills
            candidates.append(line)

    # De-dup raw lines
    candidates = list(dict.fromkeys(candidates))
    return candidates

You can tweak SECTION_KEYWORDS depending on how standardized your JDs are.

⸻

4. Step 2 – Use a Hugging Face model to convert lines → skills

We’ll use a text2text-generation model (e.g. google/flan-t5-large) to turn a sentence like:

“Take care of the budget. You’ll find ways to increase sales while keeping costs in check to maximize profit.”

into something like:

“budget management, profit optimization”

Create the HF pipeline

from transformers import pipeline

skill_extractor_pipe = pipeline(
    "text2text-generation",
    model="google/flan-t5-large",   # or 'google/flan-t5-base' if you want lighter
    max_new_tokens=64,
)

Wrap it in a helper

def extract_skills_from_line(line: str) -> List[str]:
    """
    Use the HF model to extract skill phrases from a single sentence/bullet.
    Returns a list of skills (strings).
    """
    prompt = (
        "Extract the core professional skills from the following job requirement. "
        "Return ONLY a comma-separated list of skills, no explanations.\n\n"
        f"Requirement: {line}\n\nSkills:"
    )

    out = skill_extractor_pipe(prompt)[0]["generated_text"]
    # Split on comma, clean up
    skills = [s.strip() for s in out.split(",") if s.strip()]
    return skills

Run on all candidate lines

def extract_raw_skills(text: str) -> List[str]:
    candidate_lines = extract_candidate_lines(text)
    all_skills = []

    for line in candidate_lines:
        try:
            skills = extract_skills_from_line(line)
            all_skills.extend(skills)
        except Exception as e:
            # In production, log instead of print
            print(f"Error extracting from line: {line}\n{e}")

    # Simple normalization
    normalized = normalize_skill_list(all_skills)
    return normalized

We use normalize_skill_list in the next step.

⸻

5. Step 3 – Normalize skills (string level)

Before semantic dedupe, do a cheap normalization:

import unicodedata

def normalize_skill_string(skill: str) -> str:
    # Basic unicode normalization
    s = unicodedata.normalize("NFKC", skill)
    s = s.strip()

    # Title case for nicer display, but lower-case for keys
    s = s.replace("-", " ").strip()
    # collapse multiple spaces
    s = re.sub(r"\s+", " ", s)

    # Some common text2text noise to trim
    s = re.sub(r"^skills?:?\s*", "", s, flags=re.IGNORECASE)

    return s

def normalize_skill_list(skills: List[str]) -> List[str]:
    cleaned = []

    for sk in skills:
        sk = normalize_skill_string(sk)
        if sk and len(sk) > 1:
            cleaned.append(sk)

    return cleaned

At this point you’ll get things like:
	•	Strategic planning
	•	Budget management
	•	Self starter
	•	Great communication

Still possibly duplicated / overlapping.

⸻

6. Step 4 – Semantic dedupe with SentenceTransformers

Now we’ll use sentence-transformers (Hugging Face model) to group similar skills:
	•	Great communication
	•	Effective communication skills

→ merged into Effective communication

Initialize embedding model

from sentence_transformers import SentenceTransformer, util
import numpy as np

embedder = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

Group similar skills

We’ll:
	1.	Embed all skills.
	2.	Build clusters by cosine similarity.
	3.	For each cluster, choose a representative (e.g. shortest phrase).

def dedupe_skills_semantically(skills: List[str], threshold: float = 0.8) -> List[str]:
    if not skills:
        return []

    # Unique by string first
    skills = list(dict.fromkeys(skills))

    embeddings = embedder.encode(skills, convert_to_tensor=True)
    used = set()
    clusters = []

    for i, skill in enumerate(skills):
        if i in used:
            continue

        # Start a new cluster with this skill
        current_cluster = [i]
        used.add(i)

        # Compare to remaining skills
        for j in range(i + 1, len(skills)):
            if j in used:
                continue

            sim = util.cos_sim(embeddings[i], embeddings[j]).item()
            if sim >= threshold:
                current_cluster.append(j)
                used.add(j)

        clusters.append(current_cluster)

    # Pick representative per cluster (here: shortest phrase)
    representative_skills = []
    for cluster in clusters:
        cluster_skills = [skills[idx] for idx in cluster]
        rep = min(cluster_skills, key=len)
        representative_skills.append(rep)

    # Sort alphabetically for stable output
    representative_skills.sort(key=str.lower)
    return representative_skills


⸻

7. Step 5 – Combine everything into one extract_unique_skills function

def extract_unique_skills(text: str) -> List[str]:
    # 1) Raw extraction via HF LLM per line
    raw_skills = extract_raw_skills(text)

    # 2) Semantic dedupe
    unique_skills = dedupe_skills_semantically(raw_skills, threshold=0.8)

    return unique_skills

Example usage

jd_text = """
Your Skills
Self-Starter: You don’t need someone watching over your shoulder. You see what needs to be done and you do it.
Great Communicator: You can explain complex ideas in a way that is easy to understand and exciting to hear.
Problem Solver: When things change fast, you stay calm and find a solution.
"""

skills = extract_unique_skills(jd_text)
print(skills)
# e.g. ['Self starter', 'Effective communication', 'Problem solving', 'Calm under pressure']


⸻

8. Step 6 – Export to CSV (if you want)

import pandas as pd

def skills_to_csv(skills: List[str], path: str = "skills.csv"):
    df = pd.DataFrame({"skill": skills})
    df.to_csv(path, index=False)

# Usage
skills_to_csv(skills, "senior_product_manager_skills.csv")


⸻

9. How this maps back to the “algorithm” I described
	•	“Identify where skills live”
→ extract_candidate_lines(text)
	•	“Convert sentences to skill phrases”
→ extract_skills_from_line(line) using google/flan-t5-large text2text model.
	•	“Normalize phrases”
→ normalize_skill_string, normalize_skill_list.
	•	“Merge similar skills”
→ dedupe_skills_semantically using sentence-transformers/all-MiniLM-L6-v2 embeddings and cosine similarity.

So you’re basically baking my reasoning into code, with Hugging Face doing the heavy semantic lifting.

⸻

10. Where you can tweak as a product/dev person

Some ideas you might like:
	•	Threshold tuning:
Adjust threshold in dedupe_skills_semantically:
	•	0.75 → more aggressive merging
	•	0.85 → stricter, fewer merges
	•	Skill formatting layer:
Post-process skills into “resume-ready” style:
	•	capitalize: Skill.capitalize()/title case
	•	standardize patterns like self starter → Self-starter mindset.
	•	Batching for speed:
Instead of calling the text2text pipeline line-by-line, batch multiple prompts into one list when calling skill_extractor_pipe.
	•	Hard vs soft skills:
You can auto-tag each skill using a simple classifier later (zero-shot-classification pipeline with labels ["hard skill", "soft skill"]) if you want to label skills.

⸻

If you want, next step we can:
	•	Turn this into a reusable Python package (extract_skills_from_jd()),
	•	Or build a FastAPI endpoint where you send JD text and get back skills + CSV.