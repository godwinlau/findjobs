"use client";

const tickerData = [
  { name: "Maria A.", city: "Makati", action: "scored 95% \u2014 hired at Spotify (her mom cried)", time: "2m ago" },
  { name: "Juan R.", city: "Cebu", action: "scored 89% \u2014 3 interviews in one week", time: "1h ago" },
  { name: "KC D.", city: "Manila", action: "score jumped from 74% to 89% after learning TS", time: "3h ago" },
  { name: "Alyssa L.", city: "Davao", action: "hired at Canva in 14 days. From Davao.", time: "5h ago" },
  { name: "Rico M.", city: "QC", action: "matched with 34 jobs at 85%+ \u2014 had to pick one", time: "12m ago" },
  { name: "Sarah G.", city: "Iloilo", action: "scored 91% \u2014 hired at Stripe. Remote.", time: "8h ago" },
  { name: "Dan T.", city: "Taguig", action: "scored 88% \u2014 interviewing at 3 companies rn", time: "45m ago" },
  { name: "Joy P.", city: "Pasig", action: "22 high-score jobs \u2014 \"this can't be real\" she said", time: "18m ago" },
  { name: "Mark S.", city: "Cebu", action: "scored 93% \u2014 hired at Shopify. No degree needed.", time: "1d ago" },
  { name: "Ana C.", city: "Makati", action: "5 interview invites at 90%+ match. In one day.", time: "2h ago" },
  { name: "Leo V.", city: "Manila", action: "scored 87% across 41 jobs \u2014 career crisis solved", time: "8m ago" },
  { name: "Gem R.", city: "Davao", action: "scored 90% \u2014 hired at Linear. Still can't believe it.", time: "6h ago" },
];

function TickerItems() {
  return (
    <>
      {tickerData.map((t, i) => (
        <div key={i} className="lp-ticker-item">
          <div className="lp-ticker-dot" />
          <div className="lp-ticker-text">
            <strong>{t.name}</strong> from {t.city} &mdash; {t.action}
          </div>
          <div className="lp-ticker-time">{t.time}</div>
        </div>
      ))}
    </>
  );
}

export function Ticker() {
  return (
    <div className="lp-ticker">
      <div className="lp-ticker-track">
        <TickerItems />
        <TickerItems />
      </div>
    </div>
  );
}
