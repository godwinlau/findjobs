"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowUpRight, YoutubeLogo } from "@phosphor-icons/react";
import type { SkillROI } from "@/lib/types/learn";
import { getYoutubeForSkill, createYoutubeLookup } from "@/lib/constants/youtubeResources";

interface SkillsRecommendationBannerProps {
  topSkills: SkillROI[];
  animationDelay?: number;
  youtubeMaps?: { clusters: Record<string, { url: string; channel: string }>; skills: Record<string, { url: string; channel: string }> };
}

/* ─── Skill category detection ─── */
type PanelMode = "code" | "design" | "data" | "bpo" | "marketing" | "finance" | "admin" | "healthcare" | "sales" | "education" | "engineering" | "trades" | "general";

const CODE_SKILLS = new Set([
  "javascript", "typescript", "react", "next.js", "node.js", "python",
  "html", "css", "sql", "git", "docker", "aws", "vue.js", "angular",
  "php", "ruby", "java", "c#", "swift", "kotlin", "go", "rust",
  "mongodb", "postgresql", "redis", "graphql", "rest api",
]);

const DESIGN_SKILLS = new Set([
  "figma", "adobe photoshop", "adobe illustrator", "adobe xd", "canva",
  "ui design", "ux design", "sketch", "invision", "graphic design",
  "motion graphics", "video editing", "adobe premiere", "adobe after effects",
]);

const DATA_SKILLS = new Set([
  "power bi", "tableau", "data analysis", "statistics",
  "r programming", "spss", "data visualization", "machine learning",
  "big data", "data warehousing", "python for data science",
]);

const BPO_SKILLS = new Set([
  "customer service (voice)", "customer service (non-voice)", "zendesk",
  "live chat support", "email support", "technical support", "crm management",
  "ticketing systems", "content moderation", "freshdesk", "intercom",
  "typing speed (50+ wpm)", "english proficiency", "neutral english accent",
  "conflict resolution", "data entry",
]);

const MARKETING_SKILLS = new Set([
  "seo", "google ads (sem)", "facebook/meta ads", "email marketing",
  "content writing", "copywriting", "shopify marketing", "influencer marketing",
  "brand strategy", "tiktok marketing", "youtube marketing", "hubspot",
  "mailchimp", "google analytics", "content marketing", "social media management",
  "semrush / ahrefs", "google tag manager", "google ads", "facebook ads",
]);

const FINANCE_SKILLS = new Set([
  "bookkeeping", "quickbooks", "xero", "sap", "financial analysis",
  "financial reporting", "accounts payable / receivable", "payroll processing",
  "tax preparation (ph)", "auditing", "budgeting & forecasting",
  "invoicing & billing", "bank reconciliation", "financial modeling",
  "cost accounting", "excel (advanced)", "microsoft office suite",
]);

const ADMIN_SKILLS = new Set([
  "calendar management", "email management", "google workspace",
  "project management (asana/trello)", "notion", "slack / teams communication",
  "research & reporting", "monday.com", "clickup", "document formatting",
  "meeting minutes & notes", "time management", "client communication",
  "file management (cloud)",
]);

const HEALTHCARE_SKILLS = new Set([
  "nursing (rn license)", "medical coding (icd-10)", "medical billing",
  "electronic health records (ehr)", "telemedicine support", "hipaa compliance",
  "caregiving", "pharmacy", "medical technology", "first aid / bls",
  "medical transcription", "dental assisting",
]);

const SALES_SKILLS = new Set([
  "lead generation", "cold calling", "salesforce crm", "b2b sales",
  "b2c sales", "account management", "negotiation", "linkedin outreach",
  "cold emailing", "proposal writing", "pipedrive / crm tools",
  "sales presentation", "telemarketing",
]);

const EDUCATION_SKILLS = new Set([
  "teaching (k-12)", "esl/tesol teaching", "online tutoring",
  "instructional design", "lms administration (moodle/canvas)",
  "curriculum development", "corporate training",
  "e-learning content creation", "assessment design",
  "special education (sped)", "student counseling", "academic writing",
]);

const ENGINEERING_SKILLS = new Set([
  "autocad", "revit", "solidworks", "civil engineering",
  "electrical engineering", "mechanical engineering",
  "project management (construction)", "structural analysis",
  "hvac design", "quality control / inspection", "plc programming",
  "six sigma / lean", "safety management (osha)", "quantity surveying",
  "gis / mapping", "matlab", "iot (internet of things)",
  "robotics", "electronics / pcb design",
]);

const TRADES_SKILLS = new Set([
  "warehouse management", "supply chain management", "inventory management",
  "forklift operation", "delivery / courier services",
  "electrical installation", "plumbing", "welding",
  "hvac installation & repair", "automotive repair",
  "food handling / haccp", "heavy equipment operation",
  "procurement", "shipping / freight coordination", "last-mile logistics",
]);

function getPanelMode(skillName: string): PanelMode {
  const key = skillName.toLowerCase();
  if (CODE_SKILLS.has(key)) return "code";
  if (DESIGN_SKILLS.has(key)) return "design";
  if (DATA_SKILLS.has(key)) return "data";
  if (BPO_SKILLS.has(key)) return "bpo";
  if (MARKETING_SKILLS.has(key)) return "marketing";
  if (FINANCE_SKILLS.has(key)) return "finance";
  if (ADMIN_SKILLS.has(key)) return "admin";
  if (HEALTHCARE_SKILLS.has(key)) return "healthcare";
  if (SALES_SKILLS.has(key)) return "sales";
  if (EDUCATION_SKILLS.has(key)) return "education";
  if (ENGINEERING_SKILLS.has(key)) return "engineering";
  if (TRADES_SKILLS.has(key)) return "trades";
  return "general";
}

