"use client";

import Link from "next/link";

export function LandingNav() {
  return (
    <nav className="lp-nav">
      <div className="lp-nav-inner">
        <Link className="lp-nav-brand" href="/">
          <span className="lp-nav-wordmark">bigmo<span className="lp-nav-vv">vv</span></span>
        </Link>
        <div className="lp-nav-links">
          <a className="lp-nav-link" href="#how">
            How It Works
          </a>
          <a className="lp-nav-link" href="#features">
            Features
          </a>
          <Link className="lp-nav-signin" href="/login">
            Sign In
          </Link>
          <Link className="lp-nav-cta" href="/signup">
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}
