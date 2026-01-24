'use client';

import { useState, useEffect } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { DisplayMode, ChartType, FieldConfig, FlattenedField } from '@/types';
import { flattenObject } from '@/lib/dataMapper';
import { providers, ApiProvider, buildApiUrl } from '@/lib/providers';
import FieldSelector from './FieldSelector';

export default function AddWidgetModal() {
    const { isModalOpen, closeModal, addWidget, widgets, editingWidgetId, updateWidget } = useDashboardStore();

    const editingWidget = editingWidgetId ? widgets.find((w) => w.id === editingWidgetId) : null;

    // Form state
    const [name, setName] = useState('');
    const [apiUrl, setApiUrl] = useState('');
    const [refreshInterval, setRefreshInterval] = useState(30);
    const [displayMode, setDisplayMode] = useState<DisplayMode>('card');
    const [chartType, setChartType] = useState<ChartType>('line');
    const [selectedFields, setSelectedFields] = useState<FieldConfig[]>([]);

    // Provider selection state
    const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
    const [endpointParams, setEndpointParams] = useState<Record<string, string>>({});

    // API test state
    const [isTestingApi, setIsTestingApi] = useState(false);
    const [apiTestResult, setApiTestResult] = useState<{
        success: boolean;
        error?: string;
        fields?: FlattenedField[];
    } | null>(null);

    // Get selected provider
    const selectedProvider = providers.find(p => p.id === selectedProviderId);

    // Filtered providers to show as buttons (exclude custom)
    const providerButtons = providers.filter(p => p.id !== 'custom');

    // Populate form when editing
    useEffect(() => {
        if (editingWidget) {
            setName(editingWidget.name);
            setApiUrl(editingWidget.apiUrl);
            setRefreshInterval(editingWidget.refreshInterval);
            setDisplayMode(editingWidget.displayMode);
            setChartType(editingWidget.chartType || 'line');
            setSelectedFields(editingWidget.selectedFields);
            handleTestApiWithUrl(editingWidget.apiUrl);
        } else {
            resetForm();
        }
    }, [editingWidget, isModalOpen]);

    // Auto-update URL when provider changes
    useEffect(() => {
        if (selectedProvider && selectedProvider.id !== 'custom' && selectedProvider.endpoints.length > 0) {
            const endpoint = selectedProvider.endpoints[0];
            const defaultParams: Record<string, string> = {};
            endpoint.params.forEach(param => {
                if (param.default) defaultParams[param.id] = param.default;
            });
            setEndpointParams(defaultParams);

            const url = buildApiUrl(selectedProvider, endpoint, defaultParams);
            setApiUrl(url);
            setName(endpoint.name);
            setDisplayMode(endpoint.displayMode);
            if (endpoint.chartType) setChartType(endpoint.chartType);
            if (endpoint.defaultFields.length > 0) {
                setSelectedFields(endpoint.defaultFields);
            }
        }
    }, [selectedProviderId, selectedProvider]);

    const resetForm = () => {
        setName('');
        setApiUrl('');
        setRefreshInterval(30);
        setDisplayMode('card');
        setChartType('line');
        setSelectedFields([]);
        setSelectedProviderId(null);
        setEndpointParams({});
        setApiTestResult(null);
    };

    const handleProviderSelect = (providerId: string) => {
        setSelectedProviderId(providerId);
        setApiTestResult(null);
    };

    const handleTestApiWithUrl = async (url: string) => {
        if (!url.trim()) return;

        setIsTestingApi(true);
        setApiTestResult(null);

        try {
            let response;
            if (selectedProviderId && selectedProviderId !== 'custom' && selectedProvider) {
                response = await fetch('/api/data', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        providerId: selectedProviderId,
                        endpointId: selectedProvider.endpoints[0]?.id,
                        params: endpointParams,
                    }),
                });
            } else {
                response = await fetch('/api/proxy', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url }),
                });
            }

            const result = await response.json();

            if (response.ok) {
                const data = result.data || result;
                const flattened = flattenObject(data);
                setApiTestResult({
                    success: true,
                    fields: flattened,
                });
            } else {
                setApiTestResult({
                    success: false,
                    error: result.error || 'API request failed',
                });
            }
        } catch (error) {
            setApiTestResult({
                success: false,
                error: error instanceof Error ? error.message : 'Network error',
            });
        }

        setIsTestingApi(false);
    };

    const handleTestApi = () => handleTestApiWithUrl(apiUrl);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim() || !apiUrl.trim()) return;

        const widgetData = {
            name: name.trim(),
            apiUrl: apiUrl.trim(),
            refreshInterval,
            displayMode,
            chartType: displayMode === 'chart' ? chartType : undefined,
            selectedFields,
        };

        if (editingWidgetId) {
            updateWidget(editingWidgetId, widgetData);
        } else {
            addWidget(widgetData);
        }

        closeModal();
    };

    if (!isModalOpen) return null;

    return (
        <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[var(--border-color)] p-4">
                    <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                        {editingWidgetId ? 'Edit Widget' : 'Add New Widget'}
                    </h2>
                    <button
                        type="button"
                        onClick={closeModal}
                        className="rounded p-1 text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="max-h-[65vh] overflow-y-auto p-4">
                    <form id="widget-form" onSubmit={handleSubmit} className="space-y-5">
                        {/* Widget Name */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
                                Widget Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Bitcoin"
                                className="input-field"
                                required
                            />
                        </div>

                        {/* API Provider - Toggle Buttons */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
                                API Provider
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {providerButtons.map((provider) => (
                                    <button
                                        key={provider.id}
                                        type="button"
                                        onClick={() => handleProviderSelect(provider.id)}
                                        className={`provider-toggle-btn ${selectedProviderId === provider.id ? 'active' : ''}`}
                                    >
                                        {provider.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* API URL */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
                                API URL
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="url"
                                    value={apiUrl}
                                    onChange={(e) => {
                                        setApiUrl(e.target.value);
                                        setApiTestResult(null);
                                    }}
                                    placeholder="https://api.coinbase.com/v2/exchange-rates?currency=BTC"
                                    className="input-field flex-1"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={handleTestApi}
                                    disabled={isTestingApi || !apiUrl.trim()}
                                    className="btn-primary flex items-center gap-2 whitespace-nowrap"
                                >
                                    {isTestingApi ? (
                                        <div className="spinner h-4 w-4" />
                                    ) : (
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                    )}
                                    Test
                                </button>
                            </div>

                            {/* API Test Result */}
                            {apiTestResult && (
                                <div className={`mt-2 ${apiTestResult.success ? 'success-message' : 'error-message'}`}>
                                    {apiTestResult.success ? (
                                        <>
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className="text-sm">
                                                API connection successful! {apiTestResult.fields?.length} top-level fields found.
                                            </span>
                                        </>
                                    ) : (
                                        <span className="text-sm">{apiTestResult.error}</span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Refresh Interval */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
                                Refresh Interval (seconds)
                            </label>
                            <input
                                type="number"
                                value={refreshInterval}
                                onChange={(e) => setRefreshInterval(Math.max(0, parseInt(e.target.value) || 0))}
                                min={0}
                                placeholder="30"
                                className="input-field"
                            />
                        </div>

                        {/* Select Fields to Display - only show after successful API test */}
                        {apiTestResult?.success && apiTestResult.fields && (
                            <>
                                <div className="border-t border-[var(--border-color)] pt-4">
                                    <h3 className="mb-3 text-sm font-medium text-[var(--text-secondary)]">
                                        Select Fields to Display
                                    </h3>

                                    {/* Display Mode */}
                                    <div className="mb-4">
                                        <label className="mb-2 block text-sm text-[var(--text-muted)]">
                                            Display Mode
                                        </label>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setDisplayMode('card')}
                                                className={`display-mode-btn ${displayMode === 'card' ? 'active' : ''}`}
                                            >
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                                </svg>
                                                Card
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setDisplayMode('table')}
                                                className={`display-mode-btn ${displayMode === 'table' ? 'active' : ''}`}
                                            >
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                </svg>
                                                Table
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setDisplayMode('chart')}
                                                className={`display-mode-btn ${displayMode === 'chart' ? 'active' : ''}`}
                                            >
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                                                </svg>
                                                Chart
                                            </button>
                                        </div>
                                    </div>

                                    {/* Chart Type - only show when Chart mode is selected */}
                                    {displayMode === 'chart' && (
                                        <div className="mb-4">
                                            <label className="mb-2 block text-sm text-[var(--text-muted)]">
                                                Chart Type
                                            </label>
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setChartType('line')}
                                                    className={`display-mode-btn ${chartType === 'line' ? 'active' : ''}`}
                                                >
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4" />
                                                    </svg>
                                                    Line Chart
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setChartType('candlestick')}
                                                    className={`display-mode-btn ${chartType === 'candlestick' ? 'active' : ''}`}
                                                >
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V5M5 8v8m14-6v6M15 5v14" />
                                                    </svg>
                                                    Candlestick
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <FieldSelector
                                    fields={apiTestResult.fields}
                                    selectedFields={selectedFields}
                                    onFieldsChange={setSelectedFields}
                                    displayMode={displayMode}
                                />
                            </>
                        )}
                    </form>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 border-t border-[var(--border-color)] p-4">
                    <button
                        type="button"
                        onClick={closeModal}
                        className="btn-secondary"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="widget-form"
                        disabled={!name.trim() || !apiUrl.trim()}
                        className="btn-primary"
                    >
                        {editingWidgetId ? 'Save Changes' : 'Add Widget'}
                    </button>
                </div>
            </div>
        </div>
    );
}
