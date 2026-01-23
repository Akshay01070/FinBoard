'use client';

import { useState, useMemo } from 'react';
import { Widget } from '@/types';
import { getValueByPath, formatValue } from '@/lib/dataMapper';

interface TableWidgetProps {
    widget: Widget;
    data: unknown;
}

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
                label: key,
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
            <div className="text-center text-[var(--text-muted)]">
                No data available
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Search and count */}
            <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1">
                    <svg
                        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search table..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="input-field pl-10"
                    />
                </div>
                <span className="text-sm text-[var(--text-muted)]">
                    {processedData.length} of {tableData.length} items
                </span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-[var(--border-color)]">
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    onClick={() => handleSort(col.path || col.key)}
                                    className="cursor-pointer px-3 py-2 text-left text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                                >
                                    <div className="flex items-center gap-1">
                                        {col.label}
                                        {sortColumn === (col.path || col.key) && (
                                            <svg
                                                className={`h-4 w-4 transition-transform ${sortDirection === 'desc' ? 'rotate-180' : ''}`}
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
                                className="border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--bg-secondary)]"
                            >
                                {columns.map((col) => {
                                    const value = getValueByPath(item, col.path) ?? getValueByPath(item, col.key);
                                    return (
                                        <td
                                            key={col.key}
                                            className="px-3 py-2 text-sm text-[var(--text-primary)]"
                                        >
                                            {formatValue(value, col.format)}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="rounded p-1 text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] disabled:opacity-50"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <span className="text-sm text-[var(--text-secondary)]">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="rounded p-1 text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] disabled:opacity-50"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            )}
        </div>
    );
}
