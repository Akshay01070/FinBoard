'use client';

import { useState } from 'react';
import SymbolSearch from './SymbolSearch';
import { WatchlistItem } from '@/types';

interface WatchlistSelectorProps {
    providerId: string;
    items: WatchlistItem[];
    onChange: (items: WatchlistItem[]) => void;
    maxItems?: number;
}

export default function WatchlistSelector({
    providerId,
    items,
    onChange,
    maxItems = 10,
}: WatchlistSelectorProps) {
    const [searchValue, setSearchValue] = useState('');

    const handleAddItem = (symbol: string, name?: string) => {
        if (!symbol || items.length >= maxItems) return;

        // Don't add duplicates
        if (items.some(item => item.symbol.toLowerCase() === symbol.toLowerCase())) {
            setSearchValue('');
            return;
        }

        const newItem: WatchlistItem = {
            symbol: symbol.toUpperCase(),
            name: name || symbol.toUpperCase(),
        };

        onChange([...items, newItem]);
        setSearchValue('');
    };

    const handleRemoveItem = (symbol: string) => {
        onChange(items.filter(item => item.symbol !== symbol));
    };

    return (
        <div className="space-y-3">
            {/* Selected items */}
            {items.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {items.map((item) => (
                        <div
                            key={item.symbol}
                            className="flex items-center gap-2 rounded-full bg-[var(--accent-primary)] px-3 py-1.5 text-sm text-white"
                        >
                            <span className="font-medium">{item.symbol}</span>
                            <button
                                type="button"
                                onClick={() => handleRemoveItem(item.symbol)}
                                className="hover:text-red-200"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Search input */}
            {items.length < maxItems && (
                <SymbolSearch
                    providerId={providerId}
                    value={searchValue}
                    onChange={handleAddItem}
                    placeholder={`Search to add (${items.length}/${maxItems})`}
                />
            )}

            {items.length >= maxItems && (
                <p className="text-xs text-[var(--text-muted)]">
                    Maximum {maxItems} items reached
                </p>
            )}
        </div>
    );
}
