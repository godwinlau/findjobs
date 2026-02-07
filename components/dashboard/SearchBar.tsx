"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { colors } from "@/lib/constants/colors";

interface SearchBarProps {
  total: number;
  searchQuery: string;
  basePath?: string;
}

export function SearchBar({ total, searchQuery, basePath = "/home" }: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchQuery);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setValue(searchQuery);
  }, [searchQuery]);

  function pushQuery(q: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (q) {
      params.set("q", q);
    } else {
      params.delete("q");
    }
    params.delete("page");
    router.push(`${basePath}?${params.toString()}`);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.value;
    setValue(next);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => pushQuery(next), 350);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      if (timerRef.current) clearTimeout(timerRef.current);
      pushQuery(value);
    }
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ position: "relative" }}>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke={colors.textMuted}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            position: "absolute",
            left: 12,
            top: "50%",
            transform: "translateY(-50%)",
            pointerEvents: "none",
          }}
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Search jobs by title, company, or location..."
          style={{
            width: "100%",
            padding: "10px 12px 10px 36px",
            fontSize: 13,
            border: `1px solid ${colors.border}`,
            borderRadius: 8,
            background: colors.surface,
            color: colors.text,
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>
      {searchQuery && (
        <p
          style={{
            fontSize: 12,
            color: colors.textMuted,
            marginTop: 8,
          }}
        >
          {total} result{total !== 1 ? "s" : ""} for &ldquo;{searchQuery}&rdquo;
        </p>
      )}
    </div>
  );
}
