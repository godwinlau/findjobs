**HANAPBUHAY**

API Integration Architecture

Job Data Pipeline - Technical Specification

| Version | **1.0** |
| --- | --- |
| Date | **February 2026** |
| Author | **Godwin - Builtclean Studio** |
| Status | **Draft** |

# 1\. System Overview

HanapBuhay requires a reliable job data pipeline that aggregates listings from multiple sources, normalizes them into a unified schema, enriches them with match scoring and salary intelligence, and serves them to the frontend via a real-time API.

This spec covers the complete data flow from external sources to the user's screen.

**✨ Design Principle**

The job data is not the product - the experience around it is.

We treat external APIs as commodity inputs and focus engineering effort on the enrichment, matching, and presentation layers.

## 1.1 Architecture Diagram

**DATA FLOW**

\[External APIs\] → \[Ingestion Workers\] → \[Normalization\] → \[Supabase DB\]

\[Supabase DB\] → \[Enrichment Engine\] → \[Match Scoring\] → \[API Layer\]

\[API Layer\] → \[Next.js Frontend\] → \[User Dashboard\]

# 2\. Data Sources

We use a tiered approach: API-first for reliability, RSS as supplement, structured data crawling for scale.

## 2.1 Tier 1: Primary APIs

### JSearch (via RapidAPI)

| **Endpoint** | <https://jsearch.p.rapidapi.com/search> |
| --- | --- |
| **Free Tier** | 500 requests/month |
| **Coverage** | Aggregates LinkedIn, Indeed, Glassdoor, ZipRecruiter |
| **PH Support** | Yes - filter by country=PH, location=Metro Manila |
| **Rate Limit** | 5 requests/second |
| **Key Fields** | job_title, employer_name, job_city, job_min_salary, job_max_salary, job_description, job_apply_link, job_posted_at |

### Adzuna API

| **Endpoint** | <https://api.adzuna.com/v1/api/jobs/ph/search/1> |
| --- | --- |
| **Free Tier** | 5,000 requests/month |
| **Coverage** | PH job market, salary estimates included |
| **Key Advantage** | Returns salary_min/salary_max even when not posted - critical for our salary transparency feature |
| **Key Fields** | title, company.display_name, location.display_name, salary_min, salary_max, description, redirect_url, created |

### Remotive API

Free, no auth required. Returns remote-only jobs. Endpoint: <https://remotive.com/api/remote-jobs>. Good supplement for the remote/freelance segment.

## 2.2 Tier 2: RSS Feeds

- Indeed PH RSS - <https://ph.indeed.com/rss?q={query}&l={location}>
- PhilJobNet (DOLE) - Government job listings, public data
- CSC Job Portal - Government positions

## 2.3 Tier 3: Structured Data Crawling

For Phase 3 (scale). Crawl company career pages that use schema.org/JobPosting markup. This is legal - companies add structured data specifically so search engines and aggregators can index their listings.

- Target: Top 100 PH employers' career pages
- Parse: JSON-LD or Microdata with @type: JobPosting
- Fields: title, hiringOrganization, jobLocation, baseSalary, datePosted, validThrough

## 2.4 Source Priority Matrix

| **Source** | **Priority** | **Cost** | **PH Coverage** | **Salary?** | **Refresh** |
| --- | --- | --- | --- | --- | --- |
| **JSearch** | P0 - Primary | Free (500/mo) | High | Sometimes | 6h  |
| **Adzuna** | P0 - Primary | Free (5K/mo) | High | Always ✓ | 6h  |
| **Remotive** | P1 - Supplement | Free | Low (remote) | Sometimes | 12h |
| **Indeed RSS** | P1 - Supplement | Free | High | Rarely | 12h |
| **Schema.org** | P2 - Scale | Hosting only | Targeted | Varies | 24h |
| **Direct Post** | P0 - Primary | Free | Curated | Required ✓ | Real-time |

# 3\. Unified Job Schema

All sources normalize to this single schema in Supabase. This is the single source of truth for the entire application.

## 3.1 jobs Table

| **Column** | **Type** | **Required** | **Notes** |
| --- | --- | --- | --- |
| **id** | uuid | PK  | Auto-generated |
| **source** | enum | Yes | jsearch \| adzuna \| remotive \| rss \| direct \| schema_crawl |
| **source_id** | text | Yes | External ID for dedup - unique per source |
| **title** | text | Yes | Normalized job title |
| **company_name** | text | Yes | Employer name |
| **company_verified** | boolean | No  | Manually verified employers = true |
| **company_logo_url** | text | No  | From Clearbit Logo API (free) |
| **description** | text | Yes | Full job description, HTML sanitized |
| **description_plain** | text | Yes | Stripped text for search + matching |
| **salary_min** | integer | No  | Monthly PHP amount |
| **salary_max** | integer | No  | Monthly PHP amount |
| **salary_is_estimate** | boolean | No  | True if from Adzuna estimate, not posted |
| **location_city** | text | No  | e.g., Taguig, Makati, Cebu |
| **location_area** | text | No  | e.g., BGC, Ortigas, IT Park |
| **work_setup** | enum | No  | onsite \| hybrid \| remote |
| **job_type** | enum | No  | full_time \| part_time \| contract \| freelance \| internship |
| **experience_level** | enum | No  | entry \| junior \| mid \| senior |
| **skills_required** | text\[\] | No  | Array of extracted skill keywords |
| **apply_url** | text | Yes | External application link |
| **posted_at** | timestamptz | Yes | When the job was first posted |
| **expires_at** | timestamptz | No  | Closing date if known |
| **fetched_at** | timestamptz | Yes | When we last ingested this listing |
| **is_active** | boolean | Yes | Soft delete - false when expired/removed |
| **applicant_count** | integer | No  | Tracked internally from our platform |
| **view_count** | integer | No  | How many users viewed this listing |

