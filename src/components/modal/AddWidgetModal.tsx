'use client';

import { useState, useEffect } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { DisplayMode, ChartType, ChartInterval, CardStyle, FieldConfig, FlattenedField, WatchlistItem } from '@/types';
import { flattenObject } from '@/lib/dataMapper';
import { providers, ApiProvider, ApiEndpoint, buildApiUrl, getEndpoint } from '@/lib/providers';
import FieldSelector from './FieldSelector';
import SymbolSearch from './SymbolSearch';
import WatchlistSelector from './WatchlistSelector';

type RefreshOption = { value: number; label: string };
const REFRESH_OPTIONS: RefreshOption[] = [
    { value: 30, label: '30 seconds' },
    { value: 60, label: '1 minute' },
    { value: 300, label: '5 minutes' },
    { value: 900, label: '15 minutes' },
    { value: 1800, label: '30 minutes' },
];

const CARD_STYLES: { id: CardStyle; name: string; description: string }[] = [
    { id: 'watchlist', name: 'Watchlist', description: 'Track multiple assets' },
    { id: 'market-gainers', name: 'Market Gainers', description: 'Top 10 performers' },
    { id: 'financial-data', name: 'Financial Data', description: 'Single asset info' },
];

const CHART_INTERVALS: { value: ChartInterval; label: string }[] = [
    { value: '1D', label: '1 Day' },
    { value: '1W', label: '1 Week' },
    { value: '1M', label: '1 Month' },
    { value: '1Y', label: '1 Year' },
];

