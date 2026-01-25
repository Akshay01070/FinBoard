'use client';

import { useMemo } from 'react';
import { Widget } from '@/types';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ComposedChart,
    Bar,
    Cell
} from 'recharts';

interface ChartWidgetProps {
    widget: Widget;
    data: any;
}

// Custom Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const d = payload[0].payload;
        return (
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-3 rounded-lg shadow-lg text-sm">
                <p className="text-[var(--text-muted)] mb-1">{label}</p>
                {d.open !== undefined ? (
                    <div className="space-y-1">
                        <div className="flex justify-between gap-4"><span className="text-[var(--text-muted)]">Open:</span> <span className="font-mono">{d.open.toFixed(2)}</span></div>
                        <div className="flex justify-between gap-4"><span className="text-[var(--text-muted)]">High:</span> <span className="font-mono">{d.high.toFixed(2)}</span></div>
                        <div className="flex justify-between gap-4"><span className="text-[var(--text-muted)]">Low:</span> <span className="font-mono">{d.low.toFixed(2)}</span></div>
                        <div className="flex justify-between gap-4"><span className="text-[var(--text-muted)]">Close:</span> <span className="font-mono">{d.close.toFixed(2)}</span></div>
                    </div>
                ) : (
                    <div className="flex justify-between gap-4">
                        <span className="text-[var(--text-muted)]">Price:</span>
                        <span className="font-bold text-[var(--accent-primary)]">{d.close.toFixed(2)}</span>
                    </div>
                )}
            </div>
        );
    }
    return null;
};

// Custom Candle Shape
const CandleShape = (props: any) => {
    const { x, y, width, height, payload } = props;
    const { open, close, high, low } = payload;
    const isUp = close > open;
    const color = isUp ? '#10b981' : '#ef4444';

    // Calculate wick positions (scales are passed in context conceptually, but here we might need to rely on passed y?
    // Actually, getting exact pixel coordinates for High/Low in a custom shape is tricky if not passed.
    // Recharts passes 'y' (top of bar) and 'height'.
    // BUT for custom shape on Bar, Recharts passes the bounding box of the Bar.
    // If we map Bar dataKey to [min, max], y is high-body, height is body-height.
    // We miss the high/low wicks if we don't scale them manually or use ErrorBar.

    // BETTER APPROACH:
    // Use the `yAxis` scale function if available? No.
    // Standard hack: We can't easily draw wicks inside a simple Bar shape without coordinates.
    // Alternative: A ComposedChart with ErrorBar is standardized.
    // BUT user wants Candle. 

    // Simplified Candle:
    // Draw Body using the Bar rect.
    // We assume the Bar represents the Body (Open/Close).
    // We draw lines for Wicks?
    // Wait, if dataKey is [min, max], then Bar covers the body.
    // Wicks extend above/below.
    // We can draw wicks relative to the body IF we know the pixel ratio. We don't.

    // Let's stick to a robust SVG drawing if we had scales.
    // Without scales, we might just draw the Body (Bar) and maybe skip wicks or use ErrorBar technique?
    // ErrorBar technique:
    // Bar dataKey=[min, max], ErrorBar dataKey=high/low error?

    // Compromise:
    // Finnhub data is high quality.
    // Render Body as Bar (dataKey=[min, max]). Color by direction.
    // Render Wicks using a separate 'Line' or 'Scatter' or 'ErrorBar'?
    // ErrorBar requires deviation.

    // Let's implement High/Low wicks as a separate invisible Bar with ErrorBars?
    // Too complex.

    // Let's just render the Body (Open-Close) for now as "Candle" representation, 
    // OR use a Line chart for simpler representation if Candle is too hard in Recharts?
    // NO, User asked for Candle.

    // REVISIT: Recharts shape receives `yAxis` in some contexts?
    // Actually, we can use `Rectangle` for body and `line` for wicks if we calculate pixels.
    // But we don't have the scale function here.

    // Alternative:
    // Use `ComposedChart`.
    // 1. Bar for [Open, Close] (The Body). 
    // 2. We need wicks.
    // Let's assume just showing Body is acceptable for "Custom implementation is required.. fine"
    // OR try to approximate with ErrorBar.

    return (
        <g>
            <rect x={x} y={y} width={width} height={height} fill={color} />
            {/* Wicks would go here but we lack pixel coords for High/Low */}
        </g>
    );
};


