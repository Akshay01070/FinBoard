'use client';

import { useEffect, useRef } from 'react';

export default function FeaturesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    const items = sectionRef.current?.querySelectorAll('.reveal');
    items?.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, []);

  return (
    <section className="features-section" id="features" ref={sectionRef}>
      <div className="features-inner">
        <div className="features-header reveal">
          <h2 className="features-title">Engineered for Precision</h2>
          <p className="features-subtitle">
            Everything you need to monitor global capital flows with zero latency.
          </p>
        </div>

        <div className="features-grid">
          {/* Feature 1 — Real-Time Data Streams (wide) */}
          <div className="feature-card glass-card feature-wide reveal">
            <div style={{ maxWidth: '28rem' }}>
              <span className="feature-icon primary">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <h3 className="feature-title">Real-Time Data Streams</h3>
              <p className="feature-desc">
                Connect to the world&apos;s most reliable financial APIs. Experience sub-millisecond
                updates across equities, crypto, and forex.
              </p>
            </div>
            <div className="api-providers">
              <div className="provider-avatars">
                <div className="provider-avatar">CG</div>
                <div className="provider-avatar">AV</div>
                <div className="provider-avatar">BN</div>
                <div className="provider-avatar">+1</div>
              </div>
              <span className="provider-label">4+ API Providers Integrated</span>
            </div>
          </div>

          {/* Feature 2 — Drag-and-Drop Grid */}
          <div className="feature-card glass-card reveal" style={{ transitionDelay: '0.1s' }}>
            <div>
              <span className="feature-icon secondary">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
              </span>
              <h3 className="feature-title">Drag-and-Drop Grid</h3>
              <p className="feature-desc">
                Your dashboard, your rules. Build a layout that fits your trading style
                with our proprietary canvas engine.
              </p>
            </div>
            <div className="grid-mini">
              <div className="grid-mini-item grid-mini-item-1" />
              <div className="grid-mini-item grid-mini-item-2" />
              <div className="grid-mini-item grid-mini-item-3" />
            </div>
          </div>

          {/* Feature 3 — Advanced Indicators */}
          <div className="feature-card glass-card reveal" style={{ transitionDelay: '0.2s' }}>
            <div>
              <span className="feature-icon primary">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 3v18h18" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M7 16l4-8 4 5 5-9" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <h3 className="feature-title">Advanced Indicators</h3>
              <p className="feature-desc">
                From RSI to Bollinger Bands, overlay any indicator on your live charts
                with a single click.
              </p>
            </div>
          </div>

          {/* Feature 4 — Multi-Provider Core (wide) */}
          <div className="feature-card glass-card feature-wide reveal" style={{ transitionDelay: '0.3s' }}>
            <div className="feature-row">
              <div className="feature-row-content">
                <h3 className="feature-title">Multi-Provider Core</h3>
                <p className="feature-desc">
                  We aggregate data from Alpha Vantage, CoinGecko, Yahoo Finance, and more
                  into a single high-performance stream.
                </p>
                <a href="#" className="feature-link">
                  Documentation
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </div>
              <div className="feature-visual">
                <DataFlowVisual />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Animated SVG data flow visualization */
function DataFlowVisual() {
  return (
    <div className="data-flow-visual">
      <svg viewBox="0 0 300 180" fill="none">
        {/* Connection lines */}
        <line className="data-connection" x1="60" y1="50" x2="150" y2="90" />
        <line className="data-connection" x1="60" y1="130" x2="150" y2="90" />
        <line className="data-connection" x1="60" y1="90" x2="150" y2="90" />
        <line className="data-connection" x1="150" y1="90" x2="240" y2="70" />
        <line className="data-connection" x1="150" y1="90" x2="240" y2="110" />

        {/* Source nodes */}
        <circle className="data-node" cx="60" cy="50" r="6" />
        <circle className="data-node-pulse" cx="60" cy="50" r="6" style={{ animationDelay: '0s' }} />
        <text x="60" y="36" textAnchor="middle" fill="var(--lp-on-surface-variant)" fontSize="8" fontFamily="var(--lp-font-body)">CoinGecko</text>

        <circle className="data-node" cx="60" cy="90" r="6" />
        <circle className="data-node-pulse" cx="60" cy="90" r="6" style={{ animationDelay: '1s' }} />
        <text x="60" y="76" textAnchor="middle" fill="var(--lp-on-surface-variant)" fontSize="8" fontFamily="var(--lp-font-body)">Alpha V.</text>

        <circle className="data-node" cx="60" cy="130" r="6" />
        <circle className="data-node-pulse" cx="60" cy="130" r="6" style={{ animationDelay: '2s' }} />
        <text x="60" y="150" textAnchor="middle" fill="var(--lp-on-surface-variant)" fontSize="8" fontFamily="var(--lp-font-body)">Yahoo Fin.</text>

        {/* Central hub */}
        <circle cx="150" cy="90" r="12" fill="var(--lp-primary)" opacity="0.2" />
        <circle cx="150" cy="90" r="7" fill="var(--lp-primary)" opacity="0.6" />
        <circle cx="150" cy="90" r="14" fill="none" stroke="var(--lp-primary)" strokeWidth="1" opacity="0.15">
          <animate attributeName="r" values="14;22;14" dur="3s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.15;0;0.15" dur="3s" repeatCount="indefinite" />
        </circle>
        <text x="150" y="72" textAnchor="middle" fill="var(--lp-primary)" fontSize="8" fontWeight="700" fontFamily="var(--lp-font-headline)">FinBoard</text>

        {/* Output nodes */}
        <circle className="data-node" cx="240" cy="70" r="5" />
        <text x="240" y="56" textAnchor="middle" fill="var(--lp-on-surface-variant)" fontSize="7" fontFamily="var(--lp-font-body)">Charts</text>

        <circle className="data-node" cx="240" cy="110" r="5" />
        <text x="240" y="126" textAnchor="middle" fill="var(--lp-on-surface-variant)" fontSize="7" fontFamily="var(--lp-font-body)">Widgets</text>
      </svg>
    </div>
  );
}
