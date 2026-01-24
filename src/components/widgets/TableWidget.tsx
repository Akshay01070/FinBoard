'use client';

import { useState, useMemo } from 'react';
import { Widget } from '@/types';
import { getValueByPath, formatValue } from '@/lib/dataMapper';

interface TableWidgetProps {
    widget: Widget;
    data: unknown;
}

// Format percentage with color
const formatPercentChange = (value: number | string): { text: string; isPositive: boolean } => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return { text: '0.00%', isPositive: true };
    const isPositive = num >= 0;
    return {
        text: `${num >= 0 ? '' : ''}${num.toFixed(2)}%`,
        isPositive,
    };
};

export default function TableWidget({ widget, data }: TableWidgetProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Extract array data from the first field that is an array
    const tableData = useMemo(() => {
        if (!data) return [];

        // If data is already an array, use it
        if (Array.isArray(data)) {
            return data;
        }

        // Try to find an array in the data
        for (const field of widget.selectedFields) {
            const value = getValueByPath(data, field.path);
            if (Array.isArray(value)) {
                return value;
            }
        }

        // If no array found, wrap single data in array
        return [data];
    }, [data, widget.selectedFields]);

    // Get column headers from selected fields or first data item
    const columns = useMemo(() => {
        if (widget.selectedFields.length > 0) {
            return widget.selectedFields.map((f) => ({
                key: f.path.split('.').pop() || f.path,
                label: f.label,
                path: f.path,
                format: f.format,
            }));
        }

        // Auto-detect columns from first item
        if (tableData.length > 0 && typeof tableData[0] === 'object') {
            return Object.keys(tableData[0] as Record<string, unknown>).map((key) => ({
                key,
                label: key.toUpperCase(),
                path: key,
                format: undefined,
            }));
        }

        return [];
    }, [widget.selectedFields, tableData]);

    // Filter and sort data
    const processedData = useMemo(() => {
        let result = [...tableData];

        // Filter by search term
        if (searchTerm) {
            result = result.filter((item) => {
                return columns.some((col) => {
                    const value = getValueByPath(item, col.path) ?? getValueByPath(item, col.key);
                    return String(value).toLowerCase().includes(searchTerm.toLowerCase());
                });
            });
        }

        // Sort
        if (sortColumn) {
            result.sort((a, b) => {
                const aVal = getValueByPath(a, sortColumn) ?? '';
                const bVal = getValueByPath(b, sortColumn) ?? '';

                if (typeof aVal === 'number' && typeof bVal === 'number') {
                    return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
                }

                const comparison = String(aVal).localeCompare(String(bVal));
                return sortDirection === 'asc' ? comparison : -comparison;
            });
        }

        return result;
    }, [tableData, searchTerm, sortColumn, sortDirection, columns]);

    // Pagination
    const totalPages = Math.ceil(processedData.length / itemsPerPage);
    const paginatedData = processedData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleSort = (key: string) => {
        if (sortColumn === key) {
            setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortColumn(key);
            setSortDirection('asc');
        }
    };

    if (tableData.length === 0) {
        return (
            <div className="flex h-32 items-center justify-center text-[var(--text-muted)]">
                No data available
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col">
            {/* Search Bar */}
            <div className="mb-4">
                <div className="relative">
                    <svg
                        className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search companies or tickers..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] py-3 pl-12 pr-4 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:outline-none"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-[var(--border-color)]">
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    onClick={() => handleSort(col.path || col.key)}
                                    className="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                                >
                                    <div className="flex items-center gap-1">
                                        {col.label}
                                        {sortColumn === (col.path || col.key) && (
                                            <svg
                                                className={`h-3 w-3 transition-transform ${sortDirection === 'desc' ? 'rotate-180' : ''}`}
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                            </svg>
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map((item, rowIndex) => (
                            <tr
                                key={rowIndex}
                                className="border-b border-[var(--border-color)]/50 transition-colors hover:bg-[var(--bg-secondary)]"
                            >
                                {columns.map((col, colIndex) => {
                                    const value = getValueByPath(item, col.path) ?? getValueByPath(item, col.key);
                                    const isPercentColumn = col.label.toLowerCase().includes('change') || col.label.toLowerCase().includes('percent');

                                    // Special styling for first column (company name)
                                    if (colIndex === 0) {
                                        return (
                                            <td key={col.key} className="px-4 py-3">
                                                <span className="font-medium text-[var(--text-primary)]">
                                                    {String(value)}
                                                </span>
                                            </td>
                                        );
                                    }

                                    // Percentage column with color
                                    if (isPercentColumn && typeof value === 'number') {
                                        const { text, isPositive } = formatPercentChange(value);
                                        return (
                                            <td key={col.key} className="px-4 py-3">
                                                <span className={isPositive ? 'text-emerald-400' : 'text-pink-400'}>
                                                    {text}
                                                </span>
                                            </td>
                                        );
                                    }

                                    return (
                                        <td key={col.key} className="px-4 py-3 text-sm text-[var(--text-secondary)]">
                                            {formatValue(value, col.format)}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Footer */}
            <div className="mt-4 flex items-center justify-between border-t border-[var(--border-color)] pt-4">
                <span className="text-sm text-[var(--text-muted)]">
                    SHOWING <span className="text-[var(--text-primary)]">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="text-[var(--text-primary)]">{Math.min(currentPage * itemsPerPage, processedData.length)}</span> OF <span className="text-[var(--accent-primary)]">{processedData.length}</span>
                </span>

                {totalPages > 1 && (
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="flex h-8 w-8 items-center justify-center rounded text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] disabled:opacity-50"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>

                        {/* Page numbers */}
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const pageNum = i + 1;
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={`flex h-8 w-8 items-center justify-center rounded text-sm font-medium transition-colors ${currentPage === pageNum
                                            ? 'bg-[var(--accent-primary)] text-white'
                                            : 'text-[var(--text-muted)] hover:bg-[var(--bg-secondary)]'
                                        }`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}

                        <button
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="flex h-8 w-8 items-center justify-center rounded text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] disabled:opacity-50"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
