"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserMenu } from "./UserMenu";

interface NavItem {
  label: string;
  href: string;
  shortLabel?: string;
  badge?: string;
}

const navItems: NavItem[] = [
  { label: "Home", href: "/home", shortLabel: "Home" },
  { label: "Explore", href: "/explore", shortLabel: "Exp" },
  { label: "Notifications", href: "/notifications", shortLabel: "Notif" },
  { label: "Learn", href: "/learn", shortLabel: "Learn" },
];

interface NavbarProps {
  fullName?: string;
  email?: string;
}

export function Navbar({ fullName, email }: NavbarProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  function isActive(href: string) {
    if (href === "/home") return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <nav
        style={{
          background: "#0A0A0A",
          color: "#F5F5F0",
          borderBottom: "3px solid #0A0A0A",
          display: "flex",
          alignItems: "stretch",
          height: 60,
        }}
      >
        {/* Brand */}
        <Link
          href="/home"
          className="nav-padding"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            paddingRight: 24,
            paddingLeft: 24,
            borderRight: "2px solid rgba(255,255,255,0.1)",
            flexShrink: 0,
            cursor: "pointer",
            textDecoration: "none",
            color: "#F5F5F0",
            transition: "opacity 0.15s",
          }}
        >
          <span
            style={{
              fontSize: 18,
              fontWeight: 800,
              letterSpacing: "-0.04em",
              fontStyle: "italic",
              color: "#F5F5F0",
            }}
          >
            bigmo
            <span style={{ color: "#FBBF24" }}>vv</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div
          className="nav-desktop-links"
          style={{
            alignItems: "stretch",
            flex: 1,
          }}
        >
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "0 20px",
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  fontWeight: 400,
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.06em",
                  color: active ? "#FBBF24" : "rgba(255,255,255,0.4)",
                  textDecoration: "none",
                  transition: "all 0.15s",
                  position: "relative",
                  borderRight: "1px solid rgba(255,255,255,0.06)",
                  background: active ? "rgba(251,191,36,0.05)" : "transparent",
                }}
              >
                {item.label}
                {item.badge && (
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      background: "#FBBF24",
                      color: "#0A0A0A",
                      padding: "2px 6px",
                      marginLeft: 8,
                      lineHeight: 1.2,
                    }}
                  >
                    {item.badge}
                  </span>
                )}
                {active && (
                  <span
                    style={{
                      position: "absolute",
                      bottom: -3,
                      left: 0,
                      width: "100%",
                      height: 3,
                      background: "#FBBF24",
                    }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right section */}
        <div
          style={{
            display: "flex",
            alignItems: "stretch",
            marginLeft: "auto",
            borderLeft: "2px solid rgba(255,255,255,0.1)",
          }}
        >
          {/* Search button */}
          <button
            className="nav-search"
            style={{
              alignItems: "center",
              padding: "0 16px",
              background: "transparent",
              border: "none",
              color: "rgba(255,255,255,0.4)",
              cursor: "pointer",
              transition: "all 0.15s",
              borderLeft: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </button>

          {/* Notifications */}
          <Link
            href="/notifications"
            style={{
              display: "flex",
              alignItems: "center",
              padding: "0 16px",
              background: "transparent",
              border: "none",
              color: "rgba(255,255,255,0.4)",
              cursor: "pointer",
              transition: "all 0.15s",
              borderLeft: "1px solid rgba(255,255,255,0.06)",
              textDecoration: "none",
              position: "relative",
            }}
          >
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 01-3.46 0" />
            </svg>
            <span
              style={{
                width: 6,
                height: 6,
                background: "#FBBF24",
                position: "absolute",
                top: 16,
                right: 14,
              }}
            />
          </Link>

          {/* Avatar / User Menu */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "0 16px",
              borderLeft: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {fullName && email ? (
              <UserMenu fullName={fullName} email={email} />
            ) : (
              <UserMenu fullName="" email="" />
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            className="nav-hamburger"
            style={{
              width: 60,
              height: 60,
              border: "none",
              borderLeft: "1px solid rgba(255,255,255,0.06)",
              background: menuOpen ? "rgba(255,255,255,0.04)" : "transparent",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              cursor: "pointer",
              padding: 0,
            }}
          >
            <span className="hamburger-line" />
            <span className="hamburger-line" />
            <span className="hamburger-line" />
          </button>
        </div>
      </nav>

      {/* Mobile dropdown menu */}
      <div className={`mobile-menu-dropdown nav-mobile-menu${menuOpen ? " open" : ""}`}>
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "14px 20px",
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                fontWeight: active ? 700 : 400,
                textTransform: "uppercase" as const,
                letterSpacing: "0.06em",
                color: active ? "#FBBF24" : "rgba(255,255,255,0.4)",
                background: active ? "rgba(251,191,36,0.05)" : "transparent",
                textDecoration: "none",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