export default function ChartWidget({ widget, data }: ChartWidgetProps) {
    const isCandle = widget.chartType === 'candlestick';

    // Process Data
    const chartData = useMemo(() => {
        if (!data) return [];

        // Finnhub Candle Format: { c: [], h: [], l: [], o: [], t: [], s: 'ok' }
        if (data.c && Array.isArray(data.c)) {
            return data.t.map((timestamp: number, i: number) => ({
                time: new Date(timestamp * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
                timestamp: timestamp * 1000,
                open: data.o[i],
                high: data.h[i],
                low: data.l[i],
                close: data.c[i],
                // For Bar chart (Body range)
                min: Math.min(data.o[i], data.c[i]),
                max: Math.max(data.o[i], data.c[i])
            }));
        }

        // Alpha Vantage Format: { "Meta Data": {...}, "Time Series (...)": {...} }
        const avKeys = Object.keys(data);

        // Check for Alpha Vantage Errors/Notes first
        if (data['Note']) {
            console.warn('Alpha Vantage Note:', data['Note']);
            // Return error object if possible, or we handle it in render?
            // Since we return chartData array, we can't return object. 
            // We should probably rely on the fact that if this returns empty, we show "No data".
            // But we want to show the error.
            // Let's attach an error property to the empty array? Hacky.
            // Better: ChartWidget should check 'data' prop for error keys BEFORE calling chartData useMemo?
            // But useMemo processes data.
            return [];
        }
        if (data['Error Message'] || data['Information']) {
            console.warn('Alpha Vantage Error:', data['Error Message'] || data['Information']);
            return [];
        }

        const timeSeriesKey = avKeys.find(k => k.includes('Time Series') || k.includes('Weekly') || k.includes('Daily'));
        if (timeSeriesKey && data[timeSeriesKey]) {
            const timeSeries = data[timeSeriesKey];
            return Object.entries(timeSeries).map(([dateStr, values]: [string, any]) => {
                const open = parseFloat(values['1. open']);
                const high = parseFloat(values['2. high']);
                const low = parseFloat(values['3. low']);
                const close = parseFloat(values['4. close']);
                return {
                    time: new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
                    timestamp: new Date(dateStr).getTime(),
                    open,
                    high,
                    low,
                    close,
                    min: Math.min(open, close),
                    max: Math.max(open, close)
                };
            }).reverse(); // Alpha Vantage returns newest first, charts need oldest first
        }

        // CoinGecko Format: { prices: [[timestamp, price], ...] }
        if (data.prices && Array.isArray(data.prices)) {
            return data.prices.map(([timestamp, price]: [number, number]) => ({
                time: new Date(timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
                timestamp,
                open: price,
                high: price,
                low: price,
                close: price,
                min: price,
                max: price
            }));
        }

        // CoinGecko OHLC Format: [[time, open, high, low, close], ...]
        // Check for OHLC format specifically (array of arrays with length 5)
        if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0]) && data[0].length === 5) {
             return data.map(([timestamp, open, high, low, close]: [number, number, number, number, number]) => ({
                time: new Date(timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
                timestamp,
                open,
                high,
                low,
                close,
                min: Math.min(open, close, low),
                max: Math.max(open, close, high)
            }));
        }
        // Generic Array (Sparklines etc)
        if (Array.isArray(data)) {
            return data.map((item, index) => {
                if (Array.isArray(item) && item.length >= 2) {
                    return {
                        time: new Date(item[0]).toLocaleDateString(),
                        close: item[1]
                    };
                }
                return { time: index, close: item?.value || 0 };
            });
        }

        return [];
    }, [data]);
    // (End of useMemo)

    // Check for API-level errors (Alpha Vantage Note/Error)
    const apiError = useMemo(() => {
        if (data && typeof data === 'object') {
            const note = (data as any)['Note'];
            const info = (data as any)['Information'];
            const errMsg = (data as any)['Error Message'];
            return note || info || errMsg;
        }
        return null;
    }, [data]);

    if (apiError) {
        return (
            <div className="flex h-full flex-col items-center justify-center p-4 text-center text-sm">
                <span className="mb-2 text-amber-500 font-bold">API Message</span>
                <span className="text-[var(--text-muted)]">{apiError}</span>
            </div>
        );
    }

    if (!chartData.length) {
        return (
            <div className="flex h-full items-center justify-center text-[var(--text-muted)]">
                {widget.isLoading ? 'Loading...' : 'No data available'}
            </div>
        );
    }

    // Color logic
    const isPositive = chartData.length > 1 && chartData[chartData.length - 1].close >= chartData[0].close;
    const strokeColor = isPositive ? '#10b981' : '#ef4444';
    const fillColor = isPositive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)';

    return (
        <div className="h-full w-full min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
                {isCandle ? (
                    <ComposedChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                        <XAxis
                            dataKey="time"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            minTickGap={30}
                            stroke="var(--text-muted)"
                        />
                        <YAxis
                            domain={['auto', 'auto']}
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(val) => val.toFixed(2)}
                            stroke="var(--text-muted)"
                            width={40}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        {/* 
                            Trick: Recharts Bar does not accept [min, max] natively in dataKey for all versions.
                            But we can use `dataKey="min"` and `stackId`? No.
                            We use `dataKey` with a custom shape that reads payload.
                            
                            Actually, most robust:
                            Use two bars? Or just render "Close" line if Candle is too hard?
                            User was specific about CANDLE.
                            
                            Let's try standard Bar with dataKey="max" and shape prop.
                            The shape will read open/close from payload and draw the rect correctly.
                            We pass [min, max] range to axis domain to ensure fit.
                        */}
                        <Bar
                            dataKey="max" // Use max to set the top Y
                            shape={(props: any) => {
                                // Calculate pixel coordinates
                                const { x, width, yAxis, payload } = props;

                                // Safety check: if yAxis or scale not available, skip rendering
                                if (!yAxis || !yAxis.scale) {
                                    console.warn('ChartWidget: yAxis.scale not available for candlestick rendering');
                                    return null;
                                }

                                const { open, close, high, low } = payload;

                                // Convert values to pixels using yAxis scale
                                const yOpen = yAxis.scale(open);
                                const yClose = yAxis.scale(close);
                                const yHigh = yAxis.scale(high);
                                const yLow = yAxis.scale(low);

                                const isUp = close > open;
                                const color = isUp ? '#10b981' : '#ef4444';

                                const bodyTop = Math.min(yOpen, yClose);
                                const bodyBottom = Math.max(yOpen, yClose);
                                const bodyHeight = Math.max(1, bodyBottom - bodyTop);

                                return (
                                    <g>
                                        {/* Wick */}
                                        <line x1={x + width / 2} y1={yHigh} x2={x + width / 2} y2={yLow} stroke={color} strokeWidth={1} />
                                        {/* Body */}
                                        <rect x={x} y={bodyTop} width={width} height={bodyHeight} fill={color} />
                                    </g>
                                );
                            }}
                        />
                    </ComposedChart>
                ) : (
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id={`gradient-${widget.id}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={strokeColor} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                        <XAxis
                            dataKey="time"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            minTickGap={30}
                            stroke="var(--text-muted)"
                        />
                        <YAxis
                            domain={['auto', 'auto']}
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(val) => val.toFixed(2)}
                            stroke="var(--text-muted)"
                            width={40}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--text-muted)' }} />
                        <Area
                            type="monotone"
                            dataKey="close"
                            stroke={strokeColor}
                            fill={`url(#gradient-${widget.id})`}
                            strokeWidth={2}
                        />
                    </AreaChart>
                )}
            </ResponsiveContainer>
        </div>
    );
}
