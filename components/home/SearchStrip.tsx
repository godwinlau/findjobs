"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const QUICK_CHIPS = [
  { label: "Remote", param: "workSetup=remote" },
  { label: "Full-time", param: "jobType=full_time" },
  { label: "Entry Level", param: "experienceLevel=entry" },
];

export function SearchStrip() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/explore?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <div className="search-strip">
      <div className="search-strip-inner">
        <form className="search-bar" onSubmit={handleSearch}>
          <div className="search-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>
          <input
            className="search-input"
            type="text"
            placeholder="Search roles, skills, companies\u2026"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="search-btn" type="submit">Go</button>
        </form>
        <div className="search-chips">
          {QUICK_CHIPS.map((chip) => (
            <button
              key={chip.label}
              className="search-chip"
              onClick={() => router.push(`/explore?${chip.param}`)}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
