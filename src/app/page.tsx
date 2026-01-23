'use client';

import Header from "@/components/Header";
import WidgetGrid from "@/components/WidgetGrid";
import AddWidgetModal from "@/components/modal/AddWidgetModal";
import { useDashboardStore } from "@/store/dashboardStore";

export default function Home() {
  const { widgets } = useDashboardStore();
  const hasWidgets = widgets.length > 0;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {!hasWidgets && (
          <div className="flex flex-col items-center justify-center px-4 pt-16 text-center">
            {/* Empty state illustration */}
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-[var(--border-color)]">
              <svg
                className="h-10 w-10 text-[var(--text-muted)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h2 className="mb-2 text-2xl font-semibold text-[var(--text-primary)]">
              Build Your Finance Dashboard
            </h2>
            <p className="max-w-md text-[var(--text-secondary)]">
              Create custom widgets by connecting to any finance API. Track
              stocks, crypto, forex, or economic indicators - all in real time.
            </p>
          </div>
        )}

        <WidgetGrid />
      </main>

      <AddWidgetModal />
    </div>
  );
}
