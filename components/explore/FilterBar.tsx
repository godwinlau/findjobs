"use client";

import { useState } from "react";

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

  const dropdownStyle = (isActive: boolean): React.CSSProperties => ({
    flex: 1,
    minWidth: 0,
    padding: "10px 8px",
    fontSize: 10,
    fontWeight: 700,
    fontFamily: "var(--font-mono)",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    border: "none",
    background: "transparent",
    color: isActive ? "#FBBF24" : "#0A0A0A",
    cursor: "pointer",
    outline: "none",
    textAlign: "center",
    appearance: "none" as const,
    WebkitAppearance: "none" as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' fill='none'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23888' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 4px center",
    paddingRight: 20,
  });

  const sortStyle: React.CSSProperties = {
    padding: "8px 12px",
    paddingRight: 28,
    fontSize: 10,
    fontWeight: 700,
    fontFamily: "var(--font-mono)",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    border: "2px solid #0A0A0A",
    background: "transparent",
    color: "#0A0A0A",
    cursor: "pointer",
    outline: "none",
    appearance: "none" as const,
    WebkitAppearance: "none" as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' fill='none'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23888' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 10px center",
  };

  function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
    return (
      <button
        onClick={() => onChange(!checked)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "8px 14px",
          fontSize: 10,
          fontWeight: 700,
          fontFamily: "var(--font-mono)",
          textTransform: "uppercase" as const,
          letterSpacing: "0.04em",
          border: "2px solid #0A0A0A",
          background: checked ? "#0A0A0A" : "transparent",
          color: checked ? "#FBBF24" : "#0A0A0A",
          cursor: "pointer",
          transition: "all 0.15s ease",
        }}
      >
        {label}
      </button>
    );
  }

  return (
    <div style={{ marginBottom: 16 }}>
      {/* Row 1 — Primary filter dropdowns */}
      <div
        className="filter-bar-primary"
        style={{
          alignItems: "center",
          background: "#F5F5F0",
          border: "2px solid #0A0A0A",
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

        <span className="filter-bar-divider" style={{ width: 2, height: 20, background: "#0A0A0A", flexShrink: 0 }} />

        <select
          value={getParam("experienceLevel")}
          onChange={(e) => onFilterChange("experienceLevel", e.target.value)}
          style={dropdownStyle(!!getParam("experienceLevel"))}
        >
          {EXPERIENCE_LEVELS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <span className="filter-bar-divider" style={{ width: 2, height: 20, background: "#0A0A0A", flexShrink: 0 }} />

        <select
          value={getParam("jobType")}
          onChange={(e) => onFilterChange("jobType", e.target.value)}
          style={dropdownStyle(!!getParam("jobType"))}
        >
          {JOB_TYPES.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <span className="filter-bar-divider" style={{ width: 2, height: 20, background: "#0A0A0A", flexShrink: 0 }} />

        <select
          value={getParam("workSetup")}
          onChange={(e) => onFilterChange("workSetup", e.target.value)}
          style={dropdownStyle(!!getParam("workSetup"))}
        >
          {WORK_SETUPS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <span className="filter-bar-divider" style={{ width: 2, height: 20, background: "#0A0A0A", flexShrink: 0 }} />

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

        <span className="filter-bar-divider" style={{ width: 2, height: 20, background: "#0A0A0A", flexShrink: 0 }} />

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

      {/* Row 2 — Sort + toggle buttons */}
      <div
        className="responsive-gap-md"
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              fontFamily: "var(--font-mono)",
              textTransform: "uppercase" as const,
              letterSpacing: "0.04em",
              color: "#888",
            }}
          >
            Sort by
          </span>
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

        <span style={{ width: 2, height: 20, background: "#0A0A0A", flexShrink: 0 }} />

        <Toggle
          label="Remote"
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
          style={{
            padding: "8px 14px",
            fontSize: 10,
            fontWeight: 700,
            fontFamily: "var(--font-mono)",
            textTransform: "uppercase" as const,
            letterSpacing: "0.04em",
            border: "2px solid #0A0A0A",
            background: "transparent",
            color: "#0A0A0A",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 5,
            transition: "all 0.15s ease",
          }}
        >
          {showMore ? "Less filters" : "More filters"}
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ transform: showMore ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
            <path d="M1 1l4 4 4-4" stroke="#888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
            borderTop: "2px solid #0A0A0A",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                fontFamily: "var(--font-mono)",
                textTransform: "uppercase" as const,
                letterSpacing: "0.04em",
                color: "#888",
              }}
            >
              Salary range
            </span>
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
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                fontFamily: "var(--font-mono)",
                color: "#888",
              }}
            >
              –
            </span>
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
