'use client';

import React from 'react';
import { ApiProvider, ApiEndpoint } from '@/lib/providers';

interface EndpointSelectorProps {
    provider: ApiProvider;
    selectedEndpoint: string | null;
    onSelect: (endpoint: ApiEndpoint) => void;
    onBack: () => void;
}

export function EndpointSelector({
    provider,
    selectedEndpoint,
    onSelect,
    onBack
}: EndpointSelectorProps) {
    return (
        <div className="endpoint-selector">
            <div className="flex items-center gap-3 mb-4">
                <button
                    onClick={onBack}
                    className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                    ← Back
                </button>
                <div className="flex items-center gap-2">
                    <span className="text-2xl">{provider.icon}</span>
                    <h3 className="text-lg font-semibold">{provider.name}</h3>
                </div>
            </div>

            <p className="text-sm text-[var(--text-secondary)] mb-4">
                Select the data you want to display:
            </p>

            <div className="space-y-3">
                {provider.endpoints.map((endpoint) => (
                    <button
                        key={endpoint.id}
                        onClick={() => onSelect(endpoint)}
                        className={`endpoint-card ${selectedEndpoint === endpoint.id ? 'selected' : ''}`}
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <span className="font-medium">{endpoint.name}</span>
                                <p className="text-sm text-[var(--text-secondary)] mt-1">
                                    {endpoint.description}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`display-mode-badge ${endpoint.displayMode}`}>
                                    {endpoint.displayMode === 'card' && '📊'}
                                    {endpoint.displayMode === 'table' && '📋'}
                                    {endpoint.displayMode === 'chart' && '📈'}
                                    {endpoint.displayMode}
                                </span>
                            </div>
                        </div>

                        {endpoint.chartType && (
                            <span className="text-xs text-[var(--accent-primary)] mt-2 inline-block">
                                {endpoint.chartType === 'line' ? '📉 Line Chart' : '🕯️ Candlestick'}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {provider.docsUrl && (
                <a
                    href={provider.docsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[var(--accent-primary)] hover:underline mt-4 inline-block"
                >
                    📖 View API Documentation →
                </a>
            )}
        </div>
    );
}
