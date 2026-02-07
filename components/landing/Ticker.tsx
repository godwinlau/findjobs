"use client";

const tickerData = [
  { name: "Maria A.", city: "Makati", action: "matched with 28 jobs", time: "2m ago" },
  { name: "Juan R.", city: "Cebu", action: "hired at Vercel", time: "1h ago" },
  { name: "KC D.", city: "Manila", action: "got 3 interview invites", time: "3h ago" },
  { name: "Alyssa L.", city: "Davao", action: "hired at Canva", time: "5h ago" },
  { name: "Rico M.", city: "QC", action: "matched with 34 jobs", time: "12m ago" },
  { name: "Sarah G.", city: "Iloilo", action: "hired at Stripe", time: "8h ago" },
  { name: "Dan T.", city: "Taguig", action: "started 2 interviews", time: "45m ago" },
  { name: "Joy P.", city: "Pasig", action: "matched with 22 jobs", time: "18m ago" },
  { name: "Mark S.", city: "Cebu", action: "hired at Shopify", time: "1d ago" },
  { name: "Ana C.", city: "Makati", action: "got 5 interview invites", time: "2h ago" },
  { name: "Leo V.", city: "Manila", action: "matched with 41 jobs", time: "8m ago" },
  { name: "Gem R.", city: "Davao", action: "hired at Linear", time: "6h ago" },
];

function TickerItems() {
  return (
    <>
      {tickerData.map((t, i) => (
        <div key={i} className="lp-ticker-item">
          <div className="lp-ticker-dot" />
          <div className="lp-ticker-text">
            <strong>{t.name}</strong> from {t.city} {t.action}
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
