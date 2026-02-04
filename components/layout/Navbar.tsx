"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { colors } from "@/lib/constants/colors";
import { Logo } from "@/components/ui";
import { UserMenu } from "./UserMenu";

interface NavItem {
  label: string;
  href: string;
  dot?: boolean;
}

const jobSeekerNavItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Explore", href: "/explore" },
  { label: "Applications", href: "/applications", dot: true },
  { label: "Learn", href: "/learn" },
];

const employerNavItems: NavItem[] = [
  { label: "Dashboard", href: "/employer" },
  { label: "Post a Job", href: "/employer/post" },
];

interface NavbarProps {
  fullName?: string;
  email?: string;
  role?: "job_seeker" | "employer";
}

export function Navbar({ fullName, email, role = "job_seeker" }: NavbarProps) {
  const pathname = usePathname();
  const navItems = role === "employer" ? employerNavItems : jobSeekerNavItems;
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  function isActive(href: string) {
    if (href === "/" || href === "/employer") return pathname === href;
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
        className="nav-padding"
        style={{
          height: 52,
          borderBottom: `1px solid ${colors.border}`,
          background: colors.surface,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div className="nav-left-gap" style={{ display: "flex", alignItems: "center" }}>
          <Logo />
          <div className="nav-desktop-links" style={{ gap: 2 }}>
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 7,
                    fontSize: 13,
                    fontWeight: active ? 600 : 450,
                    border: "none",
                    cursor: "pointer",
                    background: active ? colors.surfaceAlt : "transparent",
                    color: active ? colors.text : colors.textSec,
                    position: "relative",
                    textDecoration: "none",
                  }}
                >
                  {item.label}
                  {item.dot && (
                    <span
                      style={{
                        position: "absolute",
                        top: 5,
                        right: 5,
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        background: colors.live,
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            className="nav-search"
            style={{
              padding: "6px 12px",
              borderRadius: 8,
              background: colors.surfaceAlt,
              border: `1px solid ${colors.border}`,
              fontSize: 12,
              color: colors.textMuted,
              width: 200,
              alignItems: "center",
              gap: 6,
            }}
          >
            <span style={{ fontSize: 11 }}>⌘K</span>
            <span>Search...</span>
          </div>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 7,
              border: `1px solid ${colors.border}`,
              background: colors.surface,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            🔔
          </div>
          {fullName && email ? (
            <UserMenu fullName={fullName} email={email} />
          ) : (
            <UserMenu fullName="" email="" />
          )}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            className="nav-hamburger"
            style={{
              width: 34,
              height: 34,
              borderRadius: 7,
              border: `1px solid ${colors.border}`,
              background: menuOpen ? colors.surfaceAlt : colors.surface,
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
                padding: "12px 16px",
                fontSize: 14,
                fontWeight: active ? 600 : 450,
                color: active ? colors.text : colors.textSec,
                background: active ? colors.surfaceAlt : "transparent",
                textDecoration: "none",
                borderBottom: `1px solid ${colors.border}`,
              }}
            >
              {item.label}
              {item.dot && (
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: colors.live,
                  }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
