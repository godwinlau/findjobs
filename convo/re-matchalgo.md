
im building a filipino job finding web app built in nextjs and currently i am scraping jobs using linkedin api from github and jsearch. how many jobs do i need for lahnchg

10:28 PM
Good question — and the honest answer is: it depends on how you frame the launch, not on hitting a magic number.

Here's how I'd think about it:

Minimum Viable Job Count by Launch Type
Soft launch / beta (invite-only): 200–500 jobs is enough if they're well-curated, relevant, and categorized. Users forgive thin inventory when they know it's early — as long as what's there feels targeted and fresh.

Public launch (Product Hunt, socials, PR): Aim for 1,000–3,000+. The app needs to feel "alive" — empty search results kill trust instantly. You want enough density so that most common queries (location, role type, industry) return real results.

Niche/city-specific launch (e.g. "Jobs in Manila for tech"): You can get away with fewer (300–500) if every listing is hyper-relevant. Niche + quality > volume.

What matters more than raw count
Freshness — 500 jobs posted this week beats 5,000 stale listings. Show posting dates prominently.
No empty states — every category/filter combo a user is likely to try should return something. Map out your top 10 search paths and make sure none are dead ends.
Perceived density — smart defaults, curated "featured" sections, and trending/popular tags make a smaller catalog feel full.
Deduplication — if you're pulling from LinkedIn API + JSearch, you'll get overlaps. Dirty data with duplicates feels worse than a smaller clean set.
My pushback
Don't let job count be a blocker. The real risk isn't "not enough jobs" — it's launching without a clear feedback loop. Ship with 500 clean, relevant jobs, get 50 real Filipino job seekers using it, and learn what they actually search for, what's missing, and where they drop off. That data is worth more than padding the database to 5K.

What's your current scraping volume looking like, and are you targeting specific cities/industries or going broad?

I currently have 2500 fresh jobs lesser than 1 week

10:29 PM
2,500 fresh jobs under a week old — you're in solid shape for a public launch. That's well past the threshold where the app feels alive.

At this point, job count isn't your blocker. The real questions before launch are:

Search/filter coverage — do your top 10 likely searches (e.g. "developer Manila," "customer service remote," "BPO Cebu") return meaningful results? Run through them manually. Any empty results page is a conversion killer.

Deduplication — with two sources, you're almost certainly pulling dupes. Have you built dedup logic yet? Even basic title + company + location matching goes a long way.

Freshness perception — are you showing "posted X days ago" on listings? That's a trust signal. 2,500 jobs that look fresh is more important than the raw number.

Refill cadence — what's your scraping schedule? If you launched today and stopped scraping, how fast does the catalog go stale? You want daily or at minimum every-other-day refreshes so the app doesn't decay within a week of launch.

You're past the inventory question — the next unlock is making sure discovery and quality are tight. Want to dig into any of those areas?

Also planning for hiring managers to post as well - what are ur thoughts FAANG wise

10:29 PM
Clarifying what you mean — are you asking about:

How FAANG-level companies handle job posting flows (i.e. inspiration for your hiring manager posting UX)?
Whether you should try to attract FAANG/enterprise hiring managers to post on your platform?
How to build a job posting feature that feels professional/enterprise-grade?
These lead to pretty different answers, so want to make sure I'm aimed at the right thing.

Like as a senior PM from FAANG

10:29 PM
Got it — you want a senior PM-level critique of adding a hiring manager posting feature to your job board. Here's my honest take:

It's the right move, but not for launch
Adding employer-side posting transforms you from an aggregator into a marketplace. That's a fundamentally different product with a fundamentally different growth problem. Right now you have one side to worry about (job seekers). The moment you add posting, you have two — and both sides need to be healthy for either to work.

The cold start problem is real
No hiring manager will post on a platform with no applicants. No applicants will come for employer-posted jobs that don't exist yet. You need to win the supply side (job seekers) first with your scraped listings, build traffic and trust, then open the door to direct posting. This is the LinkedIn, Indeed, JobStreet playbook — they all started aggregation-first.

When to introduce it
You've earned the right to add employer posting when you can show:

Consistent organic traffic — even modest, like 1K+ monthly active job seekers
Engagement signal — people are clicking, saving, applying through your app
Inbound demand — recruiters or employers asking "can I post here?"
That signal-based timing matters more than a roadmap date.

