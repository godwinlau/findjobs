import Link from "next/link";
import { ScrollReveal } from "./ScrollReveal";

export function FinalCta() {
  return (
    <section className="lp-section lp-section-yellow">
      <div className="lp-section-inner">
        <ScrollReveal>
          <div className="lp-final-section">
            <div
              className="lp-section-label"
              style={{ color: "rgba(10,10,10,.25)" }}
            >
              {"// your next role is waiting"}
            </div>
            <div className="lp-final-title">
              32 new jobs posted <span>today</span>
            </div>
            <div className="lp-final-sub">
              Create your free account and see which ones match your skills.
              Takes 60 seconds.
            </div>
            <Link className="lp-final-btn" href="/signup">
              Get Matched Free &rarr;
            </Link>
            <div className="lp-final-note">
              Free forever &middot; 2,400+ jobs &middot; Loved by 12K+ Filipinos
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
