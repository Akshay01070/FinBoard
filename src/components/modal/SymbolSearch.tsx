'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface SearchResult {
    symbol: string;
    name: string;
    type?: string;
}

interface SymbolSearchProps {
    providerId: string;
    value: string;
    onChange: (value: string, name?: string) => void;
    placeholder?: string;
    disabled?: boolean;
}

export default function SymbolSearch({
    providerId,
    value,
    onChange,
    placeholder = 'Search for a symbol...',
    disabled = false,
}: SymbolSearchProps) {
    const [query, setQuery] = useState(value);
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [error, setError] = useState<string | null>(null);

    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    // Debounced search
    const search = useCallback(async (searchQuery: string) => {
        if (searchQuery.length < 2) {
            setResults([]);
            setIsOpen(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `/api/search?provider=${encodeURIComponent(providerId)}&q=${encodeURIComponent(searchQuery)}`
            );

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Search failed');
            }

            const data = await response.json();
            setResults(data.results || []);
            setIsOpen(true);
            setSelectedIndex(-1);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Search failed');
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    }, [providerId]);

    // Handle input change with debounce
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newQuery = e.target.value;
        setQuery(newQuery);

        // Clear previous debounce
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        // Debounce search
        debounceRef.current = setTimeout(() => {
            search(newQuery);
        }, 300);
    };

    // Handle selection
    const handleSelect = (result: SearchResult) => {
        setQuery(result.symbol);
        onChange(result.symbol, result.name);
        setIsOpen(false);
        setResults([]);
    };

    // Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen || results.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex((prev) =>
                    prev < results.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && selectedIndex < results.length) {
                    handleSelect(results[selectedIndex]);
                }
                break;
            case 'Escape':
                e.preventDefault();
                setIsOpen(false);
                break;
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                inputRef.current &&
                !inputRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Sync external value
    useEffect(() => {
        setQuery(value);
    }, [value]);

    // Cleanup debounce on unmount
    useEffect(() => {
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, []);

    return (
        <div className="relative">
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => results.length > 0 && setIsOpen(true)}
                    placeholder={placeholder}
                    disabled={disabled}
                    className="input-field pr-10"
                    autoComplete="off"
                />
                {isLoading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="spinner h-4 w-4" />
                    </div>
                )}
                {!isLoading && query && (
                    <button
                        type="button"
                        onClick={() => {
                            setQuery('');
                            onChange('');
                            setResults([]);
                            inputRef.current?.focus();
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Error message */}
            {error && (
                <p className="mt-1 text-xs text-red-500">{error}</p>
            )}

            {/* Dropdown */}
            {isOpen && results.length > 0 && (
                <div
                    ref={dropdownRef}
                    className="absolute z-50 mt-1 w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] shadow-lg"
                >
                    <ul className="max-h-60 overflow-auto py-1">
                        {results.map((result, index) => (
                            <li key={`${result.symbol}-${index}`}>
                                <button
                                    type="button"
                                    onClick={() => handleSelect(result)}
                                    className={`w-full px-3 py-2 text-left transition-colors ${index === selectedIndex
                                        ? 'bg-[var(--accent-primary)] text-white'
                                        : 'hover:bg-[var(--bg-hover)]'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">{result.symbol}</span>
                                        {result.type && (
                                            <span className="text-xs opacity-60">{result.type}</span>
                                        )}
                                    </div>
                                    <p className="text-sm opacity-70 truncate">{result.name}</p>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* No results */}
            {isOpen && query.length >= 2 && !isLoading && results.length === 0 && !error && (
                <div className="absolute z-50 mt-1 w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] p-3 text-center text-sm text-[var(--text-muted)]">
                    No results found for &quot;{query}&quot;
                </div>
            )}
        </div>
    );
}
