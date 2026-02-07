import { ScrollReveal } from "./ScrollReveal";

export function LogoStrip() {
  const logos = ["Spotify", "Stripe", "Vercel", "Shopify", "Figma", "Canva", "Linear"];

  return (
    <ScrollReveal className="lp-logo-strip">
      <div className="lp-logo-inner">
        <div className="lp-logo-label">
          Companies hiring through bigmovv
        </div>
        <div className="lp-logo-row">
          {logos.map((name) => (
            <div key={name} className="lp-logo-item">
              {name}
            </div>
          ))}
          <div
            className="lp-logo-item"
            style={{
              color: "#FBBF24",
              borderColor: "rgba(251,191,36,.1)",
            }}
          >
            +340 <span>more</span>
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}