## 3.2 Indexes

- Composite: (is_active, posted_at DESC) - primary feed query
- GIN: skills_required - array overlap matching
- Unique: (source, source_id) - deduplication constraint
- Text search: title, description_plain - full-text search
- Partial: (is_active = true, expires_at) - expiration cleanup

# 4\. Ingestion Pipeline

The pipeline runs as Vercel Cron Jobs (or Supabase Edge Functions) on a schedule. Each source has a dedicated worker.

## 4.1 Pipeline Flow

**INGESTION PIPELINE**

1\. FETCH → Hit external API with PH-specific params

2\. NORMALIZE → Map source fields to unified schema

3\. DEDUP → Check (source, source_id) constraint

4\. ENRICH → Extract skills, estimate salary, fetch logo

5\. SCORE → Pre-compute match scores for active users

6\. STORE → Upsert to Supabase via batch insert

7\. NOTIFY → Push new high-match jobs to relevant users

## 4.2 Normalization Rules

Each source maps differently. Here are the key transformations:

### JSearch Mapping

| **JSearch Field** | **→** | **Our Schema** |
| --- | --- | --- |
| job_title | →   | title |
| employer_name | →   | company_name |
| job_city | →   | location_city |
| job_min_salary / job_max_salary | →   | salary_min / salary_max (convert to PHP monthly) |
| job_description | →   | description (sanitize HTML) |
| job_required_skills | →   | skills_required |
| job_apply_link | →   | apply_url |
| job_posted_at_datetime_utc | →   | posted_at |
| job_is_remote | →   | work_setup (map to enum) |

## 4.3 Salary Normalization

Critical for our salary transparency feature. Different sources report salaries differently:

- Annual → divide by 12
- Hourly → multiply by 160 (standard PH work hours)
- USD → convert to PHP using daily exchange rate (store rate used for audit)
- If no salary: use Adzuna estimate → set salary_is_estimate = true
- If no estimate available: leave null (never show fake data)

## 4.4 Skill Extraction

Run NLP extraction on description_plain to populate skills_required:

- Maintain a curated taxonomy of 200+ skills relevant to PH job market
- Match against taxonomy using keyword matching + fuzzy matching
- Supplement with skills explicitly listed in structured API data
- Priority: explicit API skills > extracted from description > inferred from title

## 4.5 Deduplication Strategy

The same job often appears across multiple sources. Our dedup approach:

- **Level 1 - Exact:** Unique constraint on (source, source_id). Prevents re-inserting the same listing from the same API.
- **Level 2 - Cross-source:** Hash of normalized(company_name + title + location_city). If hash matches an existing listing, keep the one with more data (salary, description length).
- **Level 3 - Fuzzy:** Levenshtein distance on title + company. Threshold: 85% similarity. Flag for manual review rather than auto-merge.

# 5\. Match Scoring Engine

The match percentage is the core UX differentiator. It must be transparent, explainable, and genuinely useful.

## 5.1 Scoring Formula

**MATCH SCORE CALCULATION**

match_score = weighted_sum(

skills_overlap \* 0.35, // % of required skills user has

experience_fit \* 0.20, // entry-level job + fresh grad = 100%

location_match \* 0.15, // exact city = 100%, same region = 70%

salary_alignment \* 0.15, // overlap between user range + job range

work_setup_match \* 0.10, // user preference matches job setup

recency_bonus \* 0.05, // posted < 24h = 100%, decays over 7 days

)

## 5.2 Score Transparency

Every match score must be explainable. The frontend shows a breakdown:

- **92% match** - "3 of your skills match this role's top requirements"
- **Green items:** Skills you have that match
- **Gray items:** Skills the job wants that you're missing (with links to learn them)

**Why This Matters**

JobStreet and Kalibrr show "Recommended for you" with zero explanation.

Users don't trust black-box recommendations. Showing WHY a job matches builds trust and drives applications.

# 6\. Enrichment Layer

Raw API data is thin. We add value through enrichment:

