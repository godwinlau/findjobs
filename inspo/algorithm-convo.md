so if we use the hugging face to match jobs, our job matching should be accurate right bc if the user selects his skills during onboarding like figma, design, html, css, js, react - i dont wanna see graphic design or something9:42 PMYour concern is valid but the reality is: embeddings alone WILL sometimes surface graphic design roles because semantically "Figma" and "design" are close to graphic design in vector space. The model doesn't understand intent the way you need it to.
Here's the actual problem: embeddings capture semantic similarity, not role fit. "Product Designer who uses Figma, HTML, CSS, React" and "Graphic Designer who uses Figma, Illustrator" will have a decent cosine similarity because they share the word "design" and "Figma."
The fix is strengthening the business rules layer. Here's what I'd change:
1. Add negative signal matching
In job-recommender.ts, add a penalty system:
ts// Skills that signal a DIFFERENT role category
const ROLE_EXCLUSION_MAP: Record<string, string[]> = {
  "product designer": ["illustrator", "photoshop", "print design", "branding", "logo"],
  "frontend developer": ["photoshop", "print design", "illustration"],
  "graphic designer": ["react", "next.js", "node.js", "api", "typescript"],
};

function computeSkillMismatchPenalty(
  profileTitle: string,
  jobSkills: string[]
): number {
  const titleLower = profileTitle.toLowerCase();
  const exclusions = Object.entries(ROLE_EXCLUSION_MAP)
    .filter(([role]) => titleLower.includes(role))
    .flatMap(([, skills]) => skills);

  if (exclusions.length === 0) return 0;

  const jobSkillsLower = jobSkills.map((s) => s.toLowerCase());
  const mismatchCount = exclusions.filter((ex) =>
    jobSkillsLower.some((js) => js.includes(ex))
  ).length;

  // Penalize 0.15 per mismatch signal, capped at 0.5
  return Math.min(mismatchCount * 0.15, 0.5);
}
2. Change the scoring weight
Shift from 70/30 to 50/50 or even 40/60 favoring business rules:
ts// Before (too much trust in embeddings)
score: semanticScore * 0.7 + boosts.totalBoost * 0.3

// After (business rules have more power to correct)
const penalty = computeSkillMismatchPenalty(profile.jobTitle, job.requiredSkills);
score: semanticScore * 0.4 + boosts.totalBoost * 0.6 - penalty
3. Add a title category gate
This is the strongest fix — hard-filter by role category before embeddings even run:
tsconst ROLE_CATEGORIES: Record<string, string[]> = {
  "product-design": [
    "product designer", "ux designer", "ui/ux designer",
    "ux engineer", "design lead", "interaction designer",
  ],
  "frontend-dev": [
    "frontend developer", "front-end engineer", "react developer",
    "web developer", "ui engineer", "javascript developer",
  ],
  "graphic-design": [
    "graphic designer", "visual designer", "brand designer",
    "creative designer", "print designer",
  ],
};

function getRoleCategory(title: string): string | null {
  const lower = title.toLowerCase();
  for (const [category, titles] of Object.entries(ROLE_CATEGORIES)) {
    if (titles.some((t) => lower.includes(t) || t.includes(lower))) {
      return category;
    }
  }
  return null;
}

// In your recommendation flow: filter BEFORE embedding
const userCategory = getRoleCategory(userProfile.jobTitle);
const filteredJobs = userCategory
  ? jobListings.filter((job) => {
      const jobCategory = getRoleCategory(job.title);
      return jobCategory === null || jobCategory === userCategory;
    })
  : jobListings;
This way graphic design jobs get filtered out before they even reach the embedding stage.
TL;DR: Don't rely on embeddings alone for accuracy. Use them for nuance and discovery (finding jobs the user wouldn't have searched for), but use deterministic rules as guardrails. The combo of role category gate → embedding similarity → business rule boosts → mismatch penalties will give you tight, relevant results.Also from your lens as a FAANG pm, for the first version of the app is it good to show other people on it as well so we can grow by building a community?9:44 PMHonestly, no — not for V1. Here's why:
The cold start problem will kill you. If you launch with community features and there are 50 users, it feels dead. Empty feeds, no interactions, ghost town vibes. That actively hurts trust and retention. People will open the app, see nothing happening, and leave.
Your core value prop is job matching, not community. A Filipino professional downloads Hanapbuhay because they want to find a job with salary transparency and relevant matches. That's the promise. If you nail that, they stay. Community is a retention layer you add after the core loop works.
What FAANG PMs actually do in this situation:
V1: Nail the single-player experience
The app should be valuable even if only 1 person is using it. That means:

