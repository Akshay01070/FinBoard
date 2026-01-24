'use client';

import { useEffect, useRef, useMemo } from 'react';
import { Widget } from '@/types';
import { getValueByPath } from '@/lib/dataMapper';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

interface ChartWidgetProps {
    widget: Widget;
    data: unknown;
}

export default function ChartWidget({ widget, data }: ChartWidgetProps) {
    const chartContainerRef = useRef<HTMLDivElement>(null);

    // Extract chart data
    const chartData = useMemo(() => {
        if (!data) return [];

        // If data is an array, use it directly (CoinGecko OHLC returns raw array)
        if (Array.isArray(data)) {
            return data.map((item, index) => {
                // Handle [timestamp, open, high, low, close] format (CoinGecko OHLC)
                if (Array.isArray(item) && item.length >= 5) {
                    return item; // Return as-is for candlestick processing
                }
                // Handle [timestamp, value] format (CoinGecko market chart)
                if (Array.isArray(item) && item.length === 2) {
                    return {
                        index,
                        time: new Date(item[0]).toLocaleDateString(),
                        value: item[1],
                    };
                }
                const dataPoint: Record<string, unknown> = { index };
                widget.selectedFields.forEach((field) => {
                    const key = field.label || field.path.split('.').pop() || field.path;
                    dataPoint[key] = getValueByPath(item, field.path) ?? getValueByPath(item, field.path.split('.').pop() || field.path);
                });
                return dataPoint;
            });
        }

        // Try to find array data in selected fields (e.g., "prices" field)
        for (const field of widget.selectedFields) {
            const value = getValueByPath(data, field.path);
            if (Array.isArray(value)) {
                return value.map((item, index) => {
                    // Handle [timestamp, value] format (CoinGecko market chart)
                    if (Array.isArray(item) && item.length === 2) {
                        return {
                            index,
                            time: new Date(item[0]).toLocaleDateString(),
                            value: item[1],
                        };
                    }
                    if (typeof item === 'object' && item !== null) {
                        return { index, ...item };
                    }
                    return { index, value: item };
                });
            }
        }

        // Single data point
        const dataPoint: Record<string, unknown> = { index: 0 };
        widget.selectedFields.forEach((field) => {
            const key = field.label || field.path.split('.').pop() || field.path;
            dataPoint[key] = getValueByPath(data, field.path);
        });
        return [dataPoint];
    }, [data, widget.selectedFields]);

    // For candlestick chart using lightweight-charts
    const isCandlestick = widget.chartType === 'candlestick';

    useEffect(() => {
        if (!isCandlestick || !chartContainerRef.current || chartData.length === 0) return;

        let chart: ReturnType<typeof import('lightweight-charts').createChart> | null = null;
        let resizeObserver: ResizeObserver | null = null;

        // Dynamic import for lightweight-charts (only for candlestick)
        const loadChart = async () => {
            try {
                const LWC = await import('lightweight-charts');

                const container = chartContainerRef.current;
                if (!container) return;

                // Clear previous chart
                container.innerHTML = '';

                chart = LWC.createChart(container, {
                    layout: {
                        background: { type: LWC.ColorType.Solid, color: 'transparent' },
                        textColor: 'rgba(148, 163, 184, 1)',
                    },
                    grid: {
                        vertLines: { color: 'rgba(30, 58, 95, 0.5)' },
                        horzLines: { color: 'rgba(30, 58, 95, 0.5)' },
                    },
                    width: container.clientWidth,
                    height: 250,
                });

                // Use the new v4 API: addSeries with CandlestickSeries
                const candlestickSeries = chart.addSeries(LWC.CandlestickSeries, {
                    upColor: '#10b981',
                    downColor: '#ef4444',
                    borderUpColor: '#10b981',
                    borderDownColor: '#ef4444',
                    wickUpColor: '#10b981',
                    wickDownColor: '#ef4444',
                });

                // Format data for candlestick (expects {time, open, high, low, close})
                // CoinGecko OHLC returns [[timestamp, open, high, low, close], ...]
                const formattedData = chartData.map((item, index) => {
                    // Handle CoinGecko OHLC array format [timestamp, open, high, low, close]
                    if (Array.isArray(item) && item.length >= 5) {
                        return {
                            time: Math.floor(Number(item[0]) / 1000) as number, // Convert ms to seconds
                            open: Number(item[1]),
                            high: Number(item[2]),
                            low: Number(item[3]),
                            close: Number(item[4]),
                        };
                    }
                    // Handle object format
                    return {
                        time: (item.time as number) || (Math.floor(Date.now() / 1000) + index * 86400),
                        open: Number(item.open) || Number(item.o) || 0,
                        high: Number(item.high) || Number(item.h) || 0,
                        low: Number(item.low) || Number(item.l) || 0,
                        close: Number(item.close) || Number(item.c) || 0,
                    };
                }).filter(d => d.open > 0 && d.close > 0);

                console.log('Candlestick data:', formattedData.slice(0, 3)); // Debug log

                if (formattedData.length > 0) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    candlestickSeries.setData(formattedData as any);
                }

                chart.timeScale().fitContent();

                // Handle resize
                resizeObserver = new ResizeObserver(() => {
                    if (container && chart) {
                        chart.applyOptions({ width: container.clientWidth });
                    }
                });
                resizeObserver.observe(container);
            } catch (error) {
                console.error('Failed to load chart:', error);
            }
        };

        loadChart();

        return () => {
            if (resizeObserver) resizeObserver.disconnect();
            if (chart) chart.remove();
        };
    }, [isCandlestick, chartData]);

    if (chartData.length === 0) {
        return (
            <div className="flex h-64 items-center justify-center text-[var(--text-muted)]">
                No chart data available
            </div>
        );
    }

    // Get data keys for line chart
    const dataKeys = useMemo(() => {
        if (chartData.length === 0) return [];
        return Object.keys(chartData[0]).filter((key) => {
            const val = chartData[0][key];
            return key !== 'index' && key !== 'time' && key !== 'date' && typeof val === 'number';
        });
    }, [chartData]);

    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

    // Render candlestick chart container
    if (isCandlestick) {
        return (
            <div className="h-64">
                <div ref={chartContainerRef} className="h-full w-full" />
            </div>
        );
    }

    // Render line chart with Recharts
    return (
        <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(30, 58, 95, 0.5)" />
                    <XAxis
                        dataKey="index"
                        stroke="rgba(148, 163, 184, 1)"
                        tick={{ fontSize: 12 }}
                    />
                    <YAxis
                        stroke="rgba(148, 163, 184, 1)"
                        tick={{ fontSize: 12 }}
                        domain={['auto', 'auto']}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'var(--bg-modal)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                            color: 'var(--text-primary)',
                        }}
                    />
                    {dataKeys.map((key, index) => (
                        <Line
                            key={key}
                            type="monotone"
                            dataKey={key}
                            stroke={colors[index % colors.length]}
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 4 }}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