How to scope the MVP posting flow
When you're ready, keep it razor thin:

Company name, logo, job title, description, location, salary range (optional), contact method
Manual approval queue (you review before it goes live — quality control is your moat early on)
No applicant tracking, no analytics dashboard, no paid tiers yet
Email notification to the poster when someone applies
That's it. Resist the urge to build an ATS. You're validating demand, not competing with Greenhouse.

The real FAANG-level question
The strategic decision isn't whether to build posting — it's what's your wedge against JobStreet, Kalibrr, and LinkedIn in the PH market? Aggregation + employer posting is table stakes. What makes a Filipino job seeker choose your app over what already exists? That positioning question is more important than any feature right now.

What's your current differentiation angle?

Think of a differentation angle based on current market trends

10:32 PM
Let me research the current Filipino job market and existing platforms to give you a grounded take.


Searched the web



Here's my take, grounded in what's actually happening in the PH market right now:

The Big Opportunity: Skills-First Job Matching
The data paints a clear picture. College graduates now account for 38% of the unemployed in the Philippines, up from 35.6% in December 2024. 
MindaNews
 At DOLE's nationwide job fairs in January 2025, only 3,364 out of 25,876 job seekers were hired — and most were placed in low-skilled roles that don't require a college degree. 
MindaNews
 62% of Filipino graduates feel their education did not adequately prepare them for employment. 
Medium

The core problem isn't a lack of jobs — it's a skills-to-job mismatch at massive scale. And none of the existing platforms solve it well.

Why the incumbents are vulnerable
JobStreet — breadth play, keyword search, tons of noise. Recruiters get swamped with tons of irrelevant or low-quality applications. 
Medium
 It's a firehose, not a filter.

Kalibrr — has skill assessments, but it's oriented toward corporate/enterprise employers. Not built for the 2.5M+ underemployed Filipinos or fresh grads who need guidance, not just listings.

LinkedIn — aspirational for Filipinos but culturally intimidating. Most fresh grads don't have networks to leverage.

None of them are solving the mismatch between what graduates can do and what employers actually need.

Your Differentiation Angle: "Skills-match, not keyword search"
Build the job app that matches Filipinos to roles based on what they can actually do, not just what degree they hold. Here's how this plays out concretely:

1. Skills-based profiles instead of resume uploads Onboarding asks "what can you do?" not "where did you work?" — structured skill tags, self-assessments, even lightweight skill verification. This is especially powerful for fresh grads and career-switchers who have skills but no traditional resume.

2. AI-powered match scoring Every listing shows a match percentage: "85% match based on your skills." This is the emotional hook — it tells job seekers where to focus instead of spray-and-pray applying to 50 listings. Existing platforms don't do this well from the seeker side.

3. Tagalog-first, mobile-first The Philippine labor force reached approximately 52.4 million people 
Yotru
, but a huge portion are outside Metro Manila, in provincial areas where English-first platforms feel foreign. A Tagalog-native (or bilingual) UX is an instant trust signal. Most competitors default to English.

4. "Bridge the gap" content layer Current TVET programs are largely ineffective in curbing underemployment among young people. 
PIDS
 Surface free skill-building resources (YouTube courses, TESDA programs, micro-certifications) alongside job listings. When a user doesn't match a job, show them what to learn to qualify. This turns your app from a job board into a career development tool — dramatically higher retention.

5. Transparent salary ranges Sectoral wage ranges are wide: construction and retail often pay ₱10,000–18,000 monthly, BPO ₱18,000–30,000, while experienced IT and finance professionals can reach ₱50,000–100,000+. 
Yotru
 Filipino job seekers are chronically underpaid partly because salary info is opaque. Mandatory salary display (even ranges) becomes a trust differentiator and a reason to choose your platform over JobStreet.

The positioning statement
"The job app that actually understands what you can do — not just what's on your diploma."

This nails three market realities at once: the skills mismatch crisis, the fresh grad anxiety, and the underemployment problem. It's not "another JobStreet" — it's the platform that helps Filipinos find jobs they're actually qualified for and shows them how to close the gap when they're not.

Want me to scope out an MVP feature set for this angle?

