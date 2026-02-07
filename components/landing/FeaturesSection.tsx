import { ScrollReveal } from "./ScrollReveal";

const features = [
  {
    icon: "\uD83C\uDFAF",
    title: "Skill-Based Matching",
    desc: "We map your skills to job requirements and give you a real match percentage. 92% means 92%.",
    tag: "Core Feature",
  },
  {
    icon: "\uD83D\uDCB0",
    title: "Salary in PHP",
    desc: "Every job shows salary ranges in pesos. Plus market data so you know your worth before you apply.",
    tag: "Always Visible",
  },
  {
    icon: "\uD83D\uDCCA",
    title: "Skill Intelligence",
    desc: "See what skills the market wants, what you\u2019re missing, and exactly how many jobs they\u2019d unlock.",
    tag: "Unique to HanapBuhay",
  },
  {
    icon: "\uD83C\uDF0D",
    title: "Remote-First",
    desc: "62% of our jobs are remote. Filter by setup, see which companies truly hire from the Philippines.",
    tag: "62% Remote",
  },
  {
    icon: "\u26A1",
    title: "60-Second Setup",
    desc: "No resume upload. No 20-field forms. Pick skills, set preferences, see matches. Under a minute.",
    tag: "Zero Friction",
  },
  {
    icon: "\uD83C\uDDF5\uD83C\uDDED",
    title: "Built for Filipinos",
    desc: "PHP salaries, PH market data, roles popular here, companies that actually hire remotely from PH.",
    tag: "Local-First",
  },
];

export function FeaturesSection() {
  return (
    <section className="lp-section" id="features">
      <div className="lp-section-inner">
        <ScrollReveal>
          <div className="lp-section-label">{"// what you get"}</div>
          <div className="lp-section-title">Built different. On purpose.</div>
          <div className="lp-section-sub">
            Every feature exists because we asked: does this help someone get
            hired faster?
          </div>
          <div className="lp-feat-grid">
            {features.map((f) => (
              <div key={f.title} className="lp-feat">
                <div className="lp-feat-icon">{f.icon}</div>
                <div className="lp-feat-title">{f.title}</div>
                <div className="lp-feat-desc">{f.desc}</div>
                <div className="lp-feat-tag">{f.tag}</div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
