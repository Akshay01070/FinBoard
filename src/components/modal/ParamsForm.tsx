'use client';

import React from 'react';
import { ApiEndpoint, ParamDef } from '@/lib/providers';

interface ParamsFormProps {
    endpoint: ApiEndpoint;
    params: Record<string, string>;
    onChange: (params: Record<string, string>) => void;
    onBack: () => void;
    onNext: () => void;
}

export function ParamsForm({
    endpoint,
    params,
    onChange,
    onBack,
    onNext
}: ParamsFormProps) {
    // Filter out hidden params (like 'function' for Alpha Vantage)
    const visibleParams = endpoint.params.filter(
        p => p.id !== 'function' && p.id !== 'url'
    );

    const handleParamChange = (paramId: string, value: string) => {
        onChange({ ...params, [paramId]: value });
    };

    const isValid = endpoint.params
        .filter(p => p.required)
        .every(p => params[p.id] || p.default);

    return (
        <div className="params-form">
            <div className="flex items-center gap-3 mb-4">
                <button
                    onClick={onBack}
                    className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                    ← Back
                </button>
                <h3 className="text-lg font-semibold">{endpoint.name}</h3>
            </div>

            <p className="text-sm text-[var(--text-secondary)] mb-4">
                Configure the parameters for this endpoint:
            </p>

            {visibleParams.length === 0 ? (
                <div className="bg-[var(--bg-secondary)] rounded-lg p-4 text-center text-[var(--text-secondary)]">
                    No additional parameters needed. Click Next to continue.
                </div>
            ) : (
                <div className="space-y-4">
                    {visibleParams.map((param) => (
                        <ParamInput
                            key={param.id}
                            param={param}
                            value={params[param.id] || param.default || ''}
                            onChange={(value) => handleParamChange(param.id, value)}
                        />
                    ))}
                </div>
            )}

            <button
                onClick={onNext}
                disabled={!isValid}
                className="btn-primary w-full mt-6"
            >
                Next: Configure Widget →
            </button>
        </div>
    );
}

interface ParamInputProps {
    param: ParamDef;
    value: string;
    onChange: (value: string) => void;
}

function ParamInput({ param, value, onChange }: ParamInputProps) {
    return (
        <div className="param-input">
            <label className="block text-sm font-medium mb-1">
                {param.name}
                {param.required && <span className="text-red-500 ml-1">*</span>}
            </label>

            {param.type === 'select' && param.options ? (
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                >
                    {param.options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            ) : (
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={param.placeholder}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                />
            )}
        </div>
    );
}
