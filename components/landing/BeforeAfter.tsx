import { ScrollReveal } from "./ScrollReveal";

const XIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const CheckIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const withoutItems = [
  "Scroll through 500+ irrelevant listings daily",
  "Salary hidden until the interview \u2014 or never",
  "Apply to 40 jobs, hear back from 0",
  "No idea which skills to learn next",
  "Same generic results for everyone",
];

const withItems = [
  "32 matched jobs ranked by relevance to you",
  "Every job shows salary range in PHP upfront",
  "Apply to 5 high-match jobs, get 3 interviews",
  "Skills page shows exactly what to learn and why",
  "Feed personalized to your skills and preferences",
];

export function BeforeAfter() {
  return (
    <section className="lp-section" style={{ paddingTop: 0 }}>
      <div className="lp-section-inner">
        <ScrollReveal>
          <div className="lp-section-label">{"// the difference"}</div>
          <div className="lp-section-title">What changes when you switch</div>
          <div className="lp-section-sub">
            Same you. Same skills. Completely different experience.
          </div>
          <div className="lp-ba-grid">
            <div className="lp-ba-card lp-ba-card-old">
              <div className="lp-ba-label lp-ba-label-old">
                <XIcon /> Without bigmovv
              </div>
              <div className="lp-ba-title">Spray and pray</div>
              <div className="lp-ba-items">
                {withoutItems.map((item) => (
                  <div key={item} className="lp-ba-item">
                    <div className="lp-ba-icon lp-ba-icon-x"><XIcon /></div>
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="lp-ba-card lp-ba-card-new">
              <div className="lp-ba-label lp-ba-label-new">
                <CheckIcon /> With bigmovv
              </div>
              <div className="lp-ba-title" style={{ color: "#F5F5F0" }}>
                Apply with confidence
              </div>
              <div className="lp-ba-items">
                {withItems.map((item) => (
                  <div key={item} className="lp-ba-item">
                    <div className="lp-ba-icon lp-ba-icon-check"><CheckIcon /></div>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
