"use client";

import { useState } from "react";
import { colors } from "@/lib/constants/colors";

interface FilterBarProps {
  locations: string[];
  hasProfile: boolean;
  filters: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
}

const WORK_SETUPS = [
  { value: "", label: "Work Setup" },
  { value: "onsite", label: "Onsite" },
  { value: "hybrid", label: "Hybrid" },
  { value: "remote", label: "Remote" },
];

const JOB_TYPES = [
  { value: "", label: "Employment Type" },
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "freelance", label: "Freelance" },
  { value: "internship", label: "Internship" },
];

const EXPERIENCE_LEVELS = [
  { value: "", label: "Job Level" },
  { value: "fresh_graduate", label: "Fresh Graduate" },
  { value: "entry", label: "Entry" },
  { value: "junior", label: "Junior" },
  { value: "mid", label: "Mid" },
  { value: "senior", label: "Senior" },
];

const SALARY_BRACKETS = [
  { value: "", label: "Salary" },
  { value: "10000", label: "₱10K" },
  { value: "15000", label: "₱15K" },
  { value: "20000", label: "₱20K" },
  { value: "25000", label: "₱25K" },
  { value: "30000", label: "₱30K" },
  { value: "40000", label: "₱40K" },
  { value: "50000", label: "₱50K" },
  { value: "70000", label: "₱70K" },
  { value: "100000", label: "₱100K" },
  { value: "150000", label: "₱150K+" },
];

const DATE_POSTED_OPTIONS = [
  { value: "", label: "Date Posted" },
  { value: "24h", label: "Last 24 hours" },
  { value: "3d", label: "Last 3 days" },
  { value: "7d", label: "Last week" },
  { value: "14d", label: "Last 2 weeks" },
  { value: "30d", label: "Last month" },
];

const SORT_OPTIONS = [
  { value: "recency", label: "Most Recent" },
  { value: "match", label: "Best Match" },
  { value: "salary_desc", label: "Salary: High → Low" },
  { value: "salary_asc", label: "Salary: Low → High" },
];

