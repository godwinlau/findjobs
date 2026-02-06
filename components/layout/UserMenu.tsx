"use client";

import { useState, useRef, useEffect } from "react";
import { colors } from "@/lib/constants/colors";
import { Avatar } from "@/components/ui";

interface UserMenuProps {
  fullName: string;
  email: string;
}

export function UserMenu({ fullName, email }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const initials = fullName
    ? fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={menuRef} style={{ position: "relative" }}>
      <div onClick={() => setOpen(!open)}>
        <Avatar initials={initials} />
      </div>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 2px)",
            right: 0,
            width: 220,
            maxWidth: "calc(100vw - 32px)",
            background: "#0A0A0A",
            border: "2px solid #0A0A0A",
            boxShadow: "4px 4px 0 rgba(0,0,0,0.3)",
            zIndex: 100,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "12px 14px",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: "#F5F5F0", fontFamily: "var(--font-mono)", textTransform: "uppercase" as const }}>
              {fullName || "User"}
            </div>
            <div style={{ fontSize: 10, color: "rgba(245,245,240,0.4)", marginTop: 2, fontFamily: "var(--font-mono)" }}>
              {email}
            </div>
          </div>
          <a
            href="/profile"
            style={{
              display: "block",
              width: "100%",
              padding: "10px 14px",
              border: "none",
              background: "transparent",
              color: "rgba(245,245,240,0.6)",
              fontSize: 11,
              fontWeight: 700,
              fontFamily: "var(--font-mono)",
              textTransform: "uppercase" as const,
              letterSpacing: "0.04em",
              cursor: "pointer",
              textAlign: "left",
              textDecoration: "none",
              boxSizing: "border-box",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              transition: "all 0.15s",
            }}
          >
            Profile
          </a>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              style={{
                width: "100%",
                padding: "10px 14px",
                border: "none",
                background: "transparent",
                color: "#FBBF24",
                fontSize: 11,
                fontWeight: 700,
                fontFamily: "var(--font-mono)",
                textTransform: "uppercase" as const,
                letterSpacing: "0.04em",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
