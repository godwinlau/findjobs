const testimonials = [
  {
    quote:
      "Scored 95% for a Spotify role. Applied on Monday, had 3 interviews by Friday. My mom still thinks I\u2019m lying about how fast this happened.",
    name: "Maria A.",
    role: "Product Designer \u00B7 Makati",
    initials: "MA",
    avatar: 1,
  },
  {
    quote:
      "The skill gap feature said \u201Clearn TypeScript, unlock 28 more jobs.\u201D So I did. My score jumped from 74% to 89%. Got hired in 3 weeks. Wish I\u2019d known sooner.",
    name: "KC D.",
    role: "Full-Stack Dev \u00B7 Manila",
    initials: "KC",
    avatar: 2,
  },
  {
    quote:
      "From Davao, always felt invisible on Manila-centric platforms. bigmovv showed me remote roles I didn\u2019t know existed. Hired at Canva in 2 weeks. My commute is now 12 steps to my desk.",
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
          <div className="lp-testi-stars">{"\u2605\u2605\u2605\u2605\u2605"}</div>
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
