'use client';

import Link from 'next/link';
import { useDashboardStore } from '@/store/dashboardStore';
import { SignInButton, SignUpButton, UserButton, Show } from '@clerk/nextjs';

export default function LandingNav() {
  const { theme, toggleTheme } = useDashboardStore();

  return (
    <header className="landing-nav" id="landing-nav">
      <nav className="landing-nav-inner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <Link href="/" className="landing-logo">FinBoard</Link>
          <div className="nav-links">
            <a href="#features" className="nav-link active">Product</a>
            <a href="#features" className="nav-link">Markets</a>
            <a href="#cta" className="nav-link">Pricing</a>
            <a href="#footer" className="nav-link">About</a>
          </div>
        </div>

        <div className="nav-actions">
          <div className="nav-search">
            <svg className="nav-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input type="text" placeholder="Search markets..." />
          </div>

          <button
            onClick={toggleTheme}
            className="landing-theme-toggle"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            id="landing-theme-toggle"
          >
            {theme === 'dark' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>

          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="nav-signin">Sign In</button>
            </SignInButton>

            <SignUpButton mode="modal">
              <button className="nav-cta kinetic-gradient" id="nav-get-started">
                Get Started
              </button>
            </SignUpButton>
          </Show>

          <Show when="signed-in">
            <Link href="/dashboard" className="nav-signin" style={{ textDecoration: 'none' }}>
              Dashboard
            </Link>
            <UserButton />
          </Show>
        </div>
      </nav>
    </header>
  );
}