I want to build the app with as minimal cost as possbile - how would the ai powered match scoring work low cost?

10:34 PM
Great question. You don't need a fancy ML pipeline for this — you can get 90% of the value with straightforward engineering.

The Low-Cost Architecture
Core concept: structured skill tags + weighted overlap scoring. No embeddings, no fine-tuned models, no GPU costs.

How it works
Step 1: Structured skill taxonomy Build a master list of 200–500 skills relevant to the PH market (e.g. "Customer Service," "Excel," "AutoCAD," "Bookkeeping," "React," "Tagalog fluency"). Organize them into categories. This is your source of truth — both job seekers and job listings get tagged against this same list.

Step 2: Tag both sides

Job seeker profiles: During onboarding, users select skills from your taxonomy + self-rate proficiency (beginner/intermediate/advanced). Takes 2 minutes, feels lightweight.
Job listings: When you scrape from LinkedIn/JSearch, run the job description through a simple extraction step to pull matching skill tags. For employer-posted jobs later, they select required vs. nice-to-have skills from the same taxonomy.
Step 3: Match scoring formula

match_score = (matched_required_skills / total_required_skills) × 0.7
            + (matched_nice_to_have / total_nice_to_have) × 0.2
            + location_match × 0.1
That's it. Pure math, runs in milliseconds, zero API cost. A job requiring 5 skills where the user has 4 = 56% base score + bonuses. Display it as "85% Match" on the card.

Step 4: Extract skills from scraped listings (the only AI cost)

This is the one place you'd use an LLM — parsing unstructured job descriptions into your skill tags. But you can do this cheaply:

Run extraction at scrape time, not at query time (batch processing, not real-time)
Use Claude Haiku or GPT-4o-mini — cheapest tier, more than capable for extraction
Prompt: "Given this job description, return matching skills from this list: [your taxonomy]. Return as JSON."
Cost: ~$0.01–0.03 per 1,000 job descriptions. For 2,500 jobs, that's literally less than ₱5 total
Cache the extracted tags in your DB. You never call the LLM again for that listing.

What you DON'T need
❌ Vector embeddings or semantic search (overkill for MVP)
❌ A recommendation engine or collaborative filtering
❌ Real-time LLM calls per user query
❌ Training a custom model
❌ Any GPU/ML infrastructure
The upgrade path (when you have revenue)
Once you've validated that match scores drive engagement, then you layer in smarter things: semantic matching for edge cases, learning from click/apply behavior, personalized ranking. But that's a Series A problem, not a launch problem.

The gap-bridging magic
When match_score < 70%, show the missing skills explicitly:

"You're missing: SQL, Data Visualization. Learn these → [link to free TESDA course] [link to YouTube playlist]"

This is the feature that turns a score into a retention loop. Users come back not just to search, but to level up and re-check their match. No competitor does this.

Total ongoing AI cost for your entire platform: probably under ₱500/month at your current scale. Want me to sketch out the database schema for this?

Is the algorithm the best? Do more research on proper weight etc like bring actual studies so we can be as accurate as possible

10:34 PM
Let me dig deep into this — job matching algorithms, skills-based hiring research, and what actually predicts job fit.


Searched the web





Okay, I've now got a deep evidence base. Here's the research-backed revision of your algorithm:

Your Original Algorithm vs. What Research Actually Says
My first formula was directionally right but the weights were wrong and it was missing critical factors. Here's what the research tells us:

The evidence on what predicts job fit
Hiring for skills is up to five times more predictive of job performance than hiring based on education level, and twice as predictive as hiring for experience. 
Arcticshores
 This is from meta-analyses going back to 1984, reinforced by McKinsey and LinkedIn research.

Studies dating as far back as 1984 have shown that hiring processes that measure skills are five times more indicative of job performance than hiring for education, and two times more efficient at predicting future job success than hiring for work experience. 
TestGorilla

94% of employers agree that skills-based hiring is more predictive of on-the-job success than resumes. 
TestGorilla

This means skills should be your dominant signal — not just 70% like I originally suggested, but even more heavily weighted, with experience and education as modifiers rather than primary factors.

Industry-standard weight distribution
The predictive matching formula weighs multiple candidate attributes: skills (40% weight), experience (30% weight), education (20% weight), and cultural fit (10% weight). 
X0PA AI
 This is the commonly cited baseline, but it's oriented toward employer-side ATS screening, not job-seeker-facing matching.