Great onboarding → accurate job recommendations
Salary-transparent listings
Easy apply flow
Job alerts that actually match

This is your "come for the tool" phase.
V2 (once you have ~500-1k active users): Add lightweight social proof
Not a full community — just signals that other humans exist:

"47 people applied to this job"
"Trending in Metro Manila this week"
"12 Product Designers joined this month"
Skill-based salary benchmarks: "Product Designers in Manila earn ₱45k-80k based on 34 profiles"

This is low-effort, high-trust content that doesn't require user-generated activity.
V3 (once engagement is proven): Community features

Job referrals ("I work here, AMA")
Industry-specific channels
Salary sharing threads (this would be HUGE in PH where salary secrecy is cultural)

The one exception where early community could work: if you launch with a closed, curated community — like a private group of 100 Filipino designers or developers who are your early adopters. That's not a product feature though, that's a Telegram/Discord group you run manually alongside the app. It builds word of mouth without needing product investment.
Bottom line: Community without density is worse than no community. Ship the matching engine, prove the value, then layer social on top.Ah got it focus on single player exp then. Can you spot some risks here as well9:45 PMHere are the real risks I'd flag:
1. Job Data Quality & Freshness
You're pulling from JSearch and LinkedIn APIs via RapidAPI. These are scraped/aggregated — listings can be stale, duplicated, or already filled. If a user applies to a dead listing through your app, trust is gone instantly. Mitigation: add a "posted within X days" filter, deduplicate aggressively, and consider letting users report stale listings.
2. API Dependency Risk
Both JSearch and LinkedIn scraping APIs on RapidAPI can break, get rate-limited, or shut down without notice. Your entire supply of jobs depends on third parties you don't control. Mitigation: abstract your job ingestion behind a provider interface so you can swap sources. Long-term, you'll want direct employer posting — but that's a V2/V3 problem.
3. PH Job Market Coverage Gap
These APIs skew heavily toward international/remote and Metro Manila tech roles. If a user from Cebu or Davao onboards looking for mid-level roles, they might get 3 results. Low results = "this app doesn't work for me." Mitigation: be upfront about coverage. Show a message like "We found 4 jobs matching your profile — we're adding new listings daily" rather than showing an empty state. Also consider supplementing with JobStreet/Kalibrr scraping for PH-specific coverage.
4. Salary Filter Reduces Supply Too Aggressively
Your differentiator (salary transparency) also cuts your inventory significantly. In PH, maybe 20-30% of listings include salary. If you hard-filter, your catalog looks thin compared to JobStreet. Mitigation: this is why I suggested the toggle approach — rank salary-listed jobs higher but don't hide the rest by default. Let users opt into strict filtering.
5. Embedding Accuracy at Small Scale
With a small job catalog (say 200-500 listings), the recommendation engine might surface mediocre matches just because there aren't enough good ones. Users will judge your AI matching by the worst result on the page, not the best. Mitigation: set a minimum similarity threshold (e.g., don't show anything below 60% match) and show fewer results rather than bad ones.
6. Single-Player Value Without Apply Flow
If you show great job matches but the apply action just redirects to an external site, the experience breaks. The user leaves your app, hits a different UI, maybe needs to create another account. You lose attribution and the user associates the friction with you. Mitigation: for V1, at minimum capture the click-through so you can track conversion. Ideally offer a "Quick Apply" with their Hanapbuhay profile that pre-fills basic info.
7. Onboarding Drop-off
Your matching quality depends on rich onboarding data (title, skills, preferences, experience level). But every extra step in onboarding increases drop-off. There's a direct tension between match accuracy and activation rate. Mitigation: design a progressive onboarding — get title + 3 skills minimum to show initial results, then prompt for more detail to "improve your matches" after they've seen value.
8. Retention Without Notifications
Job seekers are transient users — they need you intensely for 2-8 weeks, then they're gone. If you don't have a notification/alert system from day one (email or push), they'll check once, forget, and never come back even if perfect jobs appear later. Mitigation: job alerts matching their profile should be a V1 feature, not V2.
The highest-priority risks to solve before launch: #7 (onboarding drop-off), #4 (thin catalog from salary filtering), and #8 (retention via alerts). Everything else you can iterate on post-launch.Yeah i think for ingestion we need to nail this as well and also for the app we're running cron jobs too. Maybe everyday we run a recursive function to check if the job link is still active but the question is how9:46 PMYeah, stale listings are a trust killer. Here's the practical approach:
The Problem
You can't just fetch() a job URL and check for a 200 status — most job boards return 200 even for expired listings (they redirect to a "this job is no longer available" page or show a generic search page).
What Actually Works
Tier 1: HTTP-level checks (fast, cheap, catches ~30%)
tsasync function checkJobUrl(url: string): Promise<"active" | "dead" | "uncertain"> {
  try {
    const response = await fetch(url, {
      method: "HEAD", // faster than GET
      redirect: "follow",
      signal: AbortSignal.timeout(5000),
    });

    // Obvious dead signals
    if (response.status === 404 || response.status === 410) return "dead";

    // Redirect to homepage or search = likely expired
    const finalUrl = response.url;
    if (isGenericPage(finalUrl, url)) return "dead";

    return "uncertain"; // need deeper check
  } catch {
    return "uncertain"; // network error, retry later
  }
}

