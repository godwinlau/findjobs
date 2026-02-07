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
  "Scroll 500+ listings like it\u2019s a sad dating app",
  "Salary? \u201CCompetitive.\u201D (Translation: disappointing)",
  "Apply to 40 jobs, ghost of Christmas past at all 40",
  "No clue which skills would actually get you hired",
  "Same generic results for literally everyone alive",
];

const withItems = [
  "32 jobs scored and ranked \u2014 only the ones that actually want you",
  "Salary in PHP. Upfront. No awkward third-interview surprises",
  "Apply to 5 high-score jobs, get 3 interviews (real numbers)",
  "Skill gap shows you exactly what to learn and why it matters",
  "Your feed. Your skills. Your matches. Nobody else\u2019s.",
];

export function BeforeAfter() {
  return (
    <section className="lp-section" style={{ paddingTop: 0 }}>
      <div className="lp-section-inner">
        <ScrollReveal>
          <div className="lp-section-label">{"// the awkward truth"}</div>
          <div className="lp-section-title">
            Your current job search is broken
          </div>
          <div className="lp-section-sub">
            Don&apos;t take it personally. Every job platform just forgot to care
            about you. We remembered.
          </div>
          <div className="lp-ba-grid">
            <div className="lp-ba-card lp-ba-card-old">
              <div className="lp-ba-label lp-ba-label-old">
                <XIcon /> JobStreet vibes
              </div>
              <div className="lp-ba-title">
                Apply to everything, hear from nothing
              </div>
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
                Apply less. Land more. Know your worth.
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