export function FilterBar({ locations, hasProfile, filters, onFilterChange }: FilterBarProps) {
  const [showMore, setShowMore] = useState(false);

  function getParam(key: string): string {
    return filters[key] || "";
  }

  // Borderless dropdown style (Kalibrr-style)
  const dropdownStyle = (isActive: boolean): React.CSSProperties => ({
    flex: 1,
    minWidth: 0,
    padding: "10px 4px",
    fontSize: 13,
    fontWeight: isActive ? 600 : 500,
    border: "none",
    background: "transparent",
    color: isActive ? colors.primary : colors.text,
    cursor: "pointer",
    outline: "none",
    textAlign: "center",
    appearance: "none" as const,
    WebkitAppearance: "none" as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' fill='none'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%239E9E96' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 4px center",
    paddingRight: 20,
  });

  // Pill sort dropdown
  const sortStyle: React.CSSProperties = {
    padding: "6px 12px",
    paddingRight: 26,
    fontSize: 12,
    fontWeight: 500,
    borderRadius: 20,
    border: `1px solid ${colors.border}`,
    background: colors.surface,
    color: colors.text,
    cursor: "pointer",
    outline: "none",
    appearance: "none" as const,
    WebkitAppearance: "none" as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' fill='none'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%239E9E96' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 10px center",
  };

  // Toggle switch style
  function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
    return (
      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          cursor: "pointer",
          fontSize: 13,
          fontWeight: 500,
          color: checked ? colors.text : colors.textSec,
          whiteSpace: "nowrap",
        }}
      >
        {label}
        <button
          role="switch"
          aria-checked={checked}
          onClick={(e) => { e.preventDefault(); onChange(!checked); }}
          style={{
            position: "relative",
            width: 36,
            height: 20,
            borderRadius: 10,
            border: "none",
            background: checked ? colors.primary : colors.border,
            cursor: "pointer",
            transition: "background 0.2s ease",
            flexShrink: 0,
            padding: 0,
          }}
        >
          <span
            style={{
              position: "absolute",
              top: 2,
              left: checked ? 18 : 2,
              width: 16,
              height: 16,
              borderRadius: "50%",
              background: "#fff",
              boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
              transition: "left 0.2s ease",
            }}
          />
        </button>
      </label>
    );
  }

  return (
    <div style={{ marginBottom: 16 }}>
      {/* Row 1 — Primary filter dropdowns (Kalibrr-style full-width bar) */}
      <div
        className="filter-bar-primary"
        style={{
          alignItems: "center",
          background: colors.surfaceAlt,
          borderRadius: 10,
          marginBottom: 10,
        }}
      >
        <select
          value={getParam("location")}
          onChange={(e) => onFilterChange("location", e.target.value)}
          style={dropdownStyle(!!getParam("location"))}
        >
          <option value="">Location</option>
          {locations.map((loc) => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>

        <span className="filter-bar-divider" style={{ width: 1, height: 20, background: colors.border, flexShrink: 0 }} />

        <select
          value={getParam("experienceLevel")}
          onChange={(e) => onFilterChange("experienceLevel", e.target.value)}
          style={dropdownStyle(!!getParam("experienceLevel"))}
        >
          {EXPERIENCE_LEVELS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <span className="filter-bar-divider" style={{ width: 1, height: 20, background: colors.border, flexShrink: 0 }} />

        <select
          value={getParam("jobType")}
          onChange={(e) => onFilterChange("jobType", e.target.value)}
          style={dropdownStyle(!!getParam("jobType"))}
        >
          {JOB_TYPES.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <span className="filter-bar-divider" style={{ width: 1, height: 20, background: colors.border, flexShrink: 0 }} />

        <select
          value={getParam("workSetup")}
          onChange={(e) => onFilterChange("workSetup", e.target.value)}
          style={dropdownStyle(!!getParam("workSetup"))}
        >
          {WORK_SETUPS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <span className="filter-bar-divider" style={{ width: 1, height: 20, background: colors.border, flexShrink: 0 }} />

        <select
          value={getParam("salaryMin") || getParam("salaryMax") ? `${getParam("salaryMin") || ""}-${getParam("salaryMax") || ""}` : ""}
          onChange={() => { /* handled by more filters */ }}
          onClick={() => setShowMore(true)}
          style={{ ...dropdownStyle(!!getParam("salaryMin") || !!getParam("salaryMax")), cursor: "pointer" }}
        >
          <option value="">Salary</option>
          {(getParam("salaryMin") || getParam("salaryMax")) && (
            <option value="active">
              {getParam("salaryMin") ? `₱${Number(getParam("salaryMin")) / 1000}K` : "Any"}
              {" – "}
              {getParam("salaryMax") ? `₱${Number(getParam("salaryMax")) / 1000}K` : "Any"}
            </option>
          )}
        </select>

        <span className="filter-bar-divider" style={{ width: 1, height: 20, background: colors.border, flexShrink: 0 }} />

        <select
          value={getParam("datePosted")}
          onChange={(e) => onFilterChange("datePosted", e.target.value)}
          style={dropdownStyle(!!getParam("datePosted"))}
        >
          {DATE_POSTED_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

      </div>

      {/* Row 2 — Sort + toggle switches */}
      <div
        className="responsive-gap-md"
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: colors.textSec }}>Sort by</span>
          <select
            value={getParam("sort") || "recency"}
            onChange={(e) => onFilterChange("sort", e.target.value === "recency" ? "" : e.target.value)}
            style={sortStyle}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <span style={{ width: 1, height: 20, background: colors.border, flexShrink: 0 }} />

        <Toggle
          label="Remote Work"
          checked={getParam("workSetup") === "remote"}
          onChange={(v) => onFilterChange("workSetup", v ? "remote" : "")}
        />

        <Toggle
          label="Verified"
          checked={getParam("verifiedOnly") === "true"}
          onChange={(v) => onFilterChange("verifiedOnly", v ? "true" : "")}
        />

        <Toggle
          label="Fresh Grads"
          checked={getParam("experienceLevel") === "fresh_graduate"}
          onChange={(v) => onFilterChange("experienceLevel", v ? "fresh_graduate" : "")}
        />

        <button
          onClick={() => setShowMore(!showMore)}
          className="more-filters-btn"
          style={{
            padding: "6px 14px",
            fontSize: 12,
            fontWeight: 500,
            borderRadius: 20,
            border: `1px solid ${colors.border}`,
            background: colors.surface,
            color: colors.textSec,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          {showMore ? "Less filters" : "More filters"}
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ transform: showMore ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
            <path d="M1 1l4 4 4-4" stroke={colors.textMuted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Row 3 — Expanded secondary filters */}
      {showMore && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
            marginTop: 12,
            paddingTop: 12,
            borderTop: `1px solid ${colors.border}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: colors.textSec }}>Salary range</span>
            <select
              value={getParam("salaryMin")}
              onChange={(e) => onFilterChange("salaryMin", e.target.value)}
              style={sortStyle}
            >
              <option value="">Min</option>
              {SALARY_BRACKETS.filter((o) => o.value).map((o) => (
                <option key={`min-${o.value}`} value={o.value}>{o.label}</option>
              ))}
            </select>
            <span style={{ fontSize: 12, color: colors.textMuted }}>–</span>
            <select
              value={getParam("salaryMax")}
              onChange={(e) => onFilterChange("salaryMax", e.target.value)}
              style={sortStyle}
            >
              <option value="">Max</option>
              {SALARY_BRACKETS.filter((o) => o.value).map((o) => (
                <option key={`max-${o.value}`} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