function isGenericPage(finalUrl: string, originalUrl: string): boolean {
  // If redirected to root or search page, listing is probably gone
  const final = new URL(finalUrl);
  return (
    final.pathname === "/" ||
    final.pathname === "/jobs" ||
    final.pathname === "/search" ||
    final.pathname.includes("/expired")
  );
}
Tier 2: Content-based check (catches the remaining ~60%)
For URLs that return 200, you need to actually read the page and detect expiration signals:
tsasync function deepCheckJob(url: string): Promise<"active" | "dead"> {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(10000),
  });
  const html = await response.text();
  const lower = html.toLowerCase();

  const deadSignals = [
    "this job is no longer available",
    "this position has been filled",
    "job has expired",
    "no longer accepting applications",
    "this listing has been removed",
    "job not found",
    "position closed",
    "application deadline has passed",
    "sorry, this job has been closed",
  ];

  if (deadSignals.some((signal) => lower.includes(signal))) return "dead";

  // Check if apply button still exists (platform-specific)
  const hasApplyButton =
    lower.includes("apply now") ||
    lower.includes("apply for this job") ||
    lower.includes("submit application");

  // No apply button on a job page = probably dead
  if (!hasApplyButton) return "dead";

  return "active";
}
The Cron Job Architecture
Don't check all jobs every day — that's wasteful and you'll get rate-limited/blocked. Stagger by age and priority:
ts// lib/job-health-checker.ts

interface JobRecord {
  id: string;
  url: string;
  status: "active" | "dead" | "uncertain";
  postedAt: Date;
  lastCheckedAt: Date | null;
  failedChecks: number; // consecutive failures
}

/**
 * Priority-based checking schedule:
 * - Jobs < 7 days old: check every 3 days
 * - Jobs 7-21 days old: check daily (highest churn window)
 * - Jobs 21-45 days old: check every 2 days
 * - Jobs > 45 days old: mark as likely expired, check once then archive
 */
function getJobsToCheck(allJobs: JobRecord[]): JobRecord[] {
  const now = Date.now();

  return allJobs.filter((job) => {
    if (job.status === "dead") return false;

    const ageInDays = (now - job.postedAt.getTime()) / (1000 * 60 * 60 * 24);
    const lastCheckedHoursAgo = job.lastCheckedAt
      ? (now - job.lastCheckedAt.getTime()) / (1000 * 60 * 60)
      : Infinity;

    // Auto-expire very old listings
    if (ageInDays > 60) return false; // archive these

    // High churn window — check daily
    if (ageInDays >= 7 && ageInDays <= 21) return lastCheckedHoursAgo >= 24;

    // Medium age — every 2 days
    if (ageInDays > 21 && ageInDays <= 45) return lastCheckedHoursAgo >= 48;

    // Fresh listings — every 3 days
    return lastCheckedHoursAgo >= 72;
  });
}