/* ─── Skill visual configs ─── */
const SKILL_VISUALS: Record<string, { bg: string; accent: string; icon: string }> = {
  "javascript": { bg: "#0d0d0d", accent: "#f7df1e", icon: "JS" },
  "typescript": { bg: "#0f172a", accent: "#3b82f6", icon: "TS" },
  "react": { bg: "#0a0a0a", accent: "#06b6d4", icon: "Re" },
  "next.js": { bg: "#000000", accent: "#ffffff", icon: "Nx" },
  "node.js": { bg: "#0f1f0f", accent: "#22c55e", icon: "No" },
  "python": { bg: "#1e1b4b", accent: "#fbbf24", icon: "Py" },
  "html": { bg: "#1c0a05", accent: "#f97316", icon: "HT" },
  "css": { bg: "#0c1929", accent: "#38bdf8", icon: "CS" },
  "sql": { bg: "#0f172a", accent: "#a78bfa", icon: "SQ" },
  "git": { bg: "#1a0a0a", accent: "#ef4444", icon: "Gi" },
  "docker": { bg: "#0a1628", accent: "#0ea5e9", icon: "Do" },
  "aws": { bg: "#1a1206", accent: "#f59e0b", icon: "AW" },
  "vue.js": { bg: "#0a1a14", accent: "#10b981", icon: "Vu" },
  "angular": { bg: "#1a0508", accent: "#dc2626", icon: "Ng" },
  "figma": { bg: "#1a0a1a", accent: "#e879f9", icon: "Fi" },
  "adobe photoshop": { bg: "#001a2c", accent: "#0ea5e9", icon: "Ps" },
  "canva": { bg: "#1a0f2e", accent: "#8b5cf6", icon: "Cv" },
  "ui design": { bg: "#1f0a1a", accent: "#ec4899", icon: "UI" },
  "ux design": { bg: "#150a20", accent: "#a855f7", icon: "UX" },
  "power bi": { bg: "#1a1a05", accent: "#eab308", icon: "BI" },
  "tableau": { bg: "#1a1020", accent: "#f472b6", icon: "Tb" },
  /* BPO — teal/green tones */
  "customer service (voice)": { bg: "#0a1a18", accent: "#14b8a6", icon: "CS" },
  "customer service (non-voice)": { bg: "#0a1a18", accent: "#2dd4bf", icon: "CN" },
  "zendesk": { bg: "#0a1614", accent: "#10b981", icon: "Zd" },
  "live chat support": { bg: "#081a18", accent: "#06b6d4", icon: "LC" },
  "technical support": { bg: "#0a1a1a", accent: "#14b8a6", icon: "TS" },
  "data entry": { bg: "#0a1a14", accent: "#34d399", icon: "DE" },
  /* Marketing — coral/pink tones */
  "seo": { bg: "#0a1628", accent: "#3b82f6", icon: "SE" },
  "google ads (sem)": { bg: "#1a150a", accent: "#f59e0b", icon: "GA" },
  "facebook/meta ads": { bg: "#1a0a18", accent: "#ec4899", icon: "Fb" },
  "email marketing": { bg: "#1a0f14", accent: "#f472b6", icon: "EM" },
  "content writing": { bg: "#1a120a", accent: "#fb923c", icon: "CW" },
  "tiktok marketing": { bg: "#1a0a14", accent: "#f43f5e", icon: "Tk" },
  "social media management": { bg: "#1a0a18", accent: "#f43f5e", icon: "SM" },
  "influencer marketing": { bg: "#1a0a1a", accent: "#e879f9", icon: "IM" },
  /* Finance — green/gold tones */
  "bookkeeping": { bg: "#0f1a0a", accent: "#22c55e", icon: "Bk" },
  "quickbooks": { bg: "#0a1a14", accent: "#10b981", icon: "QB" },
  "financial analysis": { bg: "#1a1a05", accent: "#eab308", icon: "FA" },
  "payroll processing": { bg: "#0f1a0a", accent: "#4ade80", icon: "PR" },
  "excel (advanced)": { bg: "#0a1f14", accent: "#22c55e", icon: "XL" },
  "auditing": { bg: "#141a0a", accent: "#a3e635", icon: "Au" },
  /* Admin — blue/slate tones */
  "calendar management": { bg: "#0a1428", accent: "#60a5fa", icon: "Ca" },
  "google workspace": { bg: "#0f172a", accent: "#3b82f6", icon: "GW" },
  "notion": { bg: "#0f0f1a", accent: "#a5b4fc", icon: "No" },
  "project management (asana/trello)": { bg: "#0f172a", accent: "#6366f1", icon: "PM" },
  "clickup": { bg: "#1a0a28", accent: "#a78bfa", icon: "CU" },
  /* Healthcare — red/teal tones */
  "nursing (rn license)": { bg: "#1a0a0f", accent: "#f43f5e", icon: "RN" },
  "medical coding (icd-10)": { bg: "#0a1a1a", accent: "#14b8a6", icon: "MC" },
  "medical billing": { bg: "#1a0a10", accent: "#fb7185", icon: "MB" },
  "electronic health records (ehr)": { bg: "#0a1628", accent: "#38bdf8", icon: "EH" },
  "hipaa compliance": { bg: "#1a0f0a", accent: "#f97316", icon: "HC" },
  "caregiving": { bg: "#1a0510", accent: "#e11d48", icon: "CG" },
  /* Sales — orange/amber tones */
  "lead generation": { bg: "#1a150a", accent: "#f59e0b", icon: "LG" },
  "cold calling": { bg: "#1a120a", accent: "#fb923c", icon: "CC" },
  "salesforce crm": { bg: "#0a1628", accent: "#3b82f6", icon: "SF" },
  "b2b sales": { bg: "#1a0f0a", accent: "#f97316", icon: "B2" },
  "negotiation": { bg: "#1a1a05", accent: "#eab308", icon: "Ng" },
  "linkedin outreach": { bg: "#0a1428", accent: "#0ea5e9", icon: "Li" },
  /* Education — warm purple/indigo tones */
  "teaching (k-12)": { bg: "#1a0f2e", accent: "#a78bfa", icon: "Tk" },
  "esl/tesol teaching": { bg: "#1a0a28", accent: "#c084fc", icon: "ES" },
  "online tutoring": { bg: "#150a20", accent: "#a855f7", icon: "OT" },
  "instructional design": { bg: "#1a102a", accent: "#8b5cf6", icon: "ID" },
  "curriculum development": { bg: "#1a0f2e", accent: "#7c3aed", icon: "CD" },
  "corporate training": { bg: "#0f0f2a", accent: "#818cf8", icon: "CT" },
  /* Engineering — steel blue/slate tones */
  "autocad": { bg: "#0f172a", accent: "#ef4444", icon: "AC" },
  "revit": { bg: "#0a1628", accent: "#3b82f6", icon: "Rv" },
  "solidworks": { bg: "#1a0a0a", accent: "#ef4444", icon: "SW" },
  "civil engineering": { bg: "#0a1428", accent: "#64748b", icon: "CE" },
  "electrical engineering": { bg: "#1a1a05", accent: "#eab308", icon: "EE" },
  "mechanical engineering": { bg: "#0f172a", accent: "#94a3b8", icon: "ME" },
  "matlab": { bg: "#1a0a08", accent: "#f97316", icon: "ML" },
  /* Trades — earthy orange/brown tones */
  "warehouse management": { bg: "#1a150a", accent: "#d97706", icon: "WM" },
  "supply chain management": { bg: "#1a120a", accent: "#f59e0b", icon: "SC" },
  "welding": { bg: "#1a0f08", accent: "#fb923c", icon: "Wd" },
  "electrical installation": { bg: "#1a1a05", accent: "#eab308", icon: "EI" },
  "plumbing": { bg: "#0a1628", accent: "#0ea5e9", icon: "Pl" },
  "automotive repair": { bg: "#1a0a0a", accent: "#ef4444", icon: "AR" },
  "forklift operation": { bg: "#1a150a", accent: "#d97706", icon: "Fk" },
  "default": { bg: "#0f0f1a", accent: "#818cf8", icon: "★" },
};

function getSkillVisual(skillName: string) {
  const key = skillName.toLowerCase();
  return SKILL_VISUALS[key] || SKILL_VISUALS["default"];
}

const PANEL_TO_CLUSTER: Record<PanelMode, string> = {
  code: "DEV", design: "DES", data: "DATA", bpo: "BPO",
  marketing: "MKT", finance: "FIN", admin: "VA", healthcare: "HC",
  sales: "SALES", education: "EDU", engineering: "ENG", trades: "TRADE",
  general: "DEV",
};

function getDifficultyLabel(d: string) {
  if (d === "beginner") return "Beginner Friendly";
  if (d === "intermediate") return "Intermediate";
  return "Advanced";
}

