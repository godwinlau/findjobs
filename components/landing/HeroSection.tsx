import Link from "next/link";

export function HeroSection() {
  return (
    <section className="lp-hero" id="heroSection">
      <div className="lp-hero-inner">
        <div>
          <div className="lp-hero-eyebrow">
            Career intelligence that actually works
          </div>
          <h1 className="lp-hero-title">
            Your career called.
            <br />
            It wants a <span>big movv.</span>
          </h1>
          <p className="lp-hero-sub">
            We score your skills against real jobs and show you embarrassingly
            good matches. Salaries in PHP. Zero guesswork.
          </p>
          <div className="lp-hero-ctas">
            <Link className="lp-btn-primary" href="/signup">
              Make Your Bigmovv &rarr;
            </Link>
            <a className="lp-btn-ghost" href="#how">
              See How It Works
            </a>
          </div>
          <div className="lp-hero-note">
            Free forever &middot; No resume needed &middot; 60 seconds to your
            score
          </div>
          <div className="lp-hero-avatars">
            <div className="lp-hero-av lp-hero-av-1">MA</div>
            <div className="lp-hero-av lp-hero-av-2">JR</div>
            <div className="lp-hero-av lp-hero-av-3">KC</div>
            <div className="lp-hero-av lp-hero-av-4">AL</div>
            <div className="lp-hero-av lp-hero-av-5">RM</div>
            <span className="lp-hero-av-text">
              12,000+ Filipinos already scored
            </span>
          </div>
        </div>
        <div className="lp-hero-right">
          <div className="lp-hero-preview">
            <div className="lp-fake-ui">
              <div className="lp-fake-bar">
                <div className="lp-fake-dot" />
                <div className="lp-fake-dot lp-fake-dot-y" />
                <div className="lp-fake-dot" />
                <span
                  style={{
                    fontFamily: "'Space Mono',monospace",
                    fontSize: 8,
                    color: "rgba(255,255,255,.15)",
                    textTransform: "uppercase",
                    letterSpacing: ".04em",
                    marginLeft: "auto",
                  }}
                >
                  Your Bigmovv Score &middot; 32 Jobs
                </span>
              </div>
              {[
                { icon: "\uD83C\uDFB5", company: "Spotify", role: "Senior Product Designer", salary: "\u20B185K-120K", match: 95, level: "hi" },
                { icon: "\uD83D\uDC9C", company: "Stripe", role: "Design Engineer", salary: "\u20B190K-140K", match: 89, level: "hi" },
                { icon: "\u25B2", company: "Vercel", role: "Frontend Developer", salary: "\u20B175K-110K", match: 82, level: "md" },
                { icon: "\uD83D\uDFE2", company: "Shopify", role: "UX Engineer", salary: "\u20B170K-100K", match: 74, level: "lo" },
              ].map((job) => (
                <div key={job.role} className="lp-fake-card">
                  <div className="lp-fc-left">
                    <div className="lp-fc-logo">{job.icon}</div>
                    <div className="lp-fc-info">
                      <div className="lp-fc-company">
                        {job.company} &middot; Remote
                      </div>
                      <div className="lp-fc-title">{job.role}</div>
                      <div className="lp-fc-tags">
                        <span className="lp-fc-tag">Full-Time</span>
                        <span className="lp-fc-tag">{job.salary}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`lp-fc-match lp-fc-match-${job.level}`}>
                    {job.match}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