/**
 * Main cron handler — process in batches to avoid rate limits
 */
async function runHealthCheck(jobs: JobRecord[]): Promise<void> {
  const BATCH_SIZE = 20;
  const DELAY_BETWEEN_BATCHES_MS = 3000; // be polite to job boards

  const toCheck = getJobsToCheck(jobs);

  for (let i = 0; i < toCheck.length; i += BATCH_SIZE) {
    const batch = toCheck.slice(i, i + BATCH_SIZE);

    const results = await Promise.allSettled(
      batch.map(async (job) => {
        // Tier 1: quick HTTP check
        let status = await checkJobUrl(job.url);

        // Tier 2: deep check if uncertain
        if (status === "uncertain") {
          status = await deepCheckJob(job.url);
        }

        return { id: job.id, status };
      })
    );

    // Update DB with results
    for (const result of results) {
      if (result.status === "fulfilled") {
        const { id, status } = result.value;
        // await db.jobs.update({ where: { id }, data: { status, lastCheckedAt: new Date() } })
      }
    }

    // Rate limit courtesy
    if (i + BATCH_SIZE < toCheck.length) {
      await new Promise((r) => setTimeout(r, DELAY_BETWEEN_BATCHES_MS));
    }
  }
}
The Next.js Cron Route
ts// app/api/cron/check-jobs/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Verify cron secret (Vercel cron or external trigger)
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch active jobs from DB
  // const jobs = await db.jobs.findMany({ where: { status: "active" } })

  // await runHealthCheck(jobs)

  return NextResponse.json({ checked: true });
}
In vercel.json:
json{
  "crons": [
    {
      "path": "/api/cron/check-jobs",
      "schedule": "0 3 * * *"
    }
  ]
}
Key Gotchas

Rate limiting: Job boards will block you if you hammer them. The 3-second batch delay + HEAD-first approach helps, but consider rotating User-Agent headers too
Vercel cron timeout: Free tier has a 10-second limit, Pro has 300 seconds. If you have thousands of jobs, you'll need to paginate across multiple cron invocations or use an external queue (Inngest, Trigger.dev — both have free tiers)
False positives: Some sites do A/B testing or geo-block. If a job fails one check, don't immediately mark it dead — use the failedChecks counter and require 2-3 consecutive failures before marking dead

This gives you a self-healing job catalog without any AI cost. The tiered checking schedule keeps it efficient even at scale.ah so for tier 2 content checking, we can do this for free right bc note i am aiming to have 1k plus jobs and we have to check daily?9:49 PMYes, completely free. Tier 2 is just fetch() + string matching — no AI, no APIs, no cost. It's basic HTML scraping.
The real concern at 1k+ jobs isn't cost, it's execution time and rate limits.
Let's do the math:
FactorValueTotal jobs1,000Checked daily (using priority schedule)~300-400Tier 1 HEAD request~200ms avgTier 2 full fetch (only for "uncertain")~800ms avg% that need Tier 2~60-70%
Worst case: ~400 jobs × ~600ms avg = ~4 minutes total.
That's fine — but not on Vercel free tier (10s timeout). You have three options:
Option A: Vercel Pro ($20/mo) — 300s timeout
Split into 2 cron runs. Morning checks batch 1, afternoon checks batch 2. Simple.
Option B: Stay free — use chunked cron calls
ts// Run cron every hour, process 50 jobs per invocation
// 400 jobs ÷ 50 per run = 8 hours to cycle through all
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/check-jobs",
      "schedule": "0 */1 * * *"  // every hour
    }
  ]
}
ts// app/api/cron/check-jobs/route.ts
export async function GET(request: NextRequest) {
  // Grab next 50 unchecked jobs, ordered by lastCheckedAt ASC
  // Process them within the 10s window
  // HEAD requests only take ~200ms, so 50 HEAD checks = ~10s ✅
  // Save "uncertain" ones for a separate deep-check route
}
Then a second route for deep checks:
ts// app/api/cron/deep-check-jobs/route.ts
// Picks up jobs marked "uncertain", does full fetch
// Also runs hourly, 10-15 per invocation
Option C: Inngest or Trigger.dev (free tier, best DX)
This is what I'd actually recommend. Both have generous free tiers and handle the orchestration for you:
ts// inngest function — handles retries, timeouts, batching automatically
import { inngest } from "./client";

