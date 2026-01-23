'use client';

import { useDashboardStore } from '@/store/dashboardStore';

export default function AddWidgetCard() {
    const { openModal } = useDashboardStore();

    return (
        <button
            onClick={() => openModal()}
            className="add-widget-card group"
        >
            <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-dashed border-[var(--border-color)] text-[var(--text-muted)] transition-all group-hover:border-[var(--accent-primary)] group-hover:bg-[var(--accent-primary)] group-hover:text-white">
                <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                    />
                </svg>
            </div>
            <div className="mt-3 text-center">
                <p className="font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">
                    Add Widget
                </p>
                <p className="mt-1 text-sm text-[var(--text-muted)]">
                    Connect to a finance API and<br />create a custom widget
                </p>
            </div>
        </button>
    );
}
