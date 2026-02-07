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
              style={{ color: "rgba(10,10,10,.55)" }}
            >
              {"// still scrolling? just sign up already"}
            </div>
            <div className="lp-final-title">
              32 jobs scored for you <span>today</span>
            </div>
            <div className="lp-final-sub">
              Free account. 60 seconds. No resume. No catch. Just your skills
              vs. the job market. Spoiler: you&apos;re doing better than you
              think.
            </div>
            <Link className="lp-final-btn" href="/signup">
              Make Your Bigmovv &rarr;
            </Link>
            <div className="lp-final-note">
              Free forever &middot; 2,400+ jobs &middot; 12K+ Filipinos already
              here
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
