'use client';

import { useState, useEffect } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { DisplayMode, ChartType, FieldConfig, FlattenedField } from '@/types';
import { testApiConnection } from '@/lib/api';
import { flattenObject } from '@/lib/dataMapper';
import { WidgetTemplate } from '@/lib/templates';
import FieldSelector from './FieldSelector';
import DisplayModeToggle from './DisplayModeToggle';
import TemplateSelector from './TemplateSelector';

type ModalStep = 'select' | 'configure';

export default function AddWidgetModal() {
    const { isModalOpen, closeModal, addWidget, widgets, editingWidgetId, updateWidget } = useDashboardStore();

    const editingWidget = editingWidgetId ? widgets.find((w) => w.id === editingWidgetId) : null;

    const [step, setStep] = useState<ModalStep>('select');
    const [name, setName] = useState('');
    const [apiUrl, setApiUrl] = useState('');
    const [refreshInterval, setRefreshInterval] = useState(30);
    const [displayMode, setDisplayMode] = useState<DisplayMode>('card');
    const [chartType, setChartType] = useState<ChartType>('line');
    const [chartInterval, setChartInterval] = useState<'1D' | '1W' | '1M'>('1D');
    const [selectedFields, setSelectedFields] = useState<FieldConfig[]>([]);

    const [isTestingApi, setIsTestingApi] = useState(false);
    const [apiTestResult, setApiTestResult] = useState<{
        success: boolean;
        error?: string;
        fields?: FlattenedField[];
    } | null>(null);

    // Populate form when editing
    useEffect(() => {
        if (editingWidget) {
            setStep('configure');
            setName(editingWidget.name);
            setApiUrl(editingWidget.apiUrl);
            setRefreshInterval(editingWidget.refreshInterval);
            setDisplayMode(editingWidget.displayMode);
            setChartType(editingWidget.chartType || 'line');
            setSelectedFields(editingWidget.selectedFields);
            // Auto-test API for editing
            handleTestApiWithUrl(editingWidget.apiUrl);
        } else {
            // Reset form
            setStep('select');
            setName('');
            setApiUrl('');
            setRefreshInterval(30);
            setDisplayMode('card');
            setChartType('line');
            setChartInterval('1D');
            setSelectedFields([]);
            setApiTestResult(null);
        }
    }, [editingWidget, isModalOpen]);

    const handleTestApiWithUrl = async (url: string) => {
        if (!url.trim()) return;

        setIsTestingApi(true);
        setApiTestResult(null);

        const result = await testApiConnection(url);

        if (result.success && result.data) {
            const flattened = flattenObject(result.data);
            setApiTestResult({
                success: true,
                fields: flattened,
            });
        } else {
            setApiTestResult({
                success: false,
                error: result.error,
            });
        }

        setIsTestingApi(false);
    };

    const handleTestApi = () => handleTestApiWithUrl(apiUrl);

    const handleSelectTemplate = (template: WidgetTemplate) => {
        setName(template.name);
        setApiUrl(template.apiUrl);
        setRefreshInterval(template.refreshInterval);
        setDisplayMode(template.displayMode);
        if (template.chartType) setChartType(template.chartType);
        setSelectedFields(template.selectedFields);
        setStep('configure');
        // Auto-test the template API
        handleTestApiWithUrl(template.apiUrl);
    };

    const handleCustomWidget = () => {
        setStep('configure');
    };

    const handleBack = () => {
        setStep('select');
        setApiTestResult(null);
    };

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
                    <div className="flex items-center gap-2">
                        {step === 'configure' && !editingWidgetId && (
                            <button
                                type="button"
                                onClick={handleBack}
                                className="rounded p-1 text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                        )}
                        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                            {editingWidgetId ? 'Edit Widget' : step === 'select' ? 'Add New Widget' : 'Configure Widget'}
                        </h2>
                    </div>
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
                <div className="max-h-[60vh] overflow-y-auto p-4">
                    {step === 'select' ? (
                        <TemplateSelector
                            onSelectTemplate={handleSelectTemplate}
                            onCustomWidget={handleCustomWidget}
                        />
                    ) : (
                        <form id="widget-form" onSubmit={handleSubmit} className="space-y-4">
                            {/* Widget Name */}
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
                                    Widget Name
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g., Bitcoin Price Tracker"
                                    className="input-field"
                                    required
                                />
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
                                        placeholder="e.g., https://api.coinbase.com/v2/exchange-rates?currency=BTC"
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
                                                    API connection successful! {apiTestResult.fields?.length} fields found.
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
                                <p className="mt-1 text-xs text-[var(--text-muted)]">
                                    Set to 0 for manual refresh only
                                </p>
                            </div>

                            {/* Field Selection - only show after successful API test */}
                            {apiTestResult?.success && apiTestResult.fields && (
                                <>
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
                                            Display Mode
                                        </label>
                                        <DisplayModeToggle
                                            mode={displayMode}
                                            chartType={chartType}
                                            onModeChange={setDisplayMode}
                                            onChartTypeChange={setChartType}
                                        />
                                    </div>

                                    {/* Chart Interval Selector */}
                                    {displayMode === 'chart' && (
                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
                                                Time Interval
                                            </label>
                                            <div className="flex gap-2">
                                                {(['1D', '1W', '1M'] as const).map((interval) => (
                                                    <button
                                                        key={interval}
                                                        type="button"
                                                        onClick={() => setChartInterval(interval)}
                                                        className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${chartInterval === interval
                                                                ? 'bg-[var(--accent-primary)] text-white'
                                                                : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-card)]'
                                                            }`}
                                                    >
                                                        {interval === '1D' ? 'Daily' : interval === '1W' ? 'Weekly' : 'Monthly'}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <FieldSelector
                                        fields={apiTestResult.fields}
                                        selectedFields={selectedFields}
                                        onFieldsChange={setSelectedFields}
                                        displayMode={displayMode}
                                    />
                                </>
                            )}
                        </form>
                    )}
                </div>

                {/* Footer */}
                {step === 'configure' && (
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
                )}
            </div>
        </div>
    );
}
