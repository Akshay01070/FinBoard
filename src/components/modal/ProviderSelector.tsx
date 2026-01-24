'use client';

import React from 'react';
import { providers, ApiProvider } from '@/lib/providers';

interface ProviderSelectorProps {
    selectedProvider: string | null;
    onSelect: (provider: ApiProvider) => void;
}

export function ProviderSelector({ selectedProvider, onSelect }: ProviderSelectorProps) {
    const categoryOrder = ['crypto', 'stocks', 'indian', 'custom'] as const;

    const categoryLabels: Record<string, string> = {
        crypto: '🪙 Cryptocurrency',
        stocks: '📊 Stocks & Forex',
        indian: '🇮🇳 Indian Market',
        custom: '🔗 Custom',
    };

    const groupedProviders = categoryOrder.reduce((acc, category) => {
        const categoryProviders = providers.filter(p => p.category === category);
        if (categoryProviders.length > 0) {
            acc[category] = categoryProviders;
        }
        return acc;
    }, {} as Record<string, ApiProvider[]>);

    return (
        <div className="provider-selector">
            <h3 className="text-lg font-semibold mb-4">Select API Provider</h3>

            <div className="space-y-6">
                {Object.entries(groupedProviders).map(([category, categoryProviders]) => (
                    <div key={category}>
                        <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-2">
                            {categoryLabels[category] || category}
                        </h4>

                        <div className="grid grid-cols-2 gap-3">
                            {categoryProviders.map((provider) => (
                                <button
                                    key={provider.id}
                                    onClick={() => onSelect(provider)}
                                    className={`provider-card ${selectedProvider === provider.id ? 'selected' : ''}`}
                                >
                                    <span className="text-2xl mb-2">{provider.icon}</span>
                                    <span className="font-medium">{provider.name}</span>
                                    <span className="text-xs text-[var(--text-secondary)] text-center mt-1">
                                        {provider.description.length > 40
                                            ? provider.description.slice(0, 40) + '...'
                                            : provider.description}
                                    </span>
                                    {provider.requiresApiKey && (
                                        <span className="text-xs text-amber-500 mt-1">🔑 API Key Required</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