| **Enrichment** | **Source** | **Purpose** |
| --- | --- | --- |
| **Company Logo** | Clearbit Logo API (free) | Visual trust signal on job cards |
| **Company Size** | Crunchbase / manual | Context for job seekers |
| **Salary Estimate** | Adzuna salary API | Fill gaps when salary not posted |
| **Skill Extraction** | NLP on description | Power match scoring + skill gap analysis |
| **Response Time** | Internal tracking | Avg days employer takes to respond |
| **Applicant Count** | Internal tracking | Social proof + competition signal |
| **Closing Prediction** | ML on historical data | Urgency signal when no explicit deadline |

# 7\. API Layer

Next.js API routes serve the frontend. Supabase handles auth and real-time subscriptions.

## 7.1 Core Endpoints

| **Method** | **Endpoint** | **Description** |
| --- | --- | --- |
| **GET** | /api/jobs/matches | Personalized feed, scored + sorted for user |
| **GET** | /api/jobs/\[id\] | Full job detail with match breakdown |
| **GET** | /api/jobs/search?q=&loc= | Manual search with filters |
| **POST** | /api/applications | Submit application (track internally) |
| **GET** | /api/applications | User's application pipeline |
| **GET** | /api/activity | Live activity feed (views, status changes) |
| **GET** | /api/profile/score | Readiness score + improvement suggestions |
| **GET** | /api/salary/\[role\]?loc= | Market salary data for a role/location |

## 7.2 Real-Time Subscriptions

Supabase Realtime powers the live activity feed:

- Application status changes → push to user's activity feed
- Employer views profile → push notification + activity entry
- New high-match jobs (≥85%) → push notification
- Interview reminders → scheduled push 24h and 1h before

# 8\. Cron Schedule

| **Job** | **Frequency** | **Details** |
| --- | --- | --- |
| **fetch-jsearch** | Every 6 hours | Pull latest PH jobs, normalize, dedup, store |
| **fetch-adzuna** | Every 6 hours | Pull latest + salary estimates |
| **fetch-remotive** | Every 12 hours | Remote jobs supplement |
| **fetch-rss** | Every 12 hours | Indeed PH + government feeds |
| **cleanup-expired** | Daily at 2AM | Mark expired listings as is_active = false |
| **recompute-scores** | Every 6 hours | Recalculate match scores after new ingestion |
| **refresh-logos** | Weekly | Update company logos from Clearbit |
| **salary-sync** | Daily | Update PHP/USD exchange rate for salary normalization |

# 9\. Tech Stack

| **Layer** | **Technology** | **Rationale** |
| --- | --- | --- |
| **Frontend** | Next.js 14 (App Router) | SSR for SEO, RSC for performance |
| **Database** | Supabase (PostgreSQL) | Auth, realtime, storage, edge functions |
| **Hosting** | Vercel | Zero-config deploys, edge network, cron jobs |
| **Cron / Workers** | Vercel Cron + Edge Functions | Serverless, scales to zero |
| **Search** | Supabase pg_trgm + tsvector | Full-text search without external service |
| **Cache** | Vercel KV (Redis) | Cache match scores, hot job listings |
| **Logos** | Clearbit Logo API | Free company logos by domain |
| **Analytics** | PostHog (free tier) | Product analytics, funnel tracking |
| **PWA** | next-pwa | Installable, push notifications, offline |

# 10\. Phased Rollout

## Phase 1: MVP (Weeks 1-4)

- JSearch + Adzuna APIs live
- Unified schema in Supabase
- Basic normalization + dedup
- Match scoring v1 (skills overlap only)
- 20-30 manually curated "verified" jobs
- Target: 200-500 active listings in feed

## Phase 2: Enrichment (Weeks 5-8)

- Full match scoring formula (all 6 signals)
- Salary estimation pipeline
- Company logo enrichment
- Skill extraction NLP
- Real-time activity feed
- Employer self-serve posting form

## Phase 3: Scale (Weeks 9-12)

- Schema.org career page crawler
- Cross-source deduplication
- Response time tracking + display
- Push notifications for high matches
- Salary research tool (market data)
- Target: 2,000-5,000 active listings

# 11\. Cost Estimate (MVP)

| **Service** | **Monthly Cost** | **Notes** |
| --- | --- | --- |
| **Vercel (Pro)** | \$20 | Hosting + cron jobs |
| **Supabase (Free → Pro)** | \$0 → \$25 | Free tier covers MVP |
| **RapidAPI (JSearch)** | \$0 | Free tier: 500 req/mo |
| **Adzuna API** | \$0 | Free tier: 5,000 req/mo |
| **Clearbit Logo** | \$0 | Free for logos |
| **Vercel KV** | \$0 | Free tier: 3K req/day |
| **PostHog** | \$0 | Free tier: 1M events/mo |
| **Domain** | \$12/yr | hanapbuhay.ph |
| **Total (Month 1)** | **\$20 - \$45** | **Scales with usage** |

**✓ Total MVP Cost: Under \$50/month**

This is intentionally lean. No paid APIs until we validate product-market fit.

The expensive parts (ML scoring, NLP enrichment) run on free compute tiers at MVP scale.

_- End of Specification -_