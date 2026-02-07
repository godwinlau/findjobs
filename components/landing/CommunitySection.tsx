import { ScrollReveal } from "./ScrollReveal";
import { TestimonialsSection } from "./TestimonialsSection";

const stats = [
  { value: "12,400", label: "Job Seekers", yellow: true },
  { value: "3,200", label: "Hired This Year", yellow: false },
  { value: "89%", label: "Avg. Score", yellow: true },
  { value: "14 days", label: "Avg. Time to Hire", yellow: false },
];

const people = [
  { initials: "MA", name: "Maria A.", role: "Product Designer", loc: "Makati", skills: ["Figma", "UI", "UX"], stat: "hired", statText: "\u2713 Hired at Spotify", avatar: 1 },
  { initials: "JR", name: "Juan R.", role: "Frontend Developer", loc: "Cebu", skills: ["React", "TS", "Next.js"], stat: "hired", statText: "\u2713 Hired at Vercel", avatar: 2 },
  { initials: "KC", name: "KC D.", role: "Full-Stack Dev", loc: "Manila", skills: ["Node", "React", "AWS"], stat: "matched", statText: "Bigmovv: 92%", avatar: 3 },
  { initials: "AL", name: "Alyssa L.", role: "UX Researcher", loc: "Davao", skills: ["Research", "Figma"], stat: "hired", statText: "\u2713 Hired at Canva", avatar: 4 },
  { initials: "RM", name: "Rico M.", role: "Mobile Dev", loc: "Quezon City", skills: ["Flutter", "Dart", "Firebase"], stat: "matched", statText: "Bigmovv: 88%", avatar: 1 },
  { initials: "SG", name: "Sarah G.", role: "Shopify Dev", loc: "Iloilo", skills: ["Shopify", "Liquid", "CSS"], stat: "hired", statText: "\u2713 Hired at Stripe", avatar: 2 },
  { initials: "DT", name: "Dan T.", role: "Data Analyst", loc: "Taguig", skills: ["Python", "SQL", "Tableau"], stat: "active", statText: "Interviewing", avatar: 3 },
  { initials: "JP", name: "Joy P.", role: "Design Engineer", loc: "Pasig", skills: ["React", "CSS", "Figma"], stat: "matched", statText: "Bigmovv: 91%", avatar: 4 },
];

export function CommunitySection() {
  return (
    <section className="lp-section lp-section-dark">
      <div className="lp-section-inner">
        <ScrollReveal>
          <div className="lp-section-label">
            {"// receipts, not promises"}
          </div>
          <div className="lp-section-title" style={{ color: "#F5F5F0" }}>
            12,000+ Filipinos making moves. Big ones.
          </div>
          <div className="lp-section-sub">
            From Makati devs to Davao designers. Here&apos;s what happens when
            you stop scrolling and start scoring.
          </div>

          <div className="lp-proof-stats" style={{ marginBottom: 32 }}>
            {stats.map((s) => (
              <div
                key={s.label}
                className="lp-ps"
                style={{ borderColor: "rgba(255,255,255,.06)" }}
              >
                <div className={`lp-ps-val${s.yellow ? " lp-ps-val-y" : ""}`}>
                  {s.value}
                </div>
                <div className="lp-ps-label">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="lp-community-grid">
            {people.map((p) => (
              <div key={p.initials + p.name} className="lp-person">
                <div className={`lp-person-avatar lp-pa-${p.avatar}`}>
                  {p.initials}
                </div>
                <div className="lp-person-name">{p.name}</div>
                <div className="lp-person-role">{p.role}</div>
                <div className="lp-person-loc">
                  <span role="img" aria-label="location">
                    {"\uD83D\uDCCD"}
                  </span>{" "}
                  {p.loc}
                </div>
                <div className="lp-person-skills">
                  {p.skills.map((sk) => (
                    <span key={sk} className="lp-person-skill">
                      {sk}
                    </span>
                  ))}
                </div>
                <div className={`lp-person-stat lp-person-stat-${p.stat}`}>
                  {p.statText}
                </div>
              </div>
            ))}
          </div>

          <TestimonialsSection />
        </ScrollReveal>
      </div>
    </section>
  );
}