Research shows organizations typically weight skills/qualifications at approximately 40% of total value. 
Taggd

For a job seeker-facing app in the PH market — where you're matching fresh grads and underemployed workers who have skills but lack credentials — you should skew harder toward skills and away from education/experience.

Revised Algorithm: Research-Backed V2
match_score = (
    skill_match      × 0.45    // Primary signal (5x more predictive than education)
  + skill_proficiency × 0.15    // Not just "do you have it" but "how well"
  + experience_fit    × 0.15    // Relevant experience, diminishing returns
  + location_match    × 0.10    // Critical in PH (Manila vs province is a dealbreaker)
  + salary_alignment  × 0.10    // Prevents dead-end applications
  + education_match   × 0.05    // Lowest weight — intentional, backed by research
)
Why each factor and weight:
Skill Match (0.45) — Binary overlap: does the user have skills the job requires? This is your highest-signal factor. Separate required vs. nice-to-have skills (required misses penalize harder).

skill_match = (
    (matched_required / total_required) × 0.75
  + (matched_nice_to_have / total_nice_to_have) × 0.25
)
Skill Proficiency (0.15) — This is what separates your app from keyword matching. Torre's skill-proficiency feature validates if a user is able to perform at the required level of the job considering its skills and proficiencies. 
Torre
 Don't just check "has React" — check if beginner-level React matches a senior React role. Score on a 3-point scale (beginner=1, intermediate=2, advanced=3), compare against job's required level.

proficiency_score = avg(user_level / required_level) // capped at 1.0
Experience Fit (0.15) — Not raw years, but relevance. Torre's skill experience ranker evaluates how many years of total experience the user has with all skills of the opportunity — they don't only check if the job seeker can do the job, but compare every user in how much relevant experience they have in each skill. 
Torre
 Use diminishing returns: the difference between 0 and 2 years matters more than 5 vs 7.

experience_score = min(user_relevant_years / required_years, 1.0)
// Apply log curve: log(1 + years) / log(1 + required_years)
Location Match (0.10) — In the PH context this is a hard filter for many roles. Metro Manila, Cebu, Davao, remote — a Cebuano user seeing Manila-only jobs with no remote option is a wasted match. Binary for on-site, full score for remote, partial for "willing to relocate."

Salary Alignment (0.10) — Torre's salary-matching feature ensures that a user's salary expectations align with the salary range offered for a job. 
Torre
 This prevents frustration on both sides. If user expects ₱30K and job pays ₱15K, that's a 0. Overlap in ranges = 1.0.

salary_score = overlap(user_range, job_range) / width(user_range)
Education Match (0.05) — Intentionally lowest weight. The research is clear that education is the weakest predictor. Only matters for regulated roles (nursing, engineering, teaching where licensure is legally required). For everything else, it's nearly noise.

What Torre Does That You Should Steal (for free)
Torre introduces the concept of 'uncertainty' into their matching algorithm — when a candidate's profile lacks information, rather than making assumptions, the algorithm assesses the likelihood of whether the candidate possesses the unlisted skills and offers a range rather than a single score. 
Torre

Steal this idea cheaply: When a user has an incomplete profile (say, only 3 skills tagged), show the score as a range: "65–80% match" with a CTA: "Complete your profile to get a more accurate score." This solves two problems: honesty about match quality AND drives profile completion.

What to Ship for MVP vs. V2
Factor	MVP (launch)	V2 (post-traction)
Skill match	✅ Tag overlap	Semantic similarity (related skills)
Proficiency	✅ Self-rated 3-tier	Verified via micro-assessments
Experience	✅ Years bracket	Log-curve with skill-specific years
Location	✅ Exact city match + remote flag	Commute radius, relocation willingness
Salary	✅ Range overlap	Market-adjusted ranges by role
Education	✅ Degree level match	Licensure-only flag for regulated roles
Uncertainty	✅ Show range for incomplete profiles	Bayesian confidence scoring
Feedback loop	❌ Skip	Learn from click/apply/hire signals
The MVP formula costs you zero in ongoing compute — it's pure math on structured data. The only AI cost remains the one-time skill extraction from scraped job descriptions.