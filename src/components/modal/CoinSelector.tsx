'use client';

import { useState, useEffect, useRef } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { buildApiUrl, getProvider } from '@/lib/providers';

interface CoinSearchResult {
    id: string;
    name: string;
    symbol: string;
    thumb?: string;
    [key: string]: unknown;
}

interface CoinSelectorProps {
    providerId: string;
    selectedCoins: string[]; // Array of coin IDs
    onChange: (coins: string[]) => void;
    placeholder?: string;
}

export default function CoinSelector({
    providerId,
    selectedCoins,
    onChange,
    placeholder = 'Search coins (e.g. bitcoin)...',
}: CoinSelectorProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<CoinSearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const debouncedSearch = useDebounce(searchTerm, 500);

    const provider = getProvider(providerId);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch search results
    useEffect(() => {
        const search = async () => {
            if (!debouncedSearch.trim() || !provider?.searchEndpoint) {
                setResults([]);
                return;
            }

            setIsLoading(true);
            try {
                // Determine search URL
                let searchUrl = '';
                if (provider.baseUrl) {
                    searchUrl = `${provider.baseUrl}${provider.searchEndpoint.path}?${provider.searchEndpoint.queryParam}=${encodeURIComponent(debouncedSearch)}`;
                } else if (provider.id === 'custom') {
                    // Custom provider logic handled elsewhere or skipped
                    setIsLoading(false);
                    return;
                }

                // Proxy request
                const response = await fetch('/api/proxy', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url: searchUrl }),
                });

                const data = await response.json();

                // Parse results based on provider config
                let rawResults = data;
                if (provider.searchEndpoint.resultsPath) {
                    // Navigate down the path (e.g., 'coins' or 'result')
                    const parts = provider.searchEndpoint.resultsPath.split('.');
                    for (const part of parts) {
                        if (rawResults && typeof rawResults === 'object') {
                            rawResults = rawResults[part];
                        }
                    }
                }

                if (Array.isArray(rawResults)) {
                    const parsedResults = rawResults.slice(0, 10).map((item) => ({
                        id: item[provider.searchEndpoint!.symbolField] || item.id, // Use configured field or fallback
                        name: item[provider.searchEndpoint!.nameField] || item.name,
                        symbol: item.symbol || '',
                        thumb: item.thumb || item.large || '',
                    }));
                    setResults(parsedResults);
                    setIsOpen(true);
                } else {
                    setResults([]);
                }
            } catch (error) {
                console.error('Search failed:', error);
                setResults([]);
            } finally {
                setIsLoading(false);
            }
        };

        search();
    }, [debouncedSearch, provider]);

    const handleSelect = (coin: CoinSearchResult) => {
        if (!selectedCoins.includes(coin.id)) {
            onChange([...selectedCoins, coin.id]);
        }
        setSearchTerm('');
        setIsOpen(false);
    };

    const handleRemove = (coinId: string) => {
        onChange(selectedCoins.filter(id => id !== coinId));
    };

    return (
        <div className="space-y-2" ref={wrapperRef}>
            {/* Search Input */}
            <div className="relative">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => {
                        if (results.length > 0) setIsOpen(true);
                    }}
                    placeholder={placeholder}
                    className="input-field w-full pl-9"
                />
                <svg
                    className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {isLoading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="spinner h-4 w-4" />
                    </div>
                )}

                {/* Dropdown */}
                {isOpen && results.length > 0 && (
                    <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-y-auto rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] shadow-lg">
                        {results.map((coin) => (
                            <button
                                key={coin.id}
                                type="button"
                                onClick={() => handleSelect(coin)}
                                className="flex w-full items-center gap-3 px-4 py-2 text-left hover:bg-[var(--bg-hover)]"
                            >
                                {coin.thumb && <img src={coin.thumb} alt={coin.symbol} className="h-5 w-5 rounded-full" />}
                                <div>
                                    <p className="text-sm font-medium text-[var(--text-primary)]">{coin.name}</p>
                                    <p className="text-xs uppercase text-[var(--text-muted)]">{coin.symbol}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Selected Chips */}
            {selectedCoins.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {selectedCoins.map((coinId) => (
                        <div key={coinId} className="flex items-center gap-1 rounded-full bg-[var(--accent-primary)]/10 px-3 py-1 text-xs font-medium text-[var(--accent-primary)]">
                            <span>{coinId}</span>
                            <button
                                type="button"
                                onClick={() => handleRemove(coinId)}
                                className="ml-1 rounded-full p-0.5 hover:bg-[var(--accent-primary)]/20"
                            >
                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={() => onChange([])}
                        className="text-xs text-[var(--text-muted)] hover:text-red-400"
                    >
                        Clear All
                    </button>
                </div>
            )}
        </div>
    );
}
