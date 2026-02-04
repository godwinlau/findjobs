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
            top: "calc(100% + 6px)",
            right: 0,
            width: 220,
            maxWidth: "calc(100vw - 32px)",
            background: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: 10,
            boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
            zIndex: 100,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "12px 14px",
              borderBottom: `1px solid ${colors.border}`,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 600, color: colors.text }}>
              {fullName || "User"}
            </div>
            <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>
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
              color: colors.textSec,
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              textAlign: "left",
              textDecoration: "none",
              boxSizing: "border-box",
              borderBottom: `1px solid ${colors.border}`,
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
                color: colors.live,
                fontSize: 13,
                fontWeight: 500,
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
