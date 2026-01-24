'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Widget as WidgetType } from '@/types';
import { fetchApiData } from '@/lib/api';
import CardWidget from './CardWidget';
import TableWidget from './TableWidget';
import ChartWidget from './ChartWidget';

interface WidgetProps {
    widget: WidgetType;
}

export default function Widget({ widget }: WidgetProps) {
    const { removeWidget, setWidgetData, setWidgetLoading, setWidgetError, openModal } = useDashboardStore();
    const [isVisible, setIsVisible] = useState(true);
    const widgetRef = useRef<HTMLDivElement>(null);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: widget.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    // Visibility observer - pause refresh when offscreen
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsVisible(entry.isIntersecting);
            },
            { threshold: 0.1 }
        );

        if (widgetRef.current) {
            observer.observe(widgetRef.current);
        }

        return () => observer.disconnect();
    }, []);

    // Fetch data function
    const fetchData = useCallback(async () => {
        if (!widget.apiUrl) return;

        setWidgetLoading(widget.id, true);
        const { data, error } = await fetchApiData(widget.apiUrl);

        if (error) {
            setWidgetError(widget.id, error);
        } else {
            setWidgetData(widget.id, data);
        }
        setWidgetLoading(widget.id, false);
    }, [widget.id, widget.apiUrl, setWidgetData, setWidgetLoading, setWidgetError]);

    // Initial fetch and refresh interval
    useEffect(() => {
        fetchData();

        if (widget.refreshInterval > 0) {
            const interval = setInterval(() => {
                // Only fetch if visible and document is visible
                if (isVisible && document.visibilityState === 'visible') {
                    fetchData();
                }
            }, widget.refreshInterval * 1000);

            return () => clearInterval(interval);
        }
    }, [widget.refreshInterval, fetchData, isVisible]);

    // Listen to visibility changes
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && isVisible) {
                fetchData();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [fetchData, isVisible]);

    const formatLastUpdated = (isoString?: string) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        return date.toLocaleTimeString();
    };

    const renderContent = () => {
        if (widget.isLoading && !widget.cachedData) {
            return (
                <div className="flex h-32 items-center justify-center">
                    <div className="spinner" />
                </div>
            );
        }

        if (widget.error && !widget.cachedData) {
            return (
                <div className="error-message">
                    <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm">{widget.error}</span>
                </div>
            );
        }

        if (!widget.cachedData) {
            return (
                <div className="flex h-32 items-center justify-center text-[var(--text-muted)]">
                    No data available
                </div>
            );
        }

        switch (widget.displayMode) {
            case 'table':
                return <TableWidget widget={widget} data={widget.cachedData} />;
            case 'chart':
                return <ChartWidget widget={widget} data={widget.cachedData} />;
            case 'card':
            default:
                return <CardWidget widget={widget} data={widget.cachedData} />;
        }
    };

    return (
        <div
            ref={(node) => {
                setNodeRef(node);
                if (node) {
                    (widgetRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
                }
            }}
            style={style}
            className="card h-full flex flex-col overflow-hidden"
        >
            {/* Widget Header */}
            <div
                {...attributes}
                {...listeners}
                className="flex cursor-grab items-center justify-between border-b border-[var(--border-color)] px-4 py-3 active:cursor-grabbing"
            >
                <div className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    <h3 className="font-medium text-[var(--text-primary)]">{widget.name}</h3>
                    {widget.refreshInterval > 0 && (
                        <span className="rounded bg-[var(--bg-secondary)] px-2 py-0.5 text-xs text-[var(--text-muted)]">
                            {widget.refreshInterval}s
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-1">
                    {/* Refresh button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            fetchData();
                        }}
                        disabled={widget.isLoading}
                        className="rounded p-1.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] disabled:opacity-50"
                        title="Refresh"
                    >
                        <svg
                            className={`h-4 w-4 ${widget.isLoading ? 'animate-spin' : ''}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                    {/* Settings button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            openModal(widget.id);
                        }}
                        className="rounded p-1.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
                        title="Settings"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </button>
                    {/* Delete button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            removeWidget(widget.id);
                        }}
                        className="rounded p-1.5 text-[var(--text-muted)] transition-colors hover:bg-red-500/10 hover:text-red-500"
                        title="Delete"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Widget Content */}
            <div className="p-4 flex-1 overflow-auto">
                {renderContent()}
            </div>

            {/* Widget Footer */}
            {widget.lastUpdated && (
                <div className="border-t border-[var(--border-color)] px-4 py-2 text-center text-xs text-[var(--text-muted)]">
                    Last updated: {formatLastUpdated(widget.lastUpdated)}
                </div>
            )}
        </div>
    );
}
