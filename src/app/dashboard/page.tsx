'use client';

import Header from "@/components/Header";
import WidgetGrid from "@/components/WidgetGrid";
import AddWidgetModal from "@/components/modal/AddWidgetModal";
import { useDashboardStore } from "@/store/dashboardStore";

export default function DashboardPage() {
  const { widgets } = useDashboardStore();
  const hasWidgets = widgets.length > 0;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {!hasWidgets ? (
          <div className="flex flex-1 flex-col items-center justify-center px-4 pt-16 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[var(--bg-secondary)] shadow-lg shadow-black/50 ring-1 ring-white/10">
              <svg className="h-10 w-10 text-[var(--accent-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
            </div>
            <h2 className="mb-3 text-3xl font-bold tracking-tight text-[var(--text-primary)]">
              Build Your Finance Dashboard
            </h2>
            <p className="max-w-xl text-lg text-[var(--text-secondary)] leading-relaxed">
              Create custom widgets by connecting to any finance API. Track
              stocks, crypto, forex, or economic indicators - all in real time.
            </p>
            <div className="mt-10">
              <button
                onClick={() => useDashboardStore.getState().openModal()}
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent-primary)] px-6 py-3.5 text-base font-semibold text-white transition-all hover:bg-[var(--accent-primary-hover)] shadow-lg hover:shadow-[var(--accent-primary)]/20 hover:-translate-y-0.5"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add First Widget
              </button>
            </div>
          </div>
        ) : (
          <WidgetGrid />
        )}
      </main>

      <AddWidgetModal />
    </div>
  );
}
