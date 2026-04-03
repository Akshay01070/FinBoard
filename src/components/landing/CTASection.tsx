'use client';

import { SignUpButton } from '@clerk/nextjs';

export default function CTASection() {
  return (
    <section className="cta-section" id="cta">
      <div className="cta-card glass-card">
        <div className="cta-glow-1" />
        <div className="cta-glow-2" />

        <h2 className="cta-title">
          Ready to see the market differently?
        </h2>
        <p className="cta-subtitle">
          Join 50,000+ traders using FinBoard to master the kinetic flow of global assets.
        </p>

        <div className="cta-buttons">
          <SignUpButton mode="modal">
            <button className="cta-btn-primary kinetic-gradient" id="cta-get-started">
              Get Started Now
            </button>
          </SignUpButton>
          <button className="cta-btn-secondary">
            Pricing Plans
          </button>
        </div>
      </div>
    </section>
  );
}
