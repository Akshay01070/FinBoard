'use client';

import { DisplayMode, ChartType } from '@/types';

interface DisplayModeToggleProps {
    mode: DisplayMode;
    chartType: ChartType;
    onModeChange: (mode: DisplayMode) => void;
    onChartTypeChange: (type: ChartType) => void;
}

export default function DisplayModeToggle({
    mode,
    chartType,
    onModeChange,
    onChartTypeChange,
}: DisplayModeToggleProps) {
    return (
        <div className="space-y-3">
            <label className="text-sm font-medium text-[var(--text-secondary)]">
                Display Mode
            </label>
            <div className="mode-toggle">
                <button
                    type="button"
                    onClick={() => onModeChange('card')}
                    className={mode === 'card' ? 'active' : ''}
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
                    </svg>
                    Card
                </button>
                <button
                    type="button"
                    onClick={() => onModeChange('table')}
                    className={mode === 'table' ? 'active' : ''}
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Table
                </button>
                <button
                    type="button"
                    onClick={() => onModeChange('chart')}
                    className={mode === 'chart' ? 'active' : ''}
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                    Chart
                </button>
            </div>

            {/* Chart type selector */}
            {mode === 'chart' && (
                <div className="mt-2 flex gap-2">
                    <button
                        type="button"
                        onClick={() => onChartTypeChange('line')}
                        className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${chartType === 'line'
                                ? 'bg-[var(--accent-primary)] text-white'
                                : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-card)]'
                            }`}
                    >
                        Line Chart
                    </button>
                    <button
                        type="button"
                        onClick={() => onChartTypeChange('candlestick')}
                        className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${chartType === 'candlestick'
                                ? 'bg-[var(--accent-primary)] text-white'
                                : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-card)]'
                            }`}
                    >
                        Candlestick
                    </button>
                </div>
            )}
        </div>
    );
}