export const checkJobHealth = inngest.createFunction(
  { id: "check-job-health" },
  { cron: "0 3 * * *" }, // daily at 3am
  async ({ step }) => {
    const jobs = await step.run("fetch-jobs", async () => {
      // return jobs needing check from DB
    });

    // Process each job as a separate step — auto-retries on failure
    for (const job of jobs) {
      await step.run(`check-${job.id}`, async () => {
        let status = await checkJobUrl(job.url);
        if (status === "uncertain") {
          status = await deepCheckJob(job.url);
        }
        // update DB
      });
    }
  }
);
Inngest free tier gives you 5,000 step runs/month — enough for 1k jobs checked daily with room to spare. And you don't fight Vercel timeouts at all.
My recommendation: Go with Option B for now (chunked hourly crons on Vercel free), migrate to Inngest when you hit 2-3k jobs or need more reliability. Don't pay for Vercel Pro just for cron timeouts.so meaning per day how many fresh jobs can we expect9:49 PMThat depends entirely on your ingestion sources and filters, not the health checker. Let me break it down realistically:
JSearch API (RapidAPI)
PlanRequests/moCostFree500$0Basic10,000$30
Each request returns ~10 jobs. So on free tier:

500 requests ÷ 30 days = ~16 requests/day
16 × 10 results = ~160 raw jobs/day

After deduplication and salary filtering (~20-30% have salary), you're looking at 30-50 usable jobs/day on free tier.
The Reality Check
Here's the problem: those 160 raw results aren't all unique or relevant. You'll see:

~30-40% duplicates across queries
~20-30% have salary info
~10-15% are stale/reposted
Some won't be PH-relevant depending on your queries

Realistic daily fresh job yield:
SourceRaw/dayAfter filtersCostJSearch Free~160~25-40$0JSearch Basic~3,300~500-700$30/moLinkedIn API (RapidAPI)~100~15-25$0-10/moCombined Free~260~40-60$0Combined Paid~3,400~500-700~$40/mo
Hitting 1k+ Listings
On free tier alone, you'd build up to 1k active listings in about 3-4 weeks, assuming ~40 new/day minus ~10-15 expiring daily. That's actually fine for a launch.
How to Maximize Yield
Run smart query rotation — don't burn all 16 daily requests on the same search:
ts// lib/job-ingestion.ts

const QUERY_ROTATION = [
  // Rotate these across daily cron runs
  { query: "product designer", location: "Philippines" },
  { query: "frontend developer", location: "Manila" },
  { query: "UI UX designer", location: "Philippines remote" },
  { query: "react developer", location: "Philippines" },
  { query: "web developer", location: "Cebu" },
  { query: "software engineer", location: "Philippines" },
  { query: "graphic designer", location: "Manila" },
  { query: "shopify developer", location: "remote" },
  { query: "product manager", location: "Philippines" },
  { query: "data analyst", location: "Manila" },
];

// Use 2 queries per category per day, rotate daily
function getTodaysQueries(day: number): typeof QUERY_ROTATION {
  const queriesPerDay = 4; // 16 requests ÷ 4 pages each
  const startIdx = (day * queriesPerDay) % QUERY_ROTATION.length;
  return QUERY_ROTATION.slice(startIdx, startIdx + queriesPerDay);
}
The Honest Take
40-60 new jobs/day on free tier is enough to launch. Your early users won't notice if you have 500 vs 5,000 listings — they care about whether the 20 recommendations they see are relevant and have salary info. Quality over quantity.
Once you validate traction, the $30-40/mo for paid APIs is a no-brainer to scale to 500+ fresh jobs daily. But don't spend that before you have users.