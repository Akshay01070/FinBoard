import { useEffect, useRef } from 'react';
import { createChart, ColorType, IChartApi, Time, CandlestickSeries, LineSeries } from 'lightweight-charts';
import { Widget } from '@/types';

interface TradingViewWidgetProps {
    widget: Widget;
    data: any;
}

export default function TradingViewWidget({ widget, data }: TradingViewWidgetProps) {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);

    useEffect(() => {
        if (!chartContainerRef.current || !data) return;

        // Process data
        let candleData: { time: Time; open: number; high: number; low: number; close: number }[] = [];
        let lineData: { time: Time; value: number }[] = [];

        // CoinGecko OHLC Format: [[time, open, high, low, close], ...]
        if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0]) && data[0].length === 5) {
            candleData = data.map(([timestamp, open, high, low, close]: number[]) => ({
                time: (timestamp / 1000) as Time, // Convert ms to seconds for TV
                open,
                high,
                low,
                close,
            })).sort((a: any, b: any) => (a.time as number) - (b.time as number));
        }
        // CoinGecko Prices Format: [[timestamp, price], ...]
        else if (data.prices && Array.isArray(data.prices)) {
            lineData = data.prices.map(([timestamp, price]: number[]) => ({
                time: (timestamp / 1000) as Time,
                value: price,
            })).sort((a: any, b: any) => (a.time as number) - (b.time as number));
        }

        // Determine if we have data
        const hasData = candleData.length > 0 || lineData.length > 0;
        if (!hasData) return;

        // Create Chart
        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: '#9ca3af', // text-muted
            },
            grid: {
                vertLines: { color: 'rgba(42, 46, 57, 0.1)' },
                horzLines: { color: 'rgba(42, 46, 57, 0.1)' },
            },
            width: chartContainerRef.current.clientWidth,
            height: chartContainerRef.current.clientHeight,
            timeScale: {
                timeVisible: true,
                secondsVisible: false,
            },
        });

        // Add Series (v5 API uses addSeries)
        if (widget.chartType === 'candlestick' && candleData.length > 0) {
            const candlestickSeries = chart.addSeries(CandlestickSeries, {
                upColor: '#26a69a',
                downColor: '#ef5350',
                borderVisible: false,
                wickUpColor: '#26a69a',
                wickDownColor: '#ef5350',
            });
            candlestickSeries.setData(candleData);
            chart.timeScale().fitContent();
        } else if (lineData.length > 0) {
            const lineSeries = chart.addSeries(LineSeries, {
                color: '#2962FF',
                lineWidth: 2,
            });
            lineSeries.setData(lineData);
            chart.timeScale().fitContent();
        }

        chartRef.current = chart;

        // Resize handler
        const handleResize = () => {
            if (chartContainerRef.current) {
                chart.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, [data, widget.chartType]);

    return (
        <div ref={chartContainerRef} className="h-full w-full" />
    );
}
