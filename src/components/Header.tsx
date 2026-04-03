'use client';

import { useRef } from 'react';
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
        <header className="sticky top-0 z-40 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/80 backdrop-blur-md">
            <div className="flex items-center justify-between px-6 py-4">
                {/* Logo and Title */}
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent-primary)]">
                        <svg
                            className="h-5 w-5 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                            />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold text-[var(--text-primary)]">
                            Finance Dashboard
                        </h1>
                        <p className="text-sm text-[var(--text-muted)]">
                            {activeWidgets > 0
                                ? `${activeWidgets} active widget${activeWidgets > 1 ? 's' : ''} • Real-time data`
                                : 'Connect to APIs and build your custom dashboard'}
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
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
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)]"
                        title="Import configuration"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                    </button>

                    {/* Export Button */}
                    <button
                        onClick={handleExport}
                        disabled={widgets.length === 0}
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)] disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Export configuration"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                    </button>

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)]"
                        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                    >
                        {theme === 'dark' ? (
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                                />
                            </svg>
                        ) : (
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                        className="btn-primary flex items-center gap-2"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Widget
                    </button>
                </div>
            </div>
        </header>
    );
}
