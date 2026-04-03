export default function Footer() {
  return (
    <footer className="landing-footer" id="footer">
      <div className="footer-inner">
        <div className="footer-grid">
          {/* Brand */}
          <div>
            <div className="footer-brand-logo">FinBoard</div>
            <p className="footer-brand-desc">
              The Kinetic Observatory for global capital. Providing high-fidelity insights
              and unified control for the modern investor.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="footer-col-title">Product</h4>
            <div className="footer-links">
              <a href="#" className="footer-link">Widgets</a>
              <a href="#" className="footer-link">API access</a>
              <a href="#" className="footer-link">Pricing</a>
              <a href="#" className="footer-link">Beta Program</a>
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 className="footer-col-title">Company</h4>
            <div className="footer-links">
              <a href="#" className="footer-link">About</a>
              <a href="#" className="footer-link">Contact</a>
              <a href="#" className="footer-link">Careers</a>
              <a href="#" className="footer-link">Press Kit</a>
            </div>
          </div>

          {/* Legal & Dev */}
          <div>
            <h4 className="footer-col-title">Legal & Dev</h4>
            <div className="footer-links">
              <a href="#" className="footer-link">Privacy</a>
              <a href="#" className="footer-link">Terms</a>
              <a href="#" className="footer-link">API Documentation</a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            © 2024 FinBoard Kinetic Observatory. All rights reserved.
          </p>
          <div className="footer-socials">
            <a href="#" className="footer-social-link" aria-label="Website">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </a>
            <a href="#" className="footer-social-link" aria-label="Community">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </a>
            <a href="#" className="footer-social-link" aria-label="Email">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
