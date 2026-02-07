import { ScrollReveal } from "./ScrollReveal";

const steps = [
  {
    num: "01",
    icon: "\u270C\uFE0F",
    title: "Sign up & pick skills",
    desc: "Create an account and tap the skills you know. Takes literally 15 seconds.",
    time: "15 seconds",
  },
  {
    num: "02",
    icon: "\uD83C\uDFAF",
    title: "Set preferences",
    desc: "What roles do you want? Remote or on-site? Salary range? All optional.",
    time: "20 seconds",
  },
  {
    num: "03",
    icon: "\uD83C\uDF89",
    title: "Get matched instantly",
    desc: "We analyze thousands of jobs and show you the ones that actually fit.",
    time: "Instant",
  },
];

export function HowItWorks() {
  return (
    <section className="lp-section" id="how">
      <div className="lp-section-inner">
        <ScrollReveal>
          <div className="lp-section-label">{"// how it works"}</div>
          <div className="lp-section-title">Three steps. Under a minute.</div>
          <div className="lp-section-sub">
            No resume needed. No long forms. Just tell us what you know and what
            you want.
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
