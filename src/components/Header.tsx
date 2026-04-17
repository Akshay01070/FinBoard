'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { useDashboardStore } from '@/store/dashboardStore';
import { UserButton } from '@clerk/nextjs';

export default function Header() {
    const { widgets, theme, openModal, toggleTheme } = useDashboardStore();
    const activeWidgets = widgets.length;
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExport = () => {
        const data = {
            version: '1.0',
            exportedAt: new Date().toISOString(),
            widgets: widgets.map((w) => ({
                name: w.name,
                apiUrl: w.apiUrl,
                refreshInterval: w.refreshInterval,
                displayMode: w.displayMode,
                chartType: w.chartType,
                selectedFields: w.selectedFields,
            })),
            theme,
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `finboard-config-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target?.result as string);
                if (data.widgets && Array.isArray(data.widgets)) {
                    const { addWidget, setTheme } = useDashboardStore.getState();
                    data.widgets.forEach((w: { name: string; apiUrl: string; refreshInterval: number; displayMode: 'card' | 'table' | 'chart'; chartType?: 'line' | 'candlestick'; selectedFields: { path: string; label: string; format?: 'currency' | 'percentage' | 'number' | 'text' }[] }) => {
                        addWidget(w);
                    });
                    if (data.theme) {
                        setTheme(data.theme);
                    }
                    alert('Configuration imported successfully!');
                }
            } catch {
                alert('Failed to import configuration. Invalid file format.');
            }
        };
        reader.readAsText(file);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <header
            style={{
                position: 'sticky',
                top: 0,
                zIndex: 40,
                background: theme === 'dark' ? 'rgba(12, 14, 18, 0.7)' : 'rgba(255, 255, 255, 0.75)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                boxShadow: theme === 'dark' ? '0 4px 32px rgba(63, 255, 139, 0.03)' : '0 1px 3px rgba(0, 0, 0, 0.06)',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1.5rem' }}>
                {/* Logo and Title */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Link
                        href="/"
                        style={{
                            fontFamily: 'var(--font-headline)',
                            fontSize: '1.25rem',
                            fontWeight: 900,
                            color: 'var(--accent-primary)',
                            letterSpacing: '-0.05em',
                            textDecoration: 'none',
                        }}
                    >
                        FinBoard
                    </Link>
                    <div
                        style={{
                            width: '1px',
                            height: '1.5rem',
                            background: 'var(--surface-glass-border)',
                        }}
                    />
                    <div>
                        <p style={{
                            fontSize: '0.8125rem',
                            color: 'var(--text-secondary)',
                            fontFamily: 'var(--font-body)',
                        }}>
                            {activeWidgets > 0
                                ? `${activeWidgets} active widget${activeWidgets > 1 ? 's' : ''}`
                                : 'Build your dashboard'}
                        </p>
                    </div>
                    {activeWidgets > 0 && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.375rem',
                            padding: '0.25rem 0.625rem',
                            borderRadius: '9999px',
                            background: 'var(--accent-glow)',
                            border: '1px solid rgba(63, 255, 139, 0.15)',
                        }}>
                            <span style={{
                                width: '0.375rem',
                                height: '0.375rem',
                                borderRadius: '50%',
                                background: 'var(--accent-primary)',
                                animation: 'pulse-glow 2s ease-in-out infinite',
                                boxShadow: '0 0 6px var(--accent-primary)',
                            }} />
                            <span style={{
                                fontSize: '0.6875rem',
                                fontWeight: 600,
                                color: 'var(--accent-primary)',
                                fontFamily: 'var(--font-body)',
                                textTransform: 'uppercase' as const,
                                letterSpacing: '0.08em',
                            }}>Live</span>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {/* Import Button */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json"
                        onChange={handleImport}
                        className="hidden"
                        id="import-config"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                            display: 'flex',
                            height: '2.25rem',
                            width: '2.25rem',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '0.625rem',
                            border: '1px solid var(--surface-glass-border)',
                            background: 'var(--surface-glass)',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                        }}
                        title="Import configuration"
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'var(--accent-primary)';
                            e.currentTarget.style.color = 'var(--accent-primary)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--surface-glass-border)';
                            e.currentTarget.style.color = 'var(--text-secondary)';
                        }}
                    >
                        <svg style={{ height: '1.125rem', width: '1.125rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                    </button>

                    {/* Export Button */}
                    <button
                        onClick={handleExport}
                        disabled={widgets.length === 0}
                        style={{
                            display: 'flex',
                            height: '2.25rem',
                            width: '2.25rem',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '0.625rem',
                            border: '1px solid var(--surface-glass-border)',
                            background: 'var(--surface-glass)',
                            color: 'var(--text-secondary)',
                            cursor: widgets.length === 0 ? 'not-allowed' : 'pointer',
                            opacity: widgets.length === 0 ? 0.5 : 1,
                            transition: 'all 0.3s ease',
                        }}
                        title="Export configuration"
                        onMouseEnter={(e) => {
                            if (widgets.length > 0) {
                                e.currentTarget.style.borderColor = 'var(--accent-primary)';
                                e.currentTarget.style.color = 'var(--accent-primary)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--surface-glass-border)';
                            e.currentTarget.style.color = 'var(--text-secondary)';
                        }}
                    >
                        <svg style={{ height: '1.125rem', width: '1.125rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                    </button>

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        style={{
                            display: 'flex',
                            height: '2.25rem',
                            width: '2.25rem',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '0.625rem',
                            border: '1px solid var(--surface-glass-border)',
                            background: 'var(--surface-glass)',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                        }}
                        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'var(--accent-primary)';
                            e.currentTarget.style.color = 'var(--accent-primary)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--surface-glass-border)';
                            e.currentTarget.style.color = 'var(--text-secondary)';
                        }}
                    >
                        {theme === 'dark' ? (
                            <svg style={{ height: '1.125rem', width: '1.125rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                                />
                            </svg>
                        ) : (
                            <svg style={{ height: '1.125rem', width: '1.125rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                                />
                            </svg>
                        )}
                    </button>

                    {/* User Account */}
                    <UserButton />

                    {/* Add Widget Button */}
                    <button
                        onClick={() => openModal()}
                        className="btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <svg style={{ height: '1rem', width: '1rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Widget
                    </button>
                </div>
            </div>
        </header>
    );
}