function getSkillDescription(skill: SkillROI, panelMode: PanelMode): string {
  const n = skill.estimatedNewMatches;
  const ind = skill.topIndustries[0] || "various industries";
  const descs: Record<PanelMode, string> = {
    code: `Build modern applications and systems. High demand in ${ind} with ${n}+ new job opportunities waiting.`,
    design: `Create compelling visual experiences and interfaces. Rapidly growing demand in ${ind} and creative sectors.`,
    data: `Transform raw data into actionable insights. Companies in ${ind} actively hiring analysts and data professionals.`,
    bpo: `Deliver exceptional customer experiences across channels. Essential skill for ${ind} with strong job growth.`,
    marketing: `Drive growth through strategic campaigns and content. ${ind} and digital-first companies are hiring fast.`,
    finance: `Manage financial operations with accuracy and insight. Critical skill across ${ind} and accounting firms.`,
    admin: `Streamline operations and boost team productivity. Versatile skill valued across ${ind} and remote teams.`,
    healthcare: `Support patient care and medical operations. High-demand skill in ${ind} with rewarding career paths.`,
    sales: `Close deals and build lasting client relationships. Revenue-driving skill sought by ${ind} employers.`,
    education: `Shape learning experiences and develop curricula. Growing opportunities in ${ind} and ed-tech platforms.`,
    engineering: `Design and build infrastructure and systems. Technical expertise in demand across ${ind} projects.`,
    trades: `Keep operations running with hands-on expertise. Practical skill with strong demand in ${ind}.`,
    general: `Valuable skill opening ${n}+ new roles. In demand across ${ind} — start learning to unlock opportunities.`,
  };
  return descs[panelMode];
}

/* ═══════════════════════════════════════
   Right-panel visual components
   ═══════════════════════════════════════ */

/* Code editor panel */
function CodeEditorPanel({ skill, accent }: { skill: SkillROI; accent: string }) {
  const safeName = skill.skill.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
  return (
    <div className="sb-editor">
      <div className="sb-editor-header">
        <span className="sb-editor-dot" style={{ background: "#ff5f57" }} />
        <span className="sb-editor-dot" style={{ background: "#febc2e" }} />
        <span className="sb-editor-dot" style={{ background: "#28c840" }} />
        <span className="sb-editor-title">learn_{safeName}.ts</span>
      </div>
      <div className="sb-editor-body">
        <span className="sb-code-line sb-code-comment">{"// Your next skill path"}</span>
        <span className="sb-code-line">&nbsp;</span>
        <span className="sb-code-line">
          <span className="sb-code-keyword">{"const "}</span>
          <span className="sb-code-const">nextSkill</span>
          <span className="sb-code-punct">{" = {"}</span>
        </span>
        <span className="sb-code-line">
          <span className="sb-code-punct">{"  "}</span>
          <span className="sb-code-prop">name</span>
          <span className="sb-code-punct">{": "}</span>
          <span className="sb-code-string">{`"${skill.skill}"`}</span>
          <span className="sb-code-punct">{","}</span>
        </span>
        <span className="sb-code-line">
          <span className="sb-code-punct">{"  "}</span>
          <span className="sb-code-prop">demand</span>
          <span className="sb-code-punct">{": "}</span>
          <span className="sb-code-string">{`"high"`}</span>
          <span className="sb-code-punct">{","}</span>
        </span>
        <span className="sb-code-line">
          <span className="sb-code-punct">{"  "}</span>
          <span className="sb-code-prop">newJobs</span>
          <span className="sb-code-punct">{": "}</span>
          <span className="sb-code-number">+{skill.estimatedNewMatches}</span>
          <span className="sb-code-punct">{","}</span>
        </span>
        <span className="sb-code-line sb-code-punct">{"};"}
        </span>
        <span className="sb-code-line">&nbsp;</span>
        <span className="sb-code-line sb-code-comment">{"// Start your journey →"}</span>
      </div>
    </div>
  );
}

/* Design canvas panel */
function DesignCanvasPanel({ skill, accent }: { skill: SkillROI; accent: string }) {
  return (
    <div className="sb-editor">
      <div className="sb-editor-header">
        <span className="sb-editor-dot" style={{ background: "#ff5f57" }} />
        <span className="sb-editor-dot" style={{ background: "#febc2e" }} />
        <span className="sb-editor-dot" style={{ background: "#28c840" }} />
        <span className="sb-editor-title">Artboard — {skill.skill}</span>
      </div>
      <div className="sb-canvas-body">
        {/* Mini artboard */}
        <div className="sb-canvas-artboard">
          {/* Abstract design shapes */}
          <div
            className="sb-canvas-shape sb-canvas-shape--circle"
            style={{ background: accent, top: "18%", left: "15%", width: 52, height: 52 }}
          />
          <div
            className="sb-canvas-shape sb-canvas-shape--rect"
            style={{ background: `${accent}50`, top: "30%", right: "18%", width: 72, height: 44, borderRadius: 8 }}
          />
          <div
            className="sb-canvas-shape sb-canvas-shape--rect"
            style={{ background: `${accent}30`, bottom: "20%", left: "25%", width: 90, height: 28, borderRadius: 6 }}
          />
          <div
            className="sb-canvas-shape sb-canvas-shape--circle"
            style={{ background: `${accent}40`, bottom: "15%", right: "22%", width: 36, height: 36 }}
          />
          {/* Crosshair guides */}
          <div className="sb-canvas-guide sb-canvas-guide--h" style={{ top: "50%" }} />
          <div className="sb-canvas-guide sb-canvas-guide--v" style={{ left: "50%" }} />
        </div>
        {/* Mini layers panel */}
        <div className="sb-canvas-layers">
          <div className="sb-canvas-layers-title">Layers</div>
          {["Shape 1", "Rectangle", "Text Block", "Background"].map((layer, i) => (
            <div key={layer} className="sb-canvas-layer">
              <span
                className="sb-canvas-layer-dot"
                style={{ background: i === 0 ? accent : "rgba(255,255,255,0.2)" }}
              />
              <span className="sb-canvas-layer-name">{layer}</span>
              <svg className="sb-canvas-layer-eye" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z" />
                <circle cx="8" cy="8" r="2" />
              </svg>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* Data / analytics dashboard panel */
function DataDashboardPanel({ skill, accent }: { skill: SkillROI; accent: string }) {
  const barData = [65, 82, 48, 91, 73, 58, 86];
  const maxBar = Math.max(...barData);
  return (
    <div className="sb-editor">
      <div className="sb-editor-header">
        <span className="sb-editor-dot" style={{ background: "#ff5f57" }} />
        <span className="sb-editor-dot" style={{ background: "#febc2e" }} />
        <span className="sb-editor-dot" style={{ background: "#28c840" }} />
        <span className="sb-editor-title">Analytics — {skill.skill}</span>
      </div>
      <div className="sb-data-body">
        {/* Mini metric cards */}
        <div className="sb-data-metrics">
          <div className="sb-data-metric">
            <span className="sb-data-metric-value" style={{ color: accent }}>
              +{skill.estimatedNewMatches}
            </span>
            <span className="sb-data-metric-label">New Jobs</span>
          </div>
          <div className="sb-data-metric">
            <span className="sb-data-metric-value" style={{ color: accent }}>
              {skill.jobsRequiring}
            </span>
            <span className="sb-data-metric-label">Total Demand</span>
          </div>
        </div>
        {/* Mini bar chart */}
        <div className="sb-data-chart">
          <div className="sb-data-chart-label">Weekly Demand Trend</div>
          <div className="sb-data-bars">
            {barData.map((val, i) => (
              <div key={i} className="sb-data-bar-wrap">
                <div
                  className="sb-data-bar"
                  style={{
                    height: `${(val / maxBar) * 100}%`,
                    background: i === barData.length - 1 ? accent : `${accent}50`,
                  }}
                />
              </div>
            ))}
          </div>
          <div className="sb-data-chart-axis">
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
              <span key={i}>{d}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* General / skills panel — career tracker with donut ring + checklist */
function GeneralSkillPanel({ skill, accent }: { skill: SkillROI; accent: string }) {
  const industries = skill.topIndustries.slice(0, 3);
  const progress = Math.min(Math.round((skill.estimatedNewMatches / 8) * 100), 82);
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const steps = [
    { label: "Learn fundamentals", done: true },
    { label: "Build portfolio", done: true },
    { label: `Unlock ${skill.estimatedNewMatches}+ new roles`, done: false },
  ];

  return (
    <div className="sb-editor">
      <div className="sb-editor-header">
        <span className="sb-editor-dot" style={{ background: "#ff5f57" }} />
        <span className="sb-editor-dot" style={{ background: "#febc2e" }} />
        <span className="sb-editor-dot" style={{ background: "#28c840" }} />
        <span className="sb-editor-title">Career Tracker</span>
      </div>
      <div className="sb-general-workspace">
        {/* Mini sidebar */}
        <div className="sb-general-sidebar">
          <div className="sb-general-sidebar-icon sb-general-sidebar-icon--active" style={{ background: accent }} />
          <div className="sb-general-sidebar-icon" />
          <div className="sb-general-sidebar-icon" />
          <div className="sb-general-sidebar-icon" />
          <div className="sb-general-sidebar-spacer" />
          <div className="sb-general-sidebar-icon sb-general-sidebar-icon--sm" />
        </div>

        {/* Main content */}
        <div className="sb-general-main">
          {/* Donut ring + center stat */}
          <div className="sb-general-ring-area">
            <svg viewBox="0 0 84 84" className="sb-general-ring-svg">
              {/* Track */}
              <circle
                cx="42" cy="42" r={radius}
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="5"
              />
              {/* Progress arc */}
              <circle
                cx="42" cy="42" r={radius}
                fill="none"
                stroke={accent}
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                transform="rotate(-90 42 42)"
                className="sb-general-ring-progress"
              />
              {/* Glow copy */}
              <circle
                cx="42" cy="42" r={radius}
                fill="none"
                stroke={accent}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                transform="rotate(-90 42 42)"
                opacity="0.15"
                className="sb-general-ring-progress"
              />
            </svg>
            <div className="sb-general-ring-center">
              <span className="sb-general-ring-num" style={{ color: accent }}>
                +{skill.estimatedNewMatches}
              </span>
              <span className="sb-general-ring-label">new jobs</span>
            </div>
          </div>

          {/* Task checklist */}
          <div className="sb-general-steps">
            {steps.map((step, i) => (
              <div key={i} className={`sb-general-step ${step.done ? "sb-general-step--done" : ""}`}>
                <div
                  className="sb-general-step-check"
                  style={
                    step.done
                      ? { background: accent, borderColor: accent }
                      : { borderColor: `${accent}50` }
                  }
                >
                  {step.done && (
                    <svg viewBox="0 0 12 12" width="10" height="10">
                      <path d="M2.5 6l2.5 2.5 4.5-5" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span className="sb-general-step-text">{step.label}</span>
              </div>
            ))}
          </div>

          {/* Industry pills */}
          <div className="sb-general-pills">
            {industries.map((ind, i) => (
              <span
                key={ind}
                className="sb-general-pill"
                style={{
                  borderColor: i === 0 ? `${accent}50` : `${accent}20`,
                  color: i === 0 ? accent : undefined,
                }}
              >
                {ind}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* BPO — Support Ticket Queue panel */
function BpoPanel({ skill, accent }: { skill: SkillROI; accent: string }) {
  const tickets = [
    { status: "#28c840", subject: "Billing inquiry — refund", time: "2m" },
    { status: "#febc2e", subject: "Login issue — pwd reset", time: "5m" },
    { status: "#ff5f57", subject: "Service outage — escalated", time: "12m" },
  ];
  return (
    <div className="sb-editor">
      <div className="sb-editor-header">
        <span className="sb-editor-dot" style={{ background: "#ff5f57" }} />
        <span className="sb-editor-dot" style={{ background: "#febc2e" }} />
        <span className="sb-editor-dot" style={{ background: "#28c840" }} />
        <span className="sb-editor-title">Support Queue</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: 14, flex: 1 }}>
        {/* Queue header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
          <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "rgba(255,255,255,0.4)" }}>
            Active Tickets
          </span>
          <span style={{ fontSize: 9, fontWeight: 600, color: accent, background: `${accent}18`, padding: "2px 8px", borderRadius: 10 }}>
            3 open
          </span>
        </div>
        {/* Ticket rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {tickets.map((t, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "7px 10px",
                borderRadius: 8,
                background: i === 0 ? `${accent}12` : "rgba(255,255,255,0.05)",
                border: i === 0 ? `1px solid ${accent}25` : "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: t.status, flexShrink: 0, boxShadow: `0 0 6px ${t.status}60` }} />
              <span style={{ flex: 1, fontSize: 10.5, fontWeight: 500, color: "rgba(255,255,255,0.75)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>
                {t.subject}
              </span>
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", flexShrink: 0 }}>{t.time}</span>
            </div>
          ))}
        </div>
        {/* Live chat snippet */}
        <div style={{ marginTop: "auto", paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", gap: 5 }}>
          <span style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.06em", color: "rgba(255,255,255,0.3)", marginBottom: 1 }}>
            Live Chat
          </span>
          <div style={{ background: "rgba(255,255,255,0.06)", padding: "6px 10px", borderRadius: "10px 10px 10px 3px", fontSize: 10, color: "rgba(255,255,255,0.55)", lineHeight: 1.4, maxWidth: "88%" }}>
            Hi, I need help with my account...
          </div>
          <div style={{ background: `${accent}15`, padding: "6px 10px", borderRadius: "10px 10px 3px 10px", borderLeft: `2px solid ${accent}`, fontSize: 10, color: "rgba(255,255,255,0.8)", lineHeight: 1.4, maxWidth: "88%", alignSelf: "flex-end" }}>
            Of course! Let me look into that.
          </div>
        </div>
      </div>
    </div>
  );
}

/* Marketing — Campaign Dashboard panel */
function MarketingPanel({ skill, accent }: { skill: SkillROI; accent: string }) {
  const platforms = [
    { letter: "f", color: "#1877f2", reach: "12.4K" },
    { letter: "ig", color: "#e1306c", reach: "8.7K" },
    { letter: "tt", color: "#ff0050", reach: "23.1K" },
  ];
  const sparkline = [30, 45, 38, 62, 55, 78, 72];
  const max = Math.max(...sparkline);
  const h = 44;
  const w = 160;
  const points = sparkline.map((v, i) => `${(i / (sparkline.length - 1)) * w},${h - (v / max) * h}`).join(" ");
  const areaPoints = `0,${h} ${points} ${w},${h}`;

  const posts = [
    { color: "#28c840", title: "Product launch post", time: "10:00 AM" },
    { color: "#febc2e", title: "Weekly newsletter", time: "2:00 PM" },
  ];

  return (
    <div className="sb-editor">
      <div className="sb-editor-header">
        <span className="sb-editor-dot" style={{ background: "#ff5f57" }} />
        <span className="sb-editor-dot" style={{ background: "#febc2e" }} />
        <span className="sb-editor-dot" style={{ background: "#28c840" }} />
        <span className="sb-editor-title">Campaign — {skill.skill}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: 14, flex: 1 }}>
        {/* Platform cards */}
        <div style={{ display: "flex", gap: 8 }}>
          {platforms.map((p) => (
            <div key={p.letter} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5, padding: "8px 4px", borderRadius: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: p.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "#fff", textTransform: "uppercase" as const }}>
                {p.letter}
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.8)" }}>{p.reach}</span>
            </div>
          ))}
        </div>
        {/* Sparkline chart */}
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <span style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.06em", color: "rgba(255,255,255,0.35)" }}>
            Engagement Trend
          </span>
          <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: 44 }}>
            <polygon points={areaPoints} fill={`${accent}20`} />
            <polyline points={points} fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            {/* End dot */}
            <circle cx={w} cy={h - (sparkline[sparkline.length - 1] / max) * h} r="3" fill={accent} />
            <circle cx={w} cy={h - (sparkline[sparkline.length - 1] / max) * h} r="6" fill={accent} opacity="0.2" />
          </svg>
        </div>
        {/* Scheduled posts */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: "auto" }}>
          <span style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.06em", color: "rgba(255,255,255,0.3)" }}>
            Scheduled
          </span>
          {posts.map((p, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 8px", borderRadius: 6, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: p.color, flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 10, fontWeight: 500, color: "rgba(255,255,255,0.65)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{p.title}</span>
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", flexShrink: 0 }}>{p.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* Finance — Excel / Spreadsheet panel */
function FinancePanel({ skill, accent }: { skill: SkillROI; accent: string }) {
  const cols = ["A", "B", "C", "D"];
  const mono: React.CSSProperties = { fontFamily: "'SF Mono', 'Fira Code', monospace", fontSize: 9.5 };
  const cellData: string[][] = [
    ["Item", "Amount", "Category", "Status"],
    ["Revenue Q1", "₱48,500", "Income", "Posted"],
    ["Payroll", "₱22,000", "Expense", "Posted"],
    ["Software", "₱4,200", "Expense", "Pending"],
    ["Revenue Q2", "₱52,100", "Income", "Draft"],
  ];
  // Selected cell: row 1, col 1 (the ₱48,500 cell)
  const selRow = 1;
  const selCol = 1;

  return (
    <div className="sb-editor">
      <div className="sb-editor-header">
        <span className="sb-editor-dot" style={{ background: "#ff5f57" }} />
        <span className="sb-editor-dot" style={{ background: "#febc2e" }} />
        <span className="sb-editor-dot" style={{ background: "#28c840" }} />
        <span className="sb-editor-title">Sheet — {skill.skill}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        {/* Formula bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <span style={{ ...mono, fontSize: 9, fontWeight: 700, color: accent, background: `${accent}18`, padding: "1px 6px", borderRadius: 3, minWidth: 22, textAlign: "center" }}>B2</span>
          <span style={{ ...mono, fontSize: 9, fontWeight: 500, color: "rgba(255,255,255,0.4)" }}>fx</span>
          <span style={{ ...mono, fontSize: 9.5, color: "rgba(255,255,255,0.7)" }}>=SUM(B2:B5)</span>
        </div>
        {/* Column letters header */}
        <div style={{ display: "grid", gridTemplateColumns: "22px repeat(4, 1fr)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          {/* Empty corner */}
          <div style={{ background: "rgba(255,255,255,0.04)" }} />
          {cols.map((c, ci) => (
            <div key={c} style={{
              padding: "3px 0", textAlign: "center", fontSize: 9, fontWeight: 700,
              color: ci === selCol ? accent : "rgba(255,255,255,0.35)",
              background: ci === selCol ? `${accent}10` : "rgba(255,255,255,0.04)",
              borderLeft: "1px solid rgba(255,255,255,0.04)",
            }}>
              {c}
            </div>
          ))}
        </div>
        {/* Data grid */}
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          {cellData.map((row, ri) => (
            <div key={ri} style={{ display: "grid", gridTemplateColumns: "22px repeat(4, 1fr)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              {/* Row number */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 9, fontWeight: 600,
                color: ri === selRow ? accent : "rgba(255,255,255,0.3)",
                background: ri === selRow ? `${accent}10` : "rgba(255,255,255,0.03)",
                borderRight: "1px solid rgba(255,255,255,0.06)",
              }}>
                {ri + 1}
              </div>
              {/* Cells */}
              {row.map((cell, ci) => {
                const isSelected = ri === selRow && ci === selCol;
                const isHeader = ri === 0;
                // Color amounts
                let cellColor = "rgba(255,255,255,0.6)";
                if (isHeader) cellColor = "rgba(255,255,255,0.5)";
                else if (ci === 1 && cell.includes("₱")) cellColor = accent;
                else if (ci === 3 && cell === "Posted") cellColor = "#4ade80";
                else if (ci === 3 && cell === "Pending") cellColor = "#fbbf24";
                else if (ci === 3 && cell === "Draft") cellColor = "rgba(255,255,255,0.35)";

                return (
                  <div key={ci} style={{
                    padding: "5px 6px", ...mono,
                    fontSize: isHeader ? 9 : 9.5,
                    fontWeight: isHeader ? 700 : 500,
                    color: cellColor,
                    textTransform: isHeader ? "uppercase" as const : "none" as const,
                    letterSpacing: isHeader ? "0.04em" : "normal",
                    borderLeft: "1px solid rgba(255,255,255,0.04)",
                    background: isSelected ? `${accent}12` : "transparent",
                    outline: isSelected ? `1.5px solid ${accent}` : "none",
                    outlineOffset: -1,
                    overflow: "hidden", whiteSpace: "nowrap" as const, textOverflow: "ellipsis",
                  }}>
                    {cell}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        {/* Bottom status bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 10px", background: "rgba(255,255,255,0.03)", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <span style={{ ...mono, fontSize: 8.5, color: "rgba(255,255,255,0.3)" }}>Sheet1</span>
          <div style={{ display: "flex", gap: 12 }}>
            <span style={{ ...mono, fontSize: 8.5, color: "rgba(255,255,255,0.35)" }}>SUM: <span style={{ color: accent, fontWeight: 700 }}>₱74,400</span></span>
            <span style={{ ...mono, fontSize: 8.5, color: "rgba(255,255,255,0.35)" }}>AVG: <span style={{ color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>₱31,700</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Admin — Workspace Manager panel */
function AdminPanel({ skill, accent }: { skill: SkillROI; accent: string }) {
  const days = ["M", "T", "W", "T", "F"];
  const events: { col: number; row: number; label: string; color: string }[] = [
    { col: 0, row: 0, label: "Standup", color: accent },
    { col: 2, row: 1, label: "Review", color: "#f59e0b" },
    { col: 3, row: 0, label: "Workshop", color: "#8b5cf6" },
  ];
  const tasks = [
    { label: "Update project brief", done: true },
    { label: "Send meeting notes", done: true },
    { label: "Prepare Q2 report", done: false },
  ];
  return (
    <div className="sb-editor">
      <div className="sb-editor-header">
        <span className="sb-editor-dot" style={{ background: "#ff5f57" }} />
        <span className="sb-editor-dot" style={{ background: "#febc2e" }} />
        <span className="sb-editor-dot" style={{ background: "#28c840" }} />
        <span className="sb-editor-title">Workspace — Productivity</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: 14, flex: 1 }}>
        {/* Calendar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Day headers */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 3 }}>
            {days.map((d, i) => (
              <span key={i} style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.4)", textAlign: "center", padding: "2px 0" }}>{d}</span>
            ))}
          </div>
          {/* Calendar grid */}
          {[0, 1, 2].map((row) => (
            <div key={row} style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 3 }}>
              {days.map((_, col) => {
                const evt = events.find((e) => e.col === col && e.row === row);
                return (
                  <div key={col} style={{ minHeight: 24, borderRadius: 4, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.04)" }}>
                    {evt && (
                      <div style={{ fontSize: 8, fontWeight: 600, padding: "3px 4px", borderRadius: 4, color: "rgba(255,255,255,0.85)", background: `${evt.color}25`, borderLeft: `2px solid ${evt.color}`, height: "100%", display: "flex", alignItems: "center", overflow: "hidden", whiteSpace: "nowrap" as const }}>
                        {evt.label}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        {/* Divider */}
        <div style={{ width: "100%", height: 1, background: "rgba(255,255,255,0.08)" }} />
        {/* Task list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: "auto" }}>
          {tasks.map((t, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 16, height: 16, borderRadius: 5, border: "1.5px solid",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                ...(t.done
                  ? { background: accent, borderColor: accent }
                  : { borderColor: `${accent}50`, background: "transparent" }
                ),
              }}>
                {t.done && (
                  <svg viewBox="0 0 12 12" width="10" height="10">
                    <path d="M2.5 6l2.5 2.5 4.5-5" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span style={{ fontSize: 10.5, color: t.done ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.75)", textDecoration: t.done ? "line-through" : "none", fontWeight: 500 }}>
                {t.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* Healthcare — Patient Chart / EHR panel */
function HealthcarePanel({ skill, accent }: { skill: SkillROI; accent: string }) {
  const vitals = [
    { label: "HR", value: "72", unit: "bpm" },
    { label: "Temp", value: "36.8", unit: "°C" },
    { label: "BP", value: "120/80", unit: "" },
  ];
  const records = [
    { label: "Lab Results", detail: "CBC — Normal", dotColor: "#28c840" },
    { label: "Prescription", detail: "Amoxicillin 500mg", dotColor: accent },
    { label: "Vitals Log", detail: "Updated 2h ago", dotColor: "#febc2e" },
  ];
  const ecgPath = "M0,20 L20,20 L25,20 L30,8 L35,32 L40,4 L45,36 L50,20 L55,20 L75,20 L80,20 L85,8 L90,32 L95,4 L100,36 L105,20 L110,20 L130,20 L150,20";

  return (
    <div className="sb-editor">
      <div className="sb-editor-header">
        <span className="sb-editor-dot" style={{ background: "#ff5f57" }} />
        <span className="sb-editor-dot" style={{ background: "#febc2e" }} />
        <span className="sb-editor-dot" style={{ background: "#28c840" }} />
        <span className="sb-editor-title">Patient Chart — EHR</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: 14, flex: 1 }}>
        {/* Vitals cards */}
        <div style={{ display: "flex", gap: 6 }}>
          {vitals.map((v) => (
            <div key={v.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "8px 6px", borderRadius: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <span style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" as const }}>{v.label}</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: accent, fontFamily: "'SF Mono', 'Fira Code', monospace", lineHeight: 1 }}>{v.value}</span>
              {v.unit && <span style={{ fontSize: 8, color: "rgba(255,255,255,0.3)" }}>{v.unit}</span>}
            </div>
          ))}
        </div>
        {/* ECG line */}
        <div style={{ padding: "2px 0" }}>
          <svg viewBox="0 0 150 40" style={{ width: "100%", height: 40 }} preserveAspectRatio="none">
            <path d={ecgPath} fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d={ecgPath} fill="none" stroke={accent} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" opacity="0.12" />
          </svg>
        </div>
        {/* Record entries */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: "auto" }}>
          {records.map((r) => (
            <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 8px", borderRadius: 7, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: r.dotColor, flexShrink: 0 }} />
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: 10.5, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>{r.label}</span>
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>{r.detail}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* Sales — CRM Pipeline panel */
function SalesPanel({ skill, accent }: { skill: SkillROI; accent: string }) {
  const columns = [
    {
      title: "Leads",
      deals: [
        { initials: "AC", name: "Acme Corp", amount: "₱45K" },
        { initials: "BT", name: "BlueTech", amount: "₱28K" },
      ],
    },
    {
      title: "Qualified",
      deals: [
        { initials: "GS", name: "GlobalSoft", amount: "₱62K" },
      ],
    },
    {
      title: "Won",
      deals: [
        { initials: "NX", name: "NexGen", amount: "₱85K" },
      ],
    },
  ];
  const totalWon = 85;
  const totalPipeline = 85 + 62 + 45 + 28;
  const winRate = Math.round((totalWon / totalPipeline) * 100);

  return (
    <div className="sb-editor">
      <div className="sb-editor-header">
        <span className="sb-editor-dot" style={{ background: "#ff5f57" }} />
        <span className="sb-editor-dot" style={{ background: "#febc2e" }} />
        <span className="sb-editor-dot" style={{ background: "#28c840" }} />
        <span className="sb-editor-title">Pipeline — CRM</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: 14, flex: 1 }}>
        {/* Kanban columns */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, flex: 1 }}>
          {columns.map((col, ci) => (
            <div key={col.title} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {/* Column header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 4, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.06em", color: ci === 2 ? "#4ade80" : "rgba(255,255,255,0.5)" }}>{col.title}</span>
                <span style={{ fontSize: 8, padding: "1px 6px", borderRadius: 10, background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" }}>{col.deals.length}</span>
              </div>
              {/* Deal cards */}
              {col.deals.map((deal) => (
                <div key={deal.initials} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 6px", borderRadius: 7, background: "rgba(255,255,255,0.05)", borderWidth: "1px 1px 1px 3px", borderStyle: "solid", borderColor: `rgba(255,255,255,0.06) rgba(255,255,255,0.06) rgba(255,255,255,0.06) ${ci === 2 ? "#28c840" : accent}` }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: `${accent}25`, color: accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 800, flexShrink: 0 }}>
                    {deal.initials}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                    <span style={{ fontSize: 9.5, fontWeight: 600, color: "rgba(255,255,255,0.75)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{deal.name}</span>
                    <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", fontFamily: "'SF Mono', 'Fira Code', monospace" }}>{deal.amount}</span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
        {/* Win rate bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: "auto", paddingTop: 6, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <span style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.05em", color: "rgba(255,255,255,0.4)", flexShrink: 0 }}>Win Rate</span>
          <div style={{ flex: 1, height: 5, borderRadius: 3, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
            <div style={{ width: `${winRate}%`, height: "100%", borderRadius: 3, background: accent, transition: "width 0.6s ease" }} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 800, color: accent, fontFamily: "'SF Mono', 'Fira Code', monospace", flexShrink: 0 }}>{winRate}%</span>
        </div>
      </div>
    </div>
  );
}

/* Education — LMS / Classroom panel */
function EducationPanel({ skill, accent }: { skill: SkillROI; accent: string }) {
  const modules = [
    { title: "Module 1: Introduction", progress: 100, students: 32 },
    { title: "Module 2: Core Concepts", progress: 68, students: 28 },
    { title: "Module 3: Application", progress: 20, students: 12 },
  ];
  return (
    <div className="sb-editor">
      <div className="sb-editor-header">
        <span className="sb-editor-dot" style={{ background: "#ff5f57" }} />
        <span className="sb-editor-dot" style={{ background: "#febc2e" }} />
        <span className="sb-editor-dot" style={{ background: "#28c840" }} />
        <span className="sb-editor-title">LMS — {skill.skill}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: 14, flex: 1 }}>
        {/* Course stats bar */}
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "6px 4px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: accent, lineHeight: 1 }}>32</span>
            <span style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" as const, fontWeight: 600 }}>Students</span>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "6px 4px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: "#4ade80", lineHeight: 1 }}>63%</span>
            <span style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" as const, fontWeight: 600 }}>Avg Score</span>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "6px 4px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: "#fbbf24", lineHeight: 1 }}>3</span>
            <span style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" as const, fontWeight: 600 }}>Modules</span>
          </div>
        </div>
        {/* Module list with progress */}
        <div style={{ display: "flex", flexDirection: "column", gap: 5, flex: 1 }}>
          <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.06em", color: "rgba(255,255,255,0.35)" }}>
            Course Modules
          </span>
          {modules.map((m, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: 4, padding: "7px 10px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.75)" }}>{m.title}</span>
                <span style={{ fontSize: 9, color: m.progress === 100 ? "#4ade80" : accent, fontWeight: 700 }}>{m.progress}%</span>
              </div>
              <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                <div style={{ width: `${m.progress}%`, height: "100%", borderRadius: 2, background: m.progress === 100 ? "#4ade80" : accent, transition: "width 0.6s ease" }} />
              </div>
              <span style={{ fontSize: 8.5, color: "rgba(255,255,255,0.3)" }}>{m.students} students enrolled</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* Engineering — CAD / Blueprint panel */
function EngineeringPanel({ skill, accent }: { skill: SkillROI; accent: string }) {
  return (
    <div className="sb-editor">
      <div className="sb-editor-header">
        <span className="sb-editor-dot" style={{ background: "#ff5f57" }} />
        <span className="sb-editor-dot" style={{ background: "#febc2e" }} />
        <span className="sb-editor-dot" style={{ background: "#28c840" }} />
        <span className="sb-editor-title">Blueprint — {skill.skill}</span>
      </div>
      <div style={{ display: "flex", flex: 1 }}>
        {/* Blueprint canvas */}
        <div style={{ flex: 1, position: "relative", background: `${accent}06`, overflow: "hidden" }}>
          {/* Grid lines */}
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            {/* Fine grid */}
            <defs>
              <pattern id="eng-fine" width="16" height="16" patternUnits="userSpaceOnUse">
                <path d="M 16 0 L 0 0 0 16" fill="none" stroke={`${accent}12`} strokeWidth="0.5" />
              </pattern>
              <pattern id="eng-coarse" width="64" height="64" patternUnits="userSpaceOnUse">
                <path d="M 64 0 L 0 0 0 64" fill="none" stroke={`${accent}20`} strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#eng-fine)" />
            <rect width="100%" height="100%" fill="url(#eng-coarse)" />
            {/* Floor plan shapes */}
            {/* Main structure */}
            <rect x="30" y="28" width="120" height="80" fill="none" stroke={accent} strokeWidth="1.5" opacity="0.7" />
            {/* Inner rooms */}
            <rect x="30" y="28" width="55" height="45" fill={`${accent}08`} stroke={accent} strokeWidth="1" opacity="0.5" />
            <rect x="85" y="28" width="65" height="45" fill={`${accent}05`} stroke={accent} strokeWidth="1" opacity="0.5" />
            <rect x="30" y="73" width="80" height="35" fill={`${accent}08`} stroke={accent} strokeWidth="1" opacity="0.5" />
            {/* Door arcs */}
            <path d="M 85 55 A 12 12 0 0 1 85 73" fill="none" stroke={accent} strokeWidth="0.8" opacity="0.6" strokeDasharray="2 1" />
            <path d="M 45 73 A 10 10 0 0 0 55 73" fill="none" stroke={accent} strokeWidth="0.8" opacity="0.6" strokeDasharray="2 1" />
            {/* Dimension lines */}
            <line x1="30" y1="118" x2="150" y2="118" stroke={accent} strokeWidth="0.6" opacity="0.5" />
            <line x1="30" y1="115" x2="30" y2="121" stroke={accent} strokeWidth="0.6" opacity="0.5" />
            <line x1="150" y1="115" x2="150" y2="121" stroke={accent} strokeWidth="0.6" opacity="0.5" />
            <text x="90" y="127" textAnchor="middle" fill={accent} fontSize="8" fontFamily="'SF Mono', monospace" opacity="0.6">12.0m</text>
            {/* Vertical dim */}
            <line x1="160" y1="28" x2="160" y2="108" stroke={accent} strokeWidth="0.6" opacity="0.5" />
            <line x1="157" y1="28" x2="163" y2="28" stroke={accent} strokeWidth="0.6" opacity="0.5" />
            <line x1="157" y1="108" x2="163" y2="108" stroke={accent} strokeWidth="0.6" opacity="0.5" />
            <text x="172" y="72" textAnchor="middle" fill={accent} fontSize="8" fontFamily="'SF Mono', monospace" opacity="0.6" transform="rotate(90 172 72)">8.0m</text>
          </svg>
        </div>
        {/* Side toolbar */}
        <div style={{ width: 42, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "10px 4px", background: "rgba(255,255,255,0.03)", borderLeft: "1px solid rgba(255,255,255,0.06)" }}>
          {/* Tool icons as mini squares */}
          {["□", "○", "╱", "⊞", "⌖", "↗"].map((icon, i) => (
            <div key={i} style={{
              width: 28, height: 24, borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, color: i === 0 ? accent : "rgba(255,255,255,0.35)",
              background: i === 0 ? `${accent}18` : "transparent",
              border: i === 0 ? `1px solid ${accent}30` : "1px solid transparent",
              cursor: "default",
            }}>
              {icon}
            </div>
          ))}
          <div style={{ flex: 1 }} />
          {/* Zoom indicator */}
          <span style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", fontFamily: "'SF Mono', monospace", fontWeight: 600 }}>75%</span>
        </div>
      </div>
    </div>
  );
}

/* Trades — Logistics / Shipment Tracker panel */
function TradesPanel({ skill, accent }: { skill: SkillROI; accent: string }) {
  const shipments = [
    { id: "SHP-1042", status: "In Transit", color: accent, progress: 65 },
    { id: "SHP-1041", status: "Delivered", color: "#28c840", progress: 100 },
    { id: "SHP-1040", status: "Loading", color: "#febc2e", progress: 25 },
  ];
  const stockItems = [
    { item: "Steel rods", qty: 240, max: 300 },
    { item: "Copper wire", qty: 82, max: 200 },
    { item: "PVC pipes", qty: 190, max: 200 },
  ];

  return (
    <div className="sb-editor">
      <div className="sb-editor-header">
        <span className="sb-editor-dot" style={{ background: "#ff5f57" }} />
        <span className="sb-editor-dot" style={{ background: "#febc2e" }} />
        <span className="sb-editor-dot" style={{ background: "#28c840" }} />
        <span className="sb-editor-title">Operations — {skill.skill}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: 14, flex: 1 }}>
        {/* Shipment tracker */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.06em", color: "rgba(255,255,255,0.35)" }}>
            Shipments
          </span>
          {shipments.map((s) => (
            <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", borderRadius: 7, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.5)", fontFamily: "'SF Mono', monospace", minWidth: 58 }}>{s.id}</span>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 9, fontWeight: 600, color: s.color }}>{s.status}</span>
                  <span style={{ fontSize: 8, color: "rgba(255,255,255,0.3)" }}>{s.progress}%</span>
                </div>
                <div style={{ height: 3, borderRadius: 2, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                  <div style={{ width: `${s.progress}%`, height: "100%", borderRadius: 2, background: s.color }} />
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Stock levels */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: "auto" }}>
          <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.06em", color: "rgba(255,255,255,0.35)" }}>
            Inventory
          </span>
          <div style={{ display: "flex", gap: 6 }}>
            {stockItems.map((s) => {
              const pct = Math.round((s.qty / s.max) * 100);
              const isLow = pct < 50;
              return (
                <div key={s.item} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "6px 4px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  {/* Circular progress */}
                  <svg viewBox="0 0 36 36" style={{ width: 32, height: 32 }}>
                    <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
                    <circle cx="18" cy="18" r="14" fill="none" stroke={isLow ? "#f59e0b" : accent} strokeWidth="3" strokeLinecap="round"
                      strokeDasharray={`${pct * 0.88} 88`} transform="rotate(-90 18 18)" />
                    <text x="18" y="20" textAnchor="middle" fill={isLow ? "#f59e0b" : accent} fontSize="9" fontWeight="800" fontFamily="'SF Mono', monospace">{pct}</text>
                  </svg>
                  <span style={{ fontSize: 8, color: "rgba(255,255,255,0.45)", fontWeight: 600, textAlign: "center", lineHeight: 1.2 }}>{s.item}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   Main component
   ═══════════════════════════════════════ */

export function SkillsRecommendationBanner({
  topSkills,
  animationDelay = 0,
  youtubeMaps,
}: SkillsRecommendationBannerProps) {
  const ytLookup = youtubeMaps ? createYoutubeLookup(youtubeMaps) : getYoutubeForSkill;
  const displaySkills = topSkills.slice(0, 5);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning || index === activeIndex) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveIndex(index);
      setTimeout(() => setIsTransitioning(false), 50);
    }, 200);
  }, [activeIndex, isTransitioning]);

  const goToNext = useCallback(() => {
    goToSlide((activeIndex + 1) % displaySkills.length);
  }, [activeIndex, displaySkills.length, goToSlide]);

  useEffect(() => {
    if (displaySkills.length <= 1 || isHovered) return;
    const interval = setInterval(goToNext, 5000);
    return () => clearInterval(interval);
  }, [displaySkills.length, isHovered, goToNext]);

  if (displaySkills.length === 0) return null;

  const currentSkill = displaySkills[activeIndex];
  const visual = getSkillVisual(currentSkill.skill);
  const panelMode = getPanelMode(currentSkill.skill);

  // Compute demand percentage
  const maxMatches = Math.max(...displaySkills.map((s) => s.estimatedNewMatches), 1);
  const demandPct = Math.min(Math.round((currentSkill.estimatedNewMatches / maxMatches) * 100), 100);

  const cssVars = {
    "--sb-accent": visual.accent,
    "--sb-bg": visual.bg,
  } as React.CSSProperties;

  return (
    <div
      className="sb-card"
      style={{
        ...cssVars,
        animation: `fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${animationDelay}s both`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="sb-noise" />
      <div className="sb-orb" />
      <div
        className="sb-grid-pattern"
        style={{
          backgroundImage: `linear-gradient(${visual.accent}0A 1px, transparent 1px), linear-gradient(90deg, ${visual.accent}0A 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="sb-content">
        {/* Left panel */}
        <div className={`sb-left ${isTransitioning ? "sb-left--transitioning" : "sb-left--visible"}`}>
          <div className="sb-header">
            <div className="sb-label">
              Skill to Learn
              <span className="sb-label-num">#{activeIndex + 1}</span>
            </div>
            {displaySkills.length > 1 && (
              <div className="sb-dots">
                {displaySkills.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goToSlide(i)}
                    className={`sb-dot ${i === activeIndex ? "sb-dot--active" : ""}`}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="sb-hero">
            <div className="sb-icon">{visual.icon}</div>
            <h2 className="sb-name">
              {currentSkill.recommendedCourse?.title ?? currentSkill.skill}
            </h2>
          </div>

          <p className="sb-desc">
            {getSkillDescription(currentSkill, panelMode)}
          </p>

          <div className="sb-stats">
            <span className="sb-stat sb-stat--accent">
              <span className="sb-stat-dot" />
              +{currentSkill.estimatedNewMatches} Jobs Unlocked
            </span>
            <span className="sb-stat">
              {getDifficultyLabel(currentSkill.difficulty)}
            </span>
            {currentSkill.topIndustries.slice(0, 2).map((ind) => (
              <span key={ind} className="sb-stat">{ind}</span>
            ))}
          </div>

          <div className="sb-progress">
            <div className="sb-progress-header">
              <span className="sb-progress-label">Industry Demand</span>
              <span className="sb-progress-value">{demandPct}%</span>
            </div>
            <div className="sb-progress-track">
              <div className="sb-progress-fill" style={{ width: `${demandPct}%` }} />
            </div>
          </div>

          <div className="sb-actions">
            {currentSkill.recommendedCourse ? (
              <a
                href={currentSkill.recommendedCourse.url}
                target="_blank"
                rel="noopener noreferrer"
                className="sb-cta"
              >
                Learn on {currentSkill.recommendedCourse.provider}
                <ArrowUpRight size={16} weight="bold" />
              </a>
            ) : (
              <Link href="/learn" className="sb-cta">
                Start Learning
                <ArrowUpRight size={16} weight="bold" />
              </Link>
            )}
            {(() => {
              const yt = ytLookup(currentSkill.skill, PANEL_TO_CLUSTER[panelMode]);
              return yt ? (
                <a
                  href={yt.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sb-secondary"
                  style={{ display: "flex", alignItems: "center", gap: 6 }}
                >
                  <YoutubeLogo size={16} weight="fill" color="#FF0000" />
                  Watch on {yt.channel}
                </a>
              ) : (
                <Link href="/learn" className="sb-secondary">
                  View All Skills
                </Link>
              );
            })()}
          </div>
        </div>

        {/* Right panel — adapts per skill category */}
        {panelMode === "code" && (
          <CodeEditorPanel skill={currentSkill} accent={visual.accent} />
        )}
        {panelMode === "design" && (
          <DesignCanvasPanel skill={currentSkill} accent={visual.accent} />
        )}
        {panelMode === "data" && (
          <DataDashboardPanel skill={currentSkill} accent={visual.accent} />
        )}
        {panelMode === "bpo" && (
          <BpoPanel skill={currentSkill} accent={visual.accent} />
        )}
        {panelMode === "marketing" && (
          <MarketingPanel skill={currentSkill} accent={visual.accent} />
        )}
        {panelMode === "finance" && (
          <FinancePanel skill={currentSkill} accent={visual.accent} />
        )}
        {panelMode === "admin" && (
          <AdminPanel skill={currentSkill} accent={visual.accent} />
        )}
        {panelMode === "healthcare" && (
          <HealthcarePanel skill={currentSkill} accent={visual.accent} />
        )}
        {panelMode === "sales" && (
          <SalesPanel skill={currentSkill} accent={visual.accent} />
        )}
        {panelMode === "education" && (
          <EducationPanel skill={currentSkill} accent={visual.accent} />
        )}
        {panelMode === "engineering" && (
          <EngineeringPanel skill={currentSkill} accent={visual.accent} />
        )}
        {panelMode === "trades" && (
          <TradesPanel skill={currentSkill} accent={visual.accent} />
        )}
        {panelMode === "general" && (
          <GeneralSkillPanel skill={currentSkill} accent={visual.accent} />
        )}
      </div>

      <div
        className="sb-accent-line"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${visual.accent} 50%, transparent 100%)`,
        }}
      />
    </div>
  );
}
