const testimonials = [
  {
    quote:
      "I was applying to 10+ jobs a day on other platforms. Here, I got 3 interviews from 5 applications. The match scores actually mean something.",
    name: "Maria A.",
    role: "Product Designer \u00B7 Makati",
    initials: "MA",
    avatar: 1,
  },
  {
    quote:
      "Finally a job platform that shows salaries upfront in pesos. No more guessing. The skill gap feature told me to learn TypeScript \u2014 got hired 3 weeks later.",
    name: "KC D.",
    role: "Full-Stack Dev \u00B7 Manila",
    initials: "KC",
    avatar: 2,
  },
  {
    quote:
      "I'm from Davao and always felt left out of Manila-centric platforms. bigmovv showed me remote roles I never knew existed. Hired at Canva within 2 weeks.",
    name: "Alyssa L.",
    role: "UX Researcher \u00B7 Davao",
    initials: "AL",
    avatar: 3,
  },
];

export function TestimonialsSection() {
  return (
    <div className="lp-testi-grid">
      {testimonials.map((t) => (
        <div key={t.initials} className="lp-testi">
          <div className="lp-testi-stars">{"★★★★★"}</div>
          <div className="lp-testi-quote">{t.quote}</div>
          <div className="lp-testi-author">
            <div className={`lp-testi-av lp-ta-${t.avatar}`}>
              {t.initials}
            </div>
            <div>
              <div className="lp-testi-name">{t.name}</div>
              <div className="lp-testi-role">{t.role}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
