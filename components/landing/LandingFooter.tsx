import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="lp-footer">
      <div className="lp-footer-inner">
        <div className="lp-footer-brand">
          <div className="lp-footer-brand-row">
            <div className="lp-nav-logo">HB</div>
            <span className="lp-nav-wordmark">HanapBuhay</span>
          </div>
          <div className="lp-footer-desc">
            Smart job matching for Filipino professionals. Find work that fits
            your skills, not just your search query.
          </div>
        </div>
        <div>
          <div className="lp-footer-col-title">Product</div>
          <div className="lp-footer-links">
            <a className="lp-footer-link" href="#how">How It Works</a>
            <a className="lp-footer-link" href="#features">Features</a>
            <Link className="lp-footer-link" href="/learn">Skills Intelligence</Link>
            <a className="lp-footer-link">For Employers</a>
          </div>
        </div>
        <div>
          <div className="lp-footer-col-title">Company</div>
          <div className="lp-footer-links">
            <a className="lp-footer-link">About</a>
            <a className="lp-footer-link">Blog</a>
            <a className="lp-footer-link">Careers</a>
            <a className="lp-footer-link">Contact</a>
          </div>
        </div>
        <div>
          <div className="lp-footer-col-title">Legal</div>
          <div className="lp-footer-links">
            <a className="lp-footer-link">Privacy Policy</a>
            <a className="lp-footer-link">Terms of Service</a>
            <a className="lp-footer-link">Cookie Policy</a>
          </div>
        </div>
      </div>
      <div className="lp-footer-bottom">
        <div className="lp-footer-copy">
          &copy; 2026 HanapBuhay &middot; Made in the Philippines
        </div>
        <div className="lp-footer-socials">
          <a className="lp-footer-social" aria-label="Twitter">X</a>
          <a className="lp-footer-social" aria-label="LinkedIn">in</a>
          <a className="lp-footer-social" aria-label="Facebook">fb</a>
        </div>
      </div>
    </footer>
  );
}
