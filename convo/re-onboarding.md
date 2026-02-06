Let me think through this properly — your onboarding needs to collect enough structured data to power that matching algorithm while feeling fast and effortless, especially for fresh grads who might bounce at the first sign of friction.

Here's how I'd design it:

---

## Onboarding Flow: "3 minutes to your first match"

**Guiding principle:** Every screen must earn its existence by directly feeding a matching variable. No vanity steps.

---

### Screen 1: "What kind of work are you looking for?"

**Purpose:** Intent + category signal (filters the entire experience downstream)

- Multi-select tiles with icons — not a dropdown
- Options: `Tech & IT` · `BPO & Customer Service` · `Admin & Office` · `Sales & Marketing` · `Design & Creative` · `Accounting & Finance` · `Healthcare` · `Education` · `Skilled Trade` · `Other`
- Also capture: `Full-time` / `Part-time` / `Freelance` / `Open to any`
- **Why first:** This lets you tailor every subsequent screen. A BPO job seeker shouldn't see "What programming languages do you know?"

---

### Screen 2: "Where do you want to work?"

**Feeds:** `location_match` (0.10 weight)

- Single select + toggle:
  - City picker: `Metro Manila` · `Cebu` · `Davao` · `Clark/Pampanga` · `Iloilo` · `Other`
  - Toggle: `Open to remote work`
  - Toggle: `Willing to relocate`
- **Keep it dead simple.** No address entry, no map pin. City-level granularity is enough for MVP.

---

### Screen 3: "What are your skills?"

**Feeds:** `skill_match` (0.45) + `skill_proficiency` (0.15) — this is the **most important screen**

**Two-part interaction:**

**Part A — Skill selection**
- Show smart defaults based on Screen 1 categories (e.g., picked "BPO"? Pre-surface: `Customer Service` · `Email Support` · `Chat Support` · `English Proficiency` · `Salesforce` · `Zendesk`)
- Searchable tag input for adding more
- Aim for 5–10 skills minimum. Show a progress indicator: *"Add at least 5 skills for accurate matching"*

**Part B — Quick proficiency rating (inline, not a separate screen)**
- After selecting skills, each tag expands or shows a simple 3-dot selector:
  - `Beginner` · `Intermediate` · `Advanced`
- Don't over-explain these — people self-assess intuitively. Tooltip on tap: *"Beginner = learning, Intermediate = can do independently, Advanced = can teach others"*
- **Default to Intermediate** if they skip rating — reduces friction, avoids penalizing lazy users

**UX detail:** Show a live counter: *"7 skills added — great, your matches will be more accurate"*

---

### Screen 4: "How much experience do you have?"

**Feeds:** `experience_fit` (0.15)

- Single select, no typing:
  - `Fresh graduate / No experience yet`
  - `Less than 1 year`
  - `1–3 years`
  - `3–5 years`
  - `5–10 years`
  - `10+ years`
- **Optional:** "In what field?" — free text or dropdown mapped to Screen 1 categories
- **Why brackets, not exact years:** Faster, less anxiety for fresh grads, and your algorithm uses log-curve anyway so precision doesn't matter

---

### Screen 5: "What's your expected salary?"

**Feeds:** `salary_alignment` (0.10)

- Slider or two-field range input: `₱ Min — ₱ Max per month`
- Pre-set smart ranges based on their category + experience:
  - Fresh grad BPO → default `₱15,000–₱22,000`
  - Mid-level IT → default `₱35,000–₱55,000`
- Include a "Skip — show me all jobs" option. Don't force this. Some users genuinely don't know, and forcing it causes drop-off.
- **Important:** Frame it as "expected" not "desired" — psychologically different

---

### Screen 6: "Almost done — the basics"

**Feeds:** `education_match` (0.05) + profile completeness

- Highest education: `High School` · `Vocational/TESDA` · `College (no degree)` · `Bachelor's Degree` · `Master's or higher`
- Optional: Field of study (dropdown)
- Name + email (account creation)
- **Education is last and optional-feeling because it's your lowest-weight signal.** Don't lead with it — that sends the wrong message for a skills-first app.

---

### Screen 7: "Here are your top matches" ← The payoff

- Immediately show 5–10 jobs with match scores
- Each card: `Job Title` · `Company` · `85% Match` · `₱XX,000–₱XX,000` · `Manila · Remote`
- If any score is below 70%, show the gap: *"You're close — learn SQL to boost your match"*
- CTA: `Save` · `Apply` · `See more matches`

**This is the magic moment.** The entire onboarding exists to deliver this screen. If users see personalized, scored results with a clear "why," you've won them.

---

## What you're NOT collecting (intentional)

- ❌ Resume upload — kills the "skills-first" positioning and scares fresh grads
- ❌ Profile photo — unnecessary friction, bias risk
- ❌ Detailed work history — that's LinkedIn's job, not yours
- ❌ References or assessments — V2 problem
- ❌ Company size preference — noise for MVP

---

## The uncertainty play (from Torre's research)

If a user only adds 2–3 skills and skips proficiency ratings, show match scores as **ranges**: *"65–80% match"* with a nudge: *"Complete your skills to get a precise score."* This is honest, drives profile completion, and avoids false confidence on thin data.

---

## Drop-off mitigation

- **Progress bar** across all screens: `Step 3 of 6`
- **"Skip for now"** on salary + education — let them come back
- **Save state** — if they close mid-onboarding and return, pick up where they left off
- **Total time target:** Under 3 minutes. Test this yourself with a timer.

---

Want me to turn this into wireframe-ready specs with component-level detail, or jump into the TypeScript scoring function that consumes this data?