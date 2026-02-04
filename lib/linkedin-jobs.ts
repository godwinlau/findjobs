import { normalizeLocation, extractSkills } from "@/lib/queries";
import crypto from "crypto";
import * as cheerio from "cheerio";

// ─── linkedin-jobs-api types ───
// Package uses CommonJS, so we dynamic-import it in the fetch function.
// Response shape from: https://github.com/VishwaGauravIn/linkedin-jobs-api

interface LinkedInJobResult {
  position: string;
  company: string;
  companyLogo: string;
  location: string;
  date: string;
  agoTime: string;
  salary: string;
  jobUrl: string;
}

// ─── Our normalized job shape for DB insert ───

export interface NormalizedJob {
  source: "linkedin";
  source_id: string;
  source_hash: string;
  title: string;
  company_name: string;
  company_logo_url: string | null;
  description: string;
  description_plain: string;
  salary_min: number | null;
  salary_max: number | null;
  salary_is_estimate: boolean;
  location_city: string | null;
  location_area: string | null;
  work_setup: "onsite" | "hybrid" | "remote" | null;
  job_type:
    | "full_time"
    | "part_time"
    | "contract"
    | "freelance"
    | "internship"
    | null;
  experience_level: "entry" | "junior" | "mid" | "senior" | null;
  skills_required: string[];
  apply_url: string;
  posted_at: string;
  expires_at: string | null;
  fetched_at: string;
  is_active: boolean;
}

// ─── Fetch from LinkedIn public guest API ───
// Uses linkedin-jobs-api npm package (no API key needed)
// Supports keyword + location filtering server-side

