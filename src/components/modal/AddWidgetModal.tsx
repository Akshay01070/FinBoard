'use client';

import { useState, useEffect } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { DisplayMode, ChartType, ChartInterval, CardStyle, FieldConfig, FlattenedField, WatchlistItem } from '@/types';
import { flattenObject } from '@/lib/dataMapper';
import { providers, ApiProvider, ApiEndpoint, buildApiUrl, getEndpoint } from '@/lib/providers';
import FieldSelector from './FieldSelector';
import SymbolSearch from './SymbolSearch';
import WatchlistSelector from './WatchlistSelector';
import CoinSelector from './CoinSelector';

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

    // Table Coin Selector state
    const [tableSelectedCoins, setTableSelectedCoins] = useState<string[]>([]);

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
        if (widgetType === 'card') {
            // Filter based on card style
            if (cardStyle === 'watchlist') return p.supportsCard.watchlist;
            if (cardStyle === 'market-gainers') return p.supportsCard.marketGainers;
            if (cardStyle === 'financial-data') return p.supportsCard.financialData;
            return true;
        }
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

            // Extract coin IDs from params if table widget
            if (editingWidget.displayMode === 'table' && editingWidget.providerId === 'coingecko') {
                const idsParam = editingWidget.endpointParams?.ids;
                if (idsParam) {
                    setTableSelectedCoins(idsParam.split(','));
                }
            }

            if (editingWidget.providerId) {
                setSelectedProviderId(editingWidget.providerId);
            }
        } else {
            resetForm();
        }
    }, [editingWidget, isModalOpen]);

    // Auto-select endpoint based on provider and card style
    useEffect(() => {
        if (selectedProvider && selectedProvider.endpoints.length > 0) {
            let targetEndpointId = selectedProvider.endpoints[0].id;

            // Select specific endpoints for Market Gainers
            if (widgetType === 'card' && cardStyle === 'market-gainers') {
                if (selectedProvider.id === 'coingecko') targetEndpointId = 'coins-markets';
                if (selectedProvider.id === 'indianapi') targetEndpointId = 'trending';
            }

            // For Table, select coins-markets for CoinGecko
            if (widgetType === 'table' && selectedProvider.id === 'coingecko') {
                targetEndpointId = 'coins-markets';
            }

            setSelectedEndpointId(targetEndpointId);
        }
    }, [selectedProviderId, selectedProvider, cardStyle, widgetType]);

    // Set default params and build URL when endpoint changes
    useEffect(() => {
        if (selectedEndpoint && selectedProvider) {
            const defaultParams: Record<string, string> = {};
            selectedEndpoint.params.forEach(param => {
                if (param.default) {
                    defaultParams[param.id] = param.default;
                }
            });

            // Override defaults for Market Gainers -> Force True Top Gainers
            if (widgetType === 'card' && cardStyle === 'market-gainers') {
                if (selectedProvider.id === 'coingecko' && selectedEndpoint.id === 'coins-markets') {
                    // Sort by 24h % change descending to get actual top gainers
                    defaultParams['order'] = 'price_change_percentage_24h_desc';
                }
            }

            // Table Defaults (Top 5) if no coins selected yet
            if (widgetType === 'table' && selectedProvider.id === 'coingecko') {
                // If tableSelectedCoins has items, URL update effect handles it. 
                // Initially empty? Default to per_page=5
                if (tableSelectedCoins.length === 0) {
                    defaultParams['per_page'] = '5';
                    defaultParams['page'] = '1';
                }
            }

            setEndpointParams(defaultParams);
            setApiTestResult(null);

            // Build URL immediately with defaults (for testing connection)
            const url = buildApiUrl(selectedProvider, selectedEndpoint, defaultParams);
            setApiUrl(url);
        }
    }, [selectedEndpointId, selectedEndpoint, selectedProvider, widgetType]);

    // Update API URL when params change (for symbol selection etc) or Table Coin selection changes
    useEffect(() => {
        if (selectedProvider && selectedEndpoint) {
            let currentParams = { ...endpointParams };

            // Special handling for CoinGecko Table widget Coin Selection
            if (widgetType === 'table' && selectedProvider.id === 'coingecko') {
                if (tableSelectedCoins.length > 0) {
                    // If coins selected, pass ids and remove per_page/page (pagination ignored)
                    currentParams['ids'] = tableSelectedCoins.join(',');
                    delete currentParams['per_page'];
                    delete currentParams['page'];
                } else {
                    // If no coins, ensure top 5 default
                    delete currentParams['ids'];
                    currentParams['per_page'] = '5';
                    currentParams['page'] = '1';
                }
            }

            if (Object.keys(currentParams).length > 0 || selectedProvider.id === 'custom') {
                const url = buildApiUrl(selectedProvider, selectedEndpoint, currentParams);
                setApiUrl(url);
                // We don't update endpointParams state here to avoid loops, purely deriving URL
            }
        }
    }, [selectedProvider, selectedEndpoint, endpointParams, tableSelectedCoins, widgetType]);

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
        setTableSelectedCoins([]);
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
                // For Table CoinGecko, ensure params match URL logic (derived state)
                // We construct the params object dynamically for the request
                let finalParams = { ...endpointParams };
                if (widgetType === 'table' && selectedProvider.id === 'coingecko') {
                    if (tableSelectedCoins.length > 0) {
                        finalParams['ids'] = tableSelectedCoins.join(',');
                        delete finalParams['per_page'];
                        delete finalParams['page'];
                    } else {
                        delete finalParams['ids'];
                        finalParams['per_page'] = '5';
                        finalParams['page'] = '1';
                    }
                }

                response = await fetch('/api/data', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        providerId: selectedProviderId,
                        endpointId: selectedEndpointId,
                        params: finalParams,
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
                // Set default fields from endpoint if empty
                if (selectedFields.length === 0 && selectedEndpoint?.defaultFields.length) {
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

        // Build final endpoint params
        let finalEndpointParams = { ...endpointParams };

        // For watchlist widgets
        if (cardStyle === 'watchlist' && watchlistItems.length > 0) {
            const symbolList = watchlistItems.map(item => item.symbol.toLowerCase()).join(',');
            if (selectedProviderId === 'coingecko') {
                finalEndpointParams = { ...finalEndpointParams, ids: symbolList };
            }
        }

        // For Table CoinGecko widgets
        if (widgetType === 'table' && selectedProviderId === 'coingecko') {
            if (tableSelectedCoins.length > 0) {
                finalEndpointParams['ids'] = tableSelectedCoins.join(',');
                delete finalEndpointParams['per_page'];
                delete finalEndpointParams['page'];
            } else {
                // Confirm defaults
                delete finalEndpointParams['ids'];
                finalEndpointParams['per_page'] = '5';
                finalEndpointParams['page'] = '1';
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
                                    // Check if provider supports the current card style
                                    let isSupported = true;
                                    if (widgetType === 'card' && cardStyle && provider.supportsCard) {
                                        // Map kebab-case card styles to camelCase support keys
                                        if (cardStyle === 'market-gainers') {
                                            isSupported = provider.supportsCard.marketGainers;
                                        } else if (cardStyle === 'financial-data') {
                                            isSupported = provider.supportsCard.financialData;
                                        } else {
                                            // 'watchlist' matches the key
                                            isSupported = provider.supportsCard.watchlist;
                                        }
                                    } else if (widgetType === 'table') {
                                        isSupported = provider.supportsTable;
                                    } else if (widgetType === 'chart') {
                                        isSupported = provider.supportsChart;
                                    }

                                    const isDisabled = !isSupported;

                                    return (
                                        <button
                                            key={provider.id}
                                            type="button"
                                            onClick={() => !isDisabled && handleProviderSelect(provider.id)}
                                            disabled={isDisabled}
                                            className={`rounded-lg border-2 px-3 py-2.5 text-left text-sm font-medium transition-all ${selectedProviderId === provider.id
                                                ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)] text-white'
                                                : isDisabled
                                                    ? 'cursor-not-allowed border-[var(--border-color)] opacity-40 grayscale'
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


                        {/* Coin Selector (for Table - CoinGecko only) */}
                        {widgetType === 'table' && selectedProviderId === 'coingecko' && selectedEndpoint && (
                            <div className="animate-fade-in">
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                                    Select Coins <span className="font-normal">(Optional - Default: Top 5)</span>
                                </label>
                                <CoinSelector
                                    providerId={selectedProviderId}
                                    selectedCoins={tableSelectedCoins}
                                    onChange={setTableSelectedCoins}
                                    placeholder="Search coins (e.g. bitcoin, ethereum)..."
                                />
                            </div>
                        )}

                        {/* Field Selector (for Chart, Table, and Financial Data Card) */}
                        {((widgetType !== 'card') || (widgetType === 'card' && cardStyle === 'financial-data')) && apiTestResult && apiTestResult.success && (
                            <div className="animate-fade-in">
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                                    Select Fields to Display
                                </label>
                                <FieldSelector
                                    fields={apiTestResult.fields || []}
                                    selectedFields={selectedFields}
                                    onFieldsChange={setSelectedFields}
                                    displayMode={widgetType}
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
