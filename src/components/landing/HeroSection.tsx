'use client';

import { SignUpButton } from '@clerk/nextjs';

export default function HeroSection() {
  return (
    <section className="hero-section" id="hero">
      {/* Background glows */}
      <div className="hero-glow-1" />
      <div className="hero-glow-2" />

      <div className="hero-content">
        {/* Live badge */}
        <div className="live-badge">
          <span className="live-dot" />
          <span className="live-badge-text">Live Markets Connected</span>
        </div>

        {/* Headline */}
        <h1 className="hero-headline">
          Unified Financial{' '}
          <span className="hero-headline-accent text-glow">Control.</span>
        </h1>

        {/* Subtitle */}
        <p className="hero-subtitle">
          Build your personalized command center with drag-and-drop widgets
          and real-time data from 4+ major providers.
        </p>

        {/* CTA Buttons */}
        <div className="hero-buttons">
          <SignUpButton mode="modal">
            <button className="hero-cta-primary kinetic-gradient" id="hero-get-started">
              Get Started
            </button>
          </SignUpButton>
          <button className="hero-cta-secondary glass-card">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
            Watch Demo
          </button>
        </div>

        {/* Dashboard Preview */}
        <div className="hero-preview">
          <div className="hero-preview-grid">
            {/* Main Chart Card */}
            <div className="preview-chart-card glass-card">
              <div className="preview-chart-header">
                <div>
                  <div className="preview-chart-label">Portfolio Performance</div>
                  <div className="preview-chart-value">$142,850.42</div>
                </div>
                <div className="preview-chart-badge">+12.4%</div>
              </div>
              <div className="preview-chart-visual">
                <svg width="100%" height="100%" viewBox="0 0 600 256" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--lp-primary)" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="var(--lp-primary)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {/* Grid lines */}
                  <line className="chart-grid-line" x1="0" y1="64" x2="600" y2="64" />
                  <line className="chart-grid-line" x1="0" y1="128" x2="600" y2="128" />
                  <line className="chart-grid-line" x1="0" y1="192" x2="600" y2="192" />
                  {/* Chart area fill */}
                  <path
                    className="chart-area"
                    d="M0 200 Q30 190 60 180 Q90 165 120 155 Q150 170 180 160 Q210 140 240 130 Q270 150 300 135 Q330 110 360 95 Q390 100 420 85 Q450 70 480 60 Q510 55 540 45 Q570 35 600 30 L600 256 L0 256 Z"
                  />
                  {/* Chart line */}
                  <path
                    className="chart-line"
                    d="M0 200 Q30 190 60 180 Q90 165 120 155 Q150 170 180 160 Q210 140 240 130 Q270 150 300 135 Q330 110 360 95 Q390 100 420 85 Q450 70 480 60 Q510 55 540 45 Q570 35 600 30"
                  />
                  {/* Data points */}
                  <circle cx="120" cy="155" r="4" fill="var(--lp-primary)" opacity="0.8" />
                  <circle cx="300" cy="135" r="4" fill="var(--lp-primary)" opacity="0.8" />
                  <circle cx="480" cy="60" r="4" fill="var(--lp-primary)" opacity="0.8" />
                  <circle cx="600" cy="30" r="5" fill="var(--lp-primary)">
                    <animate attributeName="r" values="4;7;4" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />
                  </circle>
                </svg>
              </div>
            </div>

            {/* Sidebar */}
            <div className="preview-sidebar">
              {/* Watchlist */}
              <div className="preview-watchlist glass-card">
                <div className="preview-watchlist-header">
                  <svg className="preview-watchlist-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <span className="preview-watchlist-title">Watchlist</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <div className="watchlist-item">
                    <span className="watchlist-symbol">BTC/USD</span>
                    <span className="watchlist-price positive">$64,210.50</span>
                  </div>
                  <div className="watchlist-item">
                    <span className="watchlist-symbol">NVDA</span>
                    <span className="watchlist-price positive">$118.32</span>
                  </div>
                  <div className="watchlist-item">
                    <span className="watchlist-symbol">TSLA</span>
                    <span className="watchlist-price negative">$175.40</span>
                  </div>
                </div>
              </div>

              {/* Live Insights */}
              <div className="preview-insights">
                <svg className="preview-insights-icon" width="56" height="56" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11 21h-1l1-7H7.5c-.88 0-.33-.75-.31-.78C8.48 10.94 10.42 7.54 13.01 3h1l-1 7h3.51c.4 0 .62.19.4.66C12.97 17.55 11 21 11 21z" />
                </svg>
                <h4 className="preview-insights-title">Live Insights</h4>
                <p className="preview-insights-text">
                  Market sentiment shifted 4.2% bullish in the last 15 minutes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