export default function AddWidgetModal() {
    const { isModalOpen, closeModal, addWidget, widgets, editingWidgetId, updateWidget } = useDashboardStore();

    const editingWidget = editingWidgetId ? widgets.find((w) => w.id === editingWidgetId) : null;

    // Form state
    const [name, setName] = useState('');
    const [widgetType, setWidgetType] = useState<DisplayMode>('card');
    const [cardStyle, setCardStyle] = useState<CardStyle>('financial-data');
    const [chartType, setChartType] = useState<ChartType>('line');
    const [chartInterval, setChartInterval] = useState<ChartInterval>('1W');
    const [refreshInterval, setRefreshInterval] = useState(30);
    const [selectedFields, setSelectedFields] = useState<FieldConfig[]>([]);

    // Provider state
    const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
    const [selectedEndpointId, setSelectedEndpointId] = useState<string | null>(null);
    const [endpointParams, setEndpointParams] = useState<Record<string, string>>({});
    const [apiUrl, setApiUrl] = useState('');

    // Watchlist state
    const [watchlistItems, setWatchlistItems] = useState<WatchlistItem[]>([]);

    // API test state
    const [isTestingApi, setIsTestingApi] = useState(false);
    const [apiTestResult, setApiTestResult] = useState<{
        success: boolean;
        error?: string;
        fields?: FlattenedField[];
    } | null>(null);

    // Computed values
    const selectedProvider = providers.find(p => p.id === selectedProviderId);
    const selectedEndpoint = selectedProvider?.endpoints.find(e => e.id === selectedEndpointId);

    // Filter providers by widget type compatibility
    const availableProviders = providers.filter(p => {
        if (p.id === 'custom') return true; // Always show custom
        if (widgetType === 'card') return p.supportsCard;
        if (widgetType === 'table') return p.supportsTable;
        if (widgetType === 'chart') return p.supportsChart;
        return true;
    });

    // Populate form when editing
    useEffect(() => {
        if (editingWidget) {
            setName(editingWidget.name);
            setWidgetType(editingWidget.displayMode);
            setCardStyle(editingWidget.cardStyle || 'financial-data');
            setChartType(editingWidget.chartType || 'line');
            setChartInterval(editingWidget.chartInterval || '1W');
            setRefreshInterval(editingWidget.refreshInterval);
            setSelectedFields(editingWidget.selectedFields);
            setApiUrl(editingWidget.apiUrl);
            setWatchlistItems(editingWidget.watchlistItems || []);
            if (editingWidget.providerId) {
                setSelectedProviderId(editingWidget.providerId);
            }
        } else {
            resetForm();
        }
    }, [editingWidget, isModalOpen]);

    // Auto-select first endpoint when provider changes
    useEffect(() => {
        if (selectedProvider && selectedProvider.endpoints.length > 0) {
            setSelectedEndpointId(selectedProvider.endpoints[0].id);
        }
    }, [selectedProviderId, selectedProvider]);

    // Set default params and build URL when endpoint changes
    useEffect(() => {
        if (selectedEndpoint && selectedProvider) {
            const defaultParams: Record<string, string> = {};
            selectedEndpoint.params.forEach(param => {
                if (param.default) {
                    defaultParams[param.id] = param.default;
                }
            });
            setEndpointParams(defaultParams);
            setApiTestResult(null);

            // Build URL immediately with defaults (for testing connection)
            const url = buildApiUrl(selectedProvider, selectedEndpoint, defaultParams);
            setApiUrl(url);
        }
    }, [selectedEndpointId, selectedEndpoint, selectedProvider]);

    // Update API URL when params change (for symbol selection etc)
    useEffect(() => {
        if (selectedProvider && selectedEndpoint && Object.keys(endpointParams).length > 0) {
            const url = buildApiUrl(selectedProvider, selectedEndpoint, endpointParams);
            setApiUrl(url);
        }
    }, [selectedProvider, selectedEndpoint, endpointParams]);

    const resetForm = () => {
        setName('');
        setWidgetType('card');
        setCardStyle('financial-data');
        setChartType('line');
        setChartInterval('1W');
        setRefreshInterval(30);
        setSelectedFields([]);
        setSelectedProviderId(null);
        setSelectedEndpointId(null);
        setEndpointParams({});
        setApiUrl('');
        setWatchlistItems([]);
        setApiTestResult(null);
    };

    const handleProviderSelect = (providerId: string) => {
        setSelectedProviderId(providerId);
        setSelectedEndpointId(null);
        setEndpointParams({});
        setApiTestResult(null);
    };

    const handleParamChange = (paramId: string, value: string, symbolName?: string) => {
        setEndpointParams(prev => ({ ...prev, [paramId]: value }));
        if (symbolName) {
            setName(symbolName);
        }
    };

    const handleTestApi = async () => {
        if (!apiUrl.trim()) return;

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
                        endpointId: selectedEndpointId,
                        params: endpointParams,
                    }),
                });
            } else {
                response = await fetch('/api/proxy', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url: apiUrl }),
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
                // Set default fields from endpoint
                if (selectedEndpoint?.defaultFields.length) {
                    setSelectedFields(selectedEndpoint.defaultFields);
                }
            } else {
                setApiTestResult({
                    success: false,
                    error: result.error || 'Failed to connect',
                });
            }
        } catch {
            setApiTestResult({
                success: false,
                error: 'Network error',
            });
        } finally {
            setIsTestingApi(false);
        }
    };

    const handleClose = () => {
        closeModal();
        resetForm();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Build final endpoint params, including watchlist items if applicable
        let finalEndpointParams = { ...endpointParams };

        // For watchlist widgets, include all symbols in the API params
        if (cardStyle === 'watchlist' && watchlistItems.length > 0) {
            const symbolList = watchlistItems.map(item => item.symbol.toLowerCase()).join(',');

            // CoinGecko uses 'ids', Finnhub uses single 'symbol', etc.
            if (selectedProviderId === 'coingecko') {
                finalEndpointParams = { ...finalEndpointParams, ids: symbolList };
            }
        }

        const widgetData = {
            name: name || 'New Widget',
            apiUrl,
            refreshInterval,
            displayMode: widgetType,
            cardStyle: widgetType === 'card' ? cardStyle : undefined,
            chartType: widgetType === 'chart' ? chartType : undefined,
            chartInterval: widgetType === 'chart' ? chartInterval : undefined,
            selectedFields,
            watchlistItems: cardStyle === 'watchlist' ? watchlistItems : undefined,
            providerId: selectedProviderId || undefined,
            endpointId: selectedEndpointId || undefined,
            endpointParams: Object.keys(finalEndpointParams).length > 0 ? finalEndpointParams : undefined,
        };

        if (editingWidget) {
            updateWidget(editingWidget.id, widgetData);
        } else {
            addWidget(widgetData);
        }

        handleClose();
    };

    const canSubmit = name.trim() && apiUrl.trim() && apiTestResult?.success;

    if (!isModalOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[var(--border-color)] px-5 py-4">
                    <div>
                        <h2 className="text-lg font-semibold">
                            {editingWidget ? 'Edit Widget' : 'Create Widget'}
                        </h2>
                        <p className="text-sm text-[var(--text-muted)]">
                            Add a new data block to your dashboard
                        </p>
                    </div>
                    <button onClick={handleClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="max-h-[65vh] overflow-y-auto p-5">
                    <form id="widget-form" onSubmit={handleSubmit} className="space-y-5">
                        {/* Widget Title */}
                        <div>
                            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                                Widget Title
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g., Portfolio Overview"
                                className="input-field"
                                required
                            />
                        </div>

                        {/* Widget Type */}
                        <div>
                            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                                Widget Type
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {(['card', 'table', 'chart'] as DisplayMode[]).map((type) => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => {
                                            setWidgetType(type);
                                            setSelectedProviderId(null);
                                        }}
                                        className={`rounded-lg border-2 px-4 py-2.5 text-sm font-medium capitalize transition-all ${widgetType === type
                                            ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)] text-white'
                                            : 'border-[var(--border-color)] hover:border-[var(--text-muted)]'
                                            }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Card Style (only for card type) */}
                        {widgetType === 'card' && (
                            <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                                    Card Style
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {CARD_STYLES.map((style) => (
                                        <button
                                            key={style.id}
                                            type="button"
                                            onClick={() => setCardStyle(style.id)}
                                            className={`rounded-lg border-2 px-3 py-2 text-left transition-all ${cardStyle === style.id
                                                ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)] text-white'
                                                : 'border-[var(--border-color)] hover:border-[var(--text-muted)]'
                                                }`}
                                        >
                                            <span className="font-medium">{style.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Chart Options (only for chart type) */}
                        {widgetType === 'chart' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                                        Chart Type
                                    </label>
                                    <div className="flex gap-2">
                                        {(['line', 'candlestick'] as ChartType[]).map((type) => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setChartType(type)}
                                                className={`flex-1 rounded-lg border-2 px-3 py-2 text-sm font-medium capitalize transition-all ${chartType === type
                                                    ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)] text-white'
                                                    : 'border-[var(--border-color)] hover:border-[var(--text-muted)]'
                                                    }`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                                        Time Period
                                    </label>
                                    <div className="flex gap-1">
                                        {CHART_INTERVALS.map((interval) => (
                                            <button
                                                key={interval.value}
                                                type="button"
                                                onClick={() => setChartInterval(interval.value)}
                                                className={`flex-1 rounded-lg border px-2 py-2 text-xs font-medium transition-all ${chartInterval === interval.value
                                                    ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)] text-white'
                                                    : 'border-[var(--border-color)] hover:border-[var(--text-muted)]'
                                                    }`}
                                            >
                                                {interval.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Data Source */}
                        <div>
                            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                                Data Source <span className="font-normal">(Optional Preset)</span>
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {providers.filter(p => p.id !== 'custom').map((provider) => {
                                    const isDisabled = !availableProviders.some(p => p.id === provider.id);
                                    return (
                                        <button
                                            key={provider.id}
                                            type="button"
                                            onClick={() => !isDisabled && handleProviderSelect(provider.id)}
                                            disabled={isDisabled}
                                            className={`rounded-lg border-2 px-3 py-2.5 text-left text-sm font-medium transition-all ${selectedProviderId === provider.id
                                                ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)] text-white'
                                                : isDisabled
                                                    ? 'cursor-not-allowed border-[var(--border-color)] opacity-40'
                                                    : 'border-[var(--border-color)] hover:border-[var(--text-muted)]'
                                                }`}
                                        >
                                            {provider.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* API Endpoint - shows immediately after provider selection */}
                        {apiUrl && (
                            <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                                    API Endpoint
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={apiUrl}
                                        onChange={(e) => setApiUrl(e.target.value)}
                                        className="input-field flex-1 text-xs"
                                        readOnly={!!selectedProviderId}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleTestApi}
                                        disabled={isTestingApi || !apiUrl.trim()}
                                        className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${apiTestResult?.success
                                            ? 'bg-[var(--accent-primary)] text-white'
                                            : 'border border-[var(--accent-primary)] text-[var(--accent-primary)] hover:bg-[var(--accent-primary)] hover:text-white'
                                            }`}
                                    >
                                        {isTestingApi ? (
                                            <div className="spinner h-4 w-4" />
                                        ) : apiTestResult?.success ? (
                                            'Verified'
                                        ) : (
                                            'Connect'
                                        )}
                                    </button>
                                </div>
                                {/* Connection status */}
                                {apiTestResult && (
                                    <div className={`mt-2 flex items-center gap-2 text-sm ${apiTestResult.success ? 'text-green-500' : 'text-red-500'}`}>
                                        <span className={`h-2 w-2 rounded-full ${apiTestResult.success ? 'bg-green-500' : 'bg-red-500'}`} />
                                        {apiTestResult.success ? 'Connection successful' : apiTestResult.error}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Watchlist Items (after API test success) */}
                        {widgetType === 'card' && cardStyle === 'watchlist' && selectedProviderId && apiTestResult?.success && (
                            <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                                    Select Watchlist Items
                                </label>
                                <WatchlistSelector
                                    providerId={selectedProviderId}
                                    items={watchlistItems}
                                    onChange={setWatchlistItems}
                                />
                            </div>
                        )}

                        {/* Stock/Symbol Selection (for financial-data after API test) */}
                        {widgetType === 'card' && cardStyle === 'financial-data' && selectedEndpoint && apiTestResult?.success && (
                            <div>
                                {selectedEndpoint.params
                                    .filter(p => p.type === 'symbol')
                                    .map((param) => (
                                        <div key={param.id}>
                                            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                                                {param.name}
                                                {param.required && <span className="text-red-500 ml-1">*</span>}
                                            </label>
                                            <SymbolSearch
                                                providerId={selectedProviderId!}
                                                value={endpointParams[param.id] || ''}
                                                onChange={(value, name) => handleParamChange(param.id, value, name)}
                                                placeholder={param.placeholder}
                                            />
                                        </div>
                                    ))}
                            </div>
                        )}

                        {/* Field Selector (for financial data card or table) */}
                        {apiTestResult?.success && apiTestResult.fields && (widgetType === 'table' || (widgetType === 'card' && cardStyle === 'financial-data')) && (
                            <FieldSelector
                                fields={apiTestResult.fields}
                                selectedFields={selectedFields}
                                onFieldsChange={setSelectedFields}
                                displayMode={widgetType}
                            />
                        )}

                        {/* Refresh Rate */}
                        {apiTestResult?.success && (
                            <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                                    Refresh Rate
                                </label>
                                <select
                                    value={refreshInterval}
                                    onChange={(e) => setRefreshInterval(Number(e.target.value))}
                                    className="input-field"
                                >
                                    {REFRESH_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </form>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 border-t border-[var(--border-color)] px-5 py-4">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="widget-form"
                        disabled={!canSubmit}
                        className="rounded-lg bg-[var(--text-muted)] px-5 py-2 text-sm font-semibold text-white transition-all disabled:opacity-50 enabled:bg-[var(--accent-primary)] enabled:hover:bg-[var(--accent-hover)]"
                    >
                        {editingWidget ? 'Update Widget' : 'Create Widget'}
                    </button>
                </div>
            </div>
        </div>
    );
}
