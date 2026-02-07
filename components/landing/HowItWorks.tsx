import { ScrollReveal } from "./ScrollReveal";

const steps = [
  {
    num: "01",
    icon: "\u270C\uFE0F",
    title: "Pick your skills",
    desc: "Tap what you know. No resume uploads, no 20-field forms, no existential crisis required.",
    time: "15 seconds",
  },
  {
    num: "02",
    icon: "\uD83C\uDFAF",
    title: "Tell us what you want",
    desc: "Remote? On-site? Salary range? Dream company? All optional. Change your mind anytime.",
    time: "20 seconds",
  },
  {
    num: "03",
    icon: "\uD83D\uDCCA",
    title: "See your score (try not to screenshot it)",
    desc: "We score you against thousands of jobs and show your top matches. Most people share their score within 5 minutes.",
    time: "Instant",
  },
];

export function HowItWorks() {
  return (
    <section className="lp-section" id="how">
      <div className="lp-section-inner">
        <ScrollReveal>
          <div className="lp-section-label">{"// embarrassingly easy"}</div>
          <div className="lp-section-title">
            Three steps. Under a minute. No, really.
          </div>
          <div className="lp-section-sub">
            We timed it. Your ramen takes longer to cook than your bigmovv
            setup.
          </div>
          <div className="lp-steps-grid">
            {steps.map((s) => (
              <div key={s.num} className="lp-step-card">
                <div className="lp-step-num">{s.num}</div>
                <div className="lp-step-icon">{s.icon}</div>
                <div className="lp-step-title">{s.title}</div>
                <div className="lp-step-desc">{s.desc}</div>
                <div className="lp-step-time">{s.time}</div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