export async function fetchLinkedInJobs(
  keyword: string,
  jobType?: string,
  options?: { pages?: number; limit?: string }
): Promise<LinkedInJobResult[]> {
  // Dynamic import for CommonJS package
  const linkedIn = (await import("linkedin-jobs-api")).default;

  const pagesToFetch = options?.pages ?? 4; // Fetch pages 0-3 by default
  const limit = options?.limit ?? "25";
  const allResults: LinkedInJobResult[] = [];

  for (let page = 0; page < pagesToFetch; page++) {
    const queryOptions: Record<string, string | boolean> = {
      keyword,
      location: "Philippines",
      dateSincePosted: "past week",
      sortBy: "recent",
      limit,
      page: String(page),
    };

    if (jobType) {
      queryOptions.jobType = jobType;
    }

    const results: LinkedInJobResult[] = await linkedIn.query(queryOptions);
    const pageResults = results || [];
    allResults.push(...pageResults);

    // If we got fewer results than the limit, no more pages available
    if (pageResults.length < parseInt(limit, 10)) {
      break;
    }

    // Small delay between page fetches to avoid rate limiting
    if (page < pagesToFetch - 1) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  return allResults;
}

// ─── Scrape job description from detail page ───
// LinkedIn guest job pages expose description without auth
// Returns { html, plain } for rich rendering + search/skills

export interface ScrapedDescription {
  html: string;
  plain: string;
}

export async function scrapeJobDescription(
  jobUrl: string
): Promise<ScrapedDescription> {
  try {
    const res = await fetch(jobUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (!res.ok) return { html: "", plain: "" };

    const pageHtml = await res.text();
    const $ = cheerio.load(pageHtml);

    // LinkedIn guest pages use these selectors for job description
    const descEl =
      $(".show-more-less-html__markup").first() ||
      $(".description__text").first() ||
      $(".decorated-job-posting__details").first();

    const html = (descEl.html() || "").trim();

    // Add newlines before block elements so .text() doesn't concatenate words
    descEl.find("br, p, div, h1, h2, h3, h4, li, tr").each(function () {
      $(this).prepend("\n");
    });
    const plain = (descEl.text() || "")
      .replace(/\n{3,}/g, "\n\n")  // collapse excessive newlines
      .trim();

    return { html, plain };
  } catch {
    return { html: "", plain: "" };
  }
}

// ─── Normalize a LinkedIn job into our schema ───

export function normalizeJob(
  raw: LinkedInJobResult,
  desc: ScrapedDescription = { html: "", plain: "" },
  jobType?: string
): NormalizedJob {
  const location = normalizeLocation(raw.location);
  const salary = parseSalary(raw.salary);

  // Fallback: extract salary from description if structured field is empty
  let finalSalary = salary;
  let salaryIsEstimate = false;
  if (salary.min === null && salary.max === null && desc.plain) {
    const descSalary = extractSalaryFromDescription(desc.plain);
    if (descSalary.min !== null || descSalary.max !== null) {
      finalSalary = descSalary;
      salaryIsEstimate = true;
    }
  }

  // Extract source ID from jobUrl (LinkedIn job view ID)
  const sourceId = extractJobId(raw.jobUrl) || raw.jobUrl;

  // Infer experience level from title or description
  const experienceLevel = inferExperienceLevel(raw.position);

  // Extract skills from plain text description
  const skills = desc.plain ? extractSkills(desc.plain) : [];

  // Infer work setup from title, location, AND description
  const workSetup = inferWorkSetup(raw.position, raw.location, desc.plain);

  // Strip "Job Description" prefix — the UI renders its own heading
  const cleanHtml = desc.html
    .replace(/^\s*<(h[1-4]|p|div|span)[^>]*>\s*Job\s+Description\s*<\/\1>\s*/i, "")
    .trim();
  const cleanPlain = desc.plain
    .replace(/^\s*Job\s+Description\s*/i, "")
    .trim();

  return {
    source: "linkedin",
    source_id: sourceId,
    source_hash: generateSourceHash(raw.company, raw.position, location.city),
    title: raw.position,
    company_name: raw.company,
    company_logo_url: raw.companyLogo || null,
    description: cleanHtml,
    description_plain: cleanPlain,
    salary_min: finalSalary.min,
    salary_max: finalSalary.max,
    salary_is_estimate: salaryIsEstimate,
    location_city: location.city,
    location_area: location.area,
    work_setup: workSetup,
    job_type: mapJobType(jobType),
    experience_level: experienceLevel,
    skills_required: skills,
    apply_url: raw.jobUrl,
    posted_at: raw.date || new Date().toISOString(),
    expires_at: null,
    fetched_at: new Date().toISOString(),
    is_active: true,
  };
}

// ─── Extract LinkedIn job ID from URL ───

function extractJobId(url: string): string | null {
  // URLs look like: https://ph.linkedin.com/jobs/view/job-title-at-company-1234567890
  const match = url.match(/(\d{8,})(?:\?|$)/);
  return match ? match[1] : null;
}

// ─── Salary parsing ───
// LinkedIn salary strings: "$120,000 - $180,000", "₱25,000 - ₱35,000/mo", etc.

interface ParsedSalary {
  min: number | null;
  max: number | null;
}

// Normalize a salary number string that may use period as thousands separator.
// European/Latin notation: 1.500 = 1,500 / 1.500.000 = 1,500,000
function parseSalaryNumber(raw: string): number {
  const s = raw.replace(/\s/g, "");
  // Period followed by exactly 3 digits (with no comma present) → thousands separator
  if (/\.\d{3}(?:\.|$)/.test(s) && !s.includes(",")) {
    return parseFloat(s.replace(/\./g, ""));
  }
  // Default: comma = thousands, period = decimal
  return parseFloat(s.replace(/,/g, ""));
}

const PHP_USD_RATE = 56;
const PHP_GBP_RATE = 72;
const PHP_EUR_RATE = 62;

// ─── Salary sanity check ───
// In the PH market, ₱150K+/month is extremely rare (VP/C-level only).
// If no explicit period indicator was found and the computed monthly PHP
// value exceeds this threshold, assume the amount is actually annual.
const PHP_MONTHLY_SANITY_THRESHOLD = 150_000;

function hasExplicitMonthly(s: string): boolean {
  return /\/mo|per\s*month|monthly|\/month|a\s+month/i.test(s);
}

function sanitizeMonthlyPhp(
  salary: ParsedSalary,
  hadExplicitPeriod: boolean,
  sourceText: string
): ParsedSalary {
  if (hadExplicitPeriod || hasExplicitMonthly(sourceText)) return salary;

  const needsFix =
    (salary.min !== null && salary.min >= PHP_MONTHLY_SANITY_THRESHOLD) ||
    (salary.max !== null && salary.max >= PHP_MONTHLY_SANITY_THRESHOLD);

  if (!needsFix) return salary;

  return {
    min: salary.min !== null ? Math.round(salary.min / 12) : null,
    max: salary.max !== null ? Math.round(salary.max / 12) : null,
  };
}

function parseSalary(salaryStr: string): ParsedSalary {
  if (!salaryStr || salaryStr.trim() === "") {
    return { min: null, max: null };
  }

  // Detect currency (symbols or text like USD, GBP, EUR)
  let multiplier = 1;
  const s = salaryStr.toLowerCase();
  if (s.includes("£") || s.includes("gbp")) multiplier = PHP_GBP_RATE;
  else if (s.includes("€") || s.includes("eur")) multiplier = PHP_EUR_RATE;
  else if ((s.includes("$") && !s.includes("₱")) || s.includes("usd")) multiplier = PHP_USD_RATE;

  // Detect period
  let periodMultiplier = 1;
  let hadExplicitPeriod = false;
  if (s.includes("/yr") || s.includes("/year") || s.includes("per year") || /a\s+year/i.test(s)) {
    periodMultiplier = 1 / 12;
    hadExplicitPeriod = true;
  } else if (s.includes("/hr") || s.includes("/hour") || s.includes("per hour") || /an?\s+hour/i.test(s)) {
    periodMultiplier = 160;
    hadExplicitPeriod = true;
  } else if (s.includes("/wk") || s.includes("/week") || s.includes("per week") || /a\s+week/i.test(s)) {
    periodMultiplier = 4;
    hadExplicitPeriod = true;
  } else if (s.includes("/mo") || s.includes("/month") || s.includes("per month") || /a\s+month/i.test(s)) {
    hadExplicitPeriod = true;
  }
  // Default: assume monthly if no period indicator

  // Extract numbers (include periods to handle European thousands separator: 1.500)
  const numbers = salaryStr.match(/\d[\d.,]*/g);
  if (!numbers || numbers.length === 0) return { min: null, max: null };

  const parsed = numbers.map((n) => parseSalaryNumber(n));
  const toMonthlyPhp = (n: number) =>
    Math.round(n * multiplier * periodMultiplier);

  let result: ParsedSalary;
  if (parsed.length >= 2) {
    result = { min: toMonthlyPhp(parsed[0]), max: toMonthlyPhp(parsed[1]) };
  } else {
    result = { min: toMonthlyPhp(parsed[0]), max: null };
  }

  return sanitizeMonthlyPhp(result, hadExplicitPeriod, salaryStr);
}

// ─── Extract salary from job description text ───
// Fallback when the structured salary field is empty.
// Searches for common salary patterns in job descriptions.

const SALARY_KEYWORDS =
  /(?:salary|compensation|pay|offer(?:ing)?|budget|package|range|rate)\s*(?:range)?/i;

export function extractSalaryFromDescription(text: string): ParsedSalary {
  if (!text || text.trim().length === 0) return { min: null, max: null };

  // Separator between two values: -, –, —, or "to"
  const SEP = `(?:\\s*[-–—]\\s*|\\s+to\\s+)`;

  // Currency token: symbol or text (₱, PHP, $, USD, £, GBP, €, EUR)
  const CUR_REQ = `(?:₱|php\\s?|\\$|usd\\s?|£|gbp\\s?|€|eur\\s?)`;
  const CUR = `${CUR_REQ}?`; // Optional version

  // Number: digits with commas or periods as thousands separators
  const NUM = `([\\d,]+(?:\\.\\d+)?)`;

  // Currency suffix: currency word after numbers
  const CUR_SUFFIX = `(?:usd|gbp|eur|php|peso)`;

  // Patterns ordered from most specific (keyword-anchored) to least.
  // Each pattern captures two groups for range, or one for single value.
  const patterns: { re: RegExp; kNotation: boolean }[] = [
    // ── Keyword-anchored patterns (high confidence) ──

    // "Salary range: 35K-50K" / "salary: USD 25k to 40k" / "budget: 20K-30K"
    {
      re: new RegExp(
        SALARY_KEYWORDS.source +
          `[:\\s]+${CUR}\\s?(\\d+)\\s*k${SEP}${CUR}\\s?(\\d+)\\s*k`,
        "gi"
      ),
      kNotation: true,
    },
    // "Salary range: 35,000-50,000" / "salary: USD 1000 to 1800"
    {
      re: new RegExp(
        SALARY_KEYWORDS.source +
          `[:\\s]+${CUR}\\s?${NUM}${SEP}${CUR}\\s?${NUM}`,
        "gi"
      ),
      kNotation: false,
    },
    // "Salary: 35K" / "budget: USD 50k" (single K value near keyword)
    {
      re: new RegExp(
        SALARY_KEYWORDS.source + `[:\\s]+${CUR}\\s?(\\d+)\\s*k\\b`,
        "gi"
      ),
      kNotation: true,
    },
    // "Salary: 35,000" (single full value near keyword)
    {
      re: new RegExp(
        SALARY_KEYWORDS.source +
          `[:\\s]+${CUR}\\s?${NUM}`,
        "gi"
      ),
      kNotation: false,
    },

    // ── Currency-prefix patterns (medium confidence) ──

    // ₱25K-₱35K / $25k to $35k / USD 25K to 35K (K notation with currency)
    {
      re: new RegExp(
        `${CUR_REQ}\\s?(\\d+)\\s*k${SEP}${CUR}\\s?(\\d+)\\s*k`,
        "gi"
      ),
      kNotation: true,
    },
    // ₱25,000-₱35,000 / $1,200 to $1,500 / USD 1200 to 1500 (full numbers with currency)
    {
      re: new RegExp(
        `${CUR_REQ}\\s?${NUM}${SEP}${CUR}\\s?${NUM}`,
        "gi"
      ),
      kNotation: false,
    },
    // ₱25K / PHP 35k / USD 50k (single K value with currency)
    {
      re: new RegExp(`${CUR_REQ}\\s?(\\d+)\\s*k\\b`, "gi"),
      kNotation: true,
    },
    // ₱25,000 / PHP 35000 / USD 1500 (single full value with currency)
    {
      re: new RegExp(`${CUR_REQ}\\s?${NUM}\\b`, "gi"),
      kNotation: false,
    },

    // ── Currency-suffix patterns (currency word after numbers) ──

    // 35K-50K USD / 25k to 40k PHP (K notation with trailing currency word)
    {
      re: new RegExp(
        `(\\d+)\\s*k${SEP}(\\d+)\\s*k\\s*${CUR_SUFFIX}\\b`,
        "gi"
      ),
      kNotation: true,
    },
    // 1000 - 1800 USD / 25,000 to 35,000 PHP (full numbers with trailing currency word)
    {
      re: new RegExp(
        `${NUM}${SEP}${NUM}\\s*${CUR_SUFFIX}\\b`,
        "gi"
      ),
      kNotation: false,
    },
    // 1500 USD / 35000 PHP (single value with trailing currency word)
    {
      re: new RegExp(
        `${NUM}\\s*${CUR_SUFFIX}\\b`,
        "gi"
      ),
      kNotation: false,
    },

    // ── Standalone K-notation ranges (lower confidence) ──

    // 35K-50K / 25k to 40k (no currency, no keyword, but K notation is strong signal)
    {
      re: new RegExp(`(\\d+)\\s*k${SEP}(\\d+)\\s*k`, "gi"),
      kNotation: true,
    },
  ];

  // Determine currency multiplier from description context
  let multiplier = 1;
  const hasGBP = /£\s?\d/.test(text) || /\bGBP\b/i.test(text);
  const hasEUR = /€\s?\d/.test(text) || /\bEUR\b/i.test(text);
  const hasForeignCurrency =
    (/\$\s?\d/.test(text) && !text.includes("₱")) || /\bUSD\b/i.test(text);
  if (hasGBP) multiplier = PHP_GBP_RATE;
  else if (hasEUR) multiplier = PHP_EUR_RATE;
  else if (hasForeignCurrency) multiplier = PHP_USD_RATE;

  // Detect period from nearby text for normalization to monthly
  let periodMultiplier = 1;
  let hadExplicitPeriod = false;
  const lower = text.toLowerCase();
  const annualTerms = /per\s*year|\/year|per\s*annum|\/yr|annual|a\s+year/i;
  const hourlyTerms = /\/hr|per\s*hour|\/hour|an?\s+hour/i;
  const weeklyTerms = /\/wk|per\s*week|\/week|a\s+week/i;
  const monthlyTerms = /\/mo|per\s*month|\/month|monthly|a\s+month/i;

  if (annualTerms.test(lower)) {
    if (/[\d,]+\s*k?\s*(?:per\s*year|\/year|per\s*annum|\/yr|annual)/i.test(text) ||
        /(?:per\s*year|\/year|per\s*annum|\/yr|annual)\s*[\d,]+/i.test(text)) {
      periodMultiplier = 1 / 12;
      hadExplicitPeriod = true;
    }
  } else if (hourlyTerms.test(lower)) {
    if (/[\d,]+\s*k?\s*(?:\/hr|per\s*hour|\/hour)/i.test(text) ||
        /(?:\/hr|per\s*hour|\/hour)\s*[\d,]+/i.test(text)) {
      periodMultiplier = 160;
      hadExplicitPeriod = true;
    }
  } else if (weeklyTerms.test(lower)) {
    if (/[\d,]+\s*k?\s*(?:\/wk|per\s*week|\/week)/i.test(text) ||
        /(?:\/wk|per\s*week|\/week)\s*[\d,]+/i.test(text)) {
      periodMultiplier = 4;
      hadExplicitPeriod = true;
    }
  } else if (monthlyTerms.test(lower)) {
    hadExplicitPeriod = true;
  }

  const toMonthlyPhp = (n: number) =>
    Math.round(n * multiplier * periodMultiplier);

  // Non-salary keywords — if these appear near the matched amount, skip it
  const NON_SALARY_RE =
    /\b(?:bonus|incentive|allowance|reward|commission|referral|signing\s+bonus|attendance|meal|rice|transportation|travel|hazard|night\s+(?:differential|premium)|overtime|ot\s+pay|13th\s+month|de\s+minimis)\b/i;

  for (const { re, kNotation } of patterns) {
    re.lastIndex = 0;
    const match = re.exec(text);
    if (!match) continue;

    // Check surrounding context (~120 chars before and after match) for bonus/allowance keywords
    const contextStart = Math.max(0, match.index - 120);
    const contextEnd = Math.min(text.length, match.index + match[0].length + 120);
    const context = text.slice(contextStart, contextEnd);

    if (NON_SALARY_RE.test(context)) {
      // This amount is likely a bonus/allowance, skip and try next pattern
      continue;
    }

    if (match[2] !== undefined) {
      // Range: two captured groups
      let num1 = parseSalaryNumber(match[1]);
      let num2 = parseSalaryNumber(match[2]);
      if (kNotation) { num1 *= 1000; num2 *= 1000; }
      const min = toMonthlyPhp(Math.min(num1, num2));
      const max = toMonthlyPhp(Math.max(num1, num2));
      if (min >= 1000 && max <= 10_000_000) {
        return sanitizeMonthlyPhp({ min, max }, hadExplicitPeriod, text);
      }
    } else if (match[1] !== undefined) {
      // Single value — minimum ₱8,000 (below PH minimum wage is not a salary)
      let num = parseSalaryNumber(match[1]);
      if (kNotation) num *= 1000;
      const value = toMonthlyPhp(num);
      if (value >= 8000 && value <= 10_000_000) {
        return sanitizeMonthlyPhp({ min: value, max: null }, hadExplicitPeriod, text);
      }
    }
  }

  return { min: null, max: null };
}

// ─── Work setup inference ───

function inferWorkSetup(
  title: string,
  location: string,
  description: string = ""
): "onsite" | "hybrid" | "remote" | null {
  const combined = `${title} ${location} ${description}`.toLowerCase();
  if (combined.includes("remote") || combined.includes("wfh") || combined.includes("work from home"))
    return "remote";
  if (combined.includes("hybrid")) return "hybrid";
  return "onsite";
}

// ─── Job type mapping ───

function mapJobType(
  type?: string
): "full_time" | "part_time" | "contract" | "freelance" | "internship" | null {
  if (!type) return null;

  const lower = type.toLowerCase();
  if (lower.includes("full")) return "full_time";
  if (lower.includes("part")) return "part_time";
  if (lower.includes("contract") || lower.includes("temporary")) return "contract";
  if (lower.includes("freelance")) return "freelance";
  if (lower.includes("intern")) return "internship";
  return "full_time";
}

// ─── Experience level inference from title ───

function inferExperienceLevel(
  title: string
): "entry" | "junior" | "mid" | "senior" | null {
  const lower = title.toLowerCase();
  if (lower.includes("senior") || lower.includes("lead") || lower.includes("manager") || lower.includes("director"))
    return "senior";
  if (lower.includes("junior") || lower.includes("jr")) return "junior";
  if (lower.includes("intern") || lower.includes("entry") || lower.includes("fresh"))
    return "entry";
  return null;
}

// ─── Cross-source dedup hash ───

function generateSourceHash(
  company: string,
  title: string,
  city: string | null
): string {
  const normalized = [
    company.toLowerCase().trim(),
    title.toLowerCase().trim(),
    (city || "").toLowerCase().trim(),
  ].join("|");

  return crypto.createHash("md5").update(normalized).digest("hex");
}
