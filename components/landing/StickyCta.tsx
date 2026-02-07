"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export function StickyCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      const hero = document.getElementById("heroSection");
      if (!hero) return;
      const heroBottom = hero.getBoundingClientRect().bottom;
      setVisible(heroBottom < -100);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className={`lp-sticky-cta${visible ? " lp-sticky-visible" : ""}`}>
      <div className="lp-sticky-inner">
        <div className="lp-sticky-text">
          <div className="lp-sticky-pulse" />
          <strong>32 jobs scored</strong>{" "}
          <span>for your skills right now</span>
        </div>
        <Link className="lp-sticky-btn" href="/signup">
          Make Your Move &rarr;
        </Link>
      </div>
    </div>
  );
}
