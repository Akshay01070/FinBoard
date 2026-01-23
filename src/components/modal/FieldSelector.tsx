'use client';

import { useState, useMemo } from 'react';
import { FieldConfig, FlattenedField, DisplayMode } from '@/types';

interface FieldSelectorProps {
    fields: FlattenedField[];
    selectedFields: FieldConfig[];
    onFieldsChange: (fields: FieldConfig[]) => void;
    displayMode: DisplayMode;
}

export default function FieldSelector({
    fields,
    selectedFields,
    onFieldsChange,
    displayMode,
}: FieldSelectorProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [showArraysOnly, setShowArraysOnly] = useState(false);

    const filteredFields = useMemo(() => {
        let result = fields;

        if (showArraysOnly) {
            result = result.filter((f) => f.isArray);
        }

        if (searchTerm) {
            result = result.filter((f) =>
                f.path.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        return result;
    }, [fields, searchTerm, showArraysOnly]);

    const handleAddField = (field: FlattenedField) => {
        if (!selectedFields.find((f) => f.path === field.path)) {
            const label = field.path.split('.').pop() || field.path;
            onFieldsChange([
                ...selectedFields,
                {
                    path: field.path,
                    label,
                    format: inferFormat(field),
                },
            ]);
        }
    };

    const handleRemoveField = (path: string) => {
        onFieldsChange(selectedFields.filter((f) => f.path !== path));
    };

    const handleUpdateLabel = (path: string, label: string) => {
        onFieldsChange(
            selectedFields.map((f) =>
                f.path === path ? { ...f, label } : f
            )
        );
    };

    const inferFormat = (field: FlattenedField): FieldConfig['format'] => {
        const path = field.path.toLowerCase();
        const value = field.value;

        // Currency fields
        if (path.includes('price') || path.includes('amount') || path.includes('cost') || path.includes('usd') || path.includes('eur')) {
            return 'currency';
        }
        // Only apply percentage to fields that explicitly contain 'percent' or 'pct'
        if (path.includes('percent') || path.includes('pct') || path.includes('_change')) {
            return 'percentage';
        }
        // Default to number for numeric values
        if (typeof value === 'number' || (typeof value === 'string' && !isNaN(parseFloat(value)))) {
            return 'number';
        }
        return 'text';
    };

    const getValuePreview = (value: unknown): string => {
        if (value === null || value === undefined) return 'null';
        if (Array.isArray(value)) return `Array[${value.length}]`;
        if (typeof value === 'object') return 'Object';
        if (typeof value === 'string' && value.length > 30) {
            return value.substring(0, 30) + '...';
        }
        return String(value);
    };

    return (
        <div className="space-y-4">
            {/* Search and filters */}
            <div className="space-y-2">
                <div className="relative">
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
                        placeholder="Search for fields..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-field pl-10"
                    />
                </div>

                {displayMode === 'table' && (
                    <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                        <input
                            type="checkbox"
                            checked={showArraysOnly}
                            onChange={(e) => setShowArraysOnly(e.target.checked)}
                            className="rounded border-[var(--border-color)]"
                        />
                        Show arrays only (for table view)
                    </label>
                )}
            </div>

            {/* Available fields */}
            <div>
                <label className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
                    Available Fields
                </label>
                <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] p-2">
                    {filteredFields.length === 0 ? (
                        <p className="py-4 text-center text-sm text-[var(--text-muted)]">
                            No fields found
                        </p>
                    ) : (
                        filteredFields.map((field) => {
                            const isSelected = selectedFields.some((f) => f.path === field.path);
                            return (
                                <div
                                    key={field.path}
                                    className={`flex items-center justify-between rounded-lg px-3 py-2 ${isSelected
                                        ? 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]'
                                        : 'hover:bg-[var(--bg-card)]'
                                        }`}
                                >
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                                            {field.path}
                                        </p>
                                        <p className="truncate text-xs text-[var(--text-muted)]">
                                            {field.type} | {getValuePreview(field.value)}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => isSelected ? handleRemoveField(field.path) : handleAddField(field)}
                                        className={`ml-2 rounded p-1 transition-colors ${isSelected
                                            ? 'text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/20'
                                            : 'text-[var(--text-muted)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)]'
                                            }`}
                                    >
                                        {isSelected ? (
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        ) : (
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Selected fields */}
            {selectedFields.length > 0 && (
                <div>
                    <label className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
                        Selected Fields
                    </label>
                    <div className="space-y-2">
                        {selectedFields.map((field) => (
                            <div
                                key={field.path}
                                className="flex items-center gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] p-2"
                            >
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-xs text-[var(--text-muted)]">
                                        {field.path}
                                    </p>
                                    <input
                                        type="text"
                                        value={field.label}
                                        onChange={(e) => handleUpdateLabel(field.path, e.target.value)}
                                        className="w-full border-none bg-transparent text-sm font-medium text-[var(--text-primary)] focus:outline-none"
                                        placeholder="Field label"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveField(field.path)}
                                    className="rounded p-1 text-red-500 transition-colors hover:bg-red-500/10"
                                >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
