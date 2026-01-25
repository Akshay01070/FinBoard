'use client';

import { Widget, WatchlistItem, WidgetConfig } from '@/types';
import { getValueByPath, formatValue } from '@/lib/dataMapper';

interface CardWidgetProps {
    widget: Widget;
    data: unknown;
}

// Trend arrow SVG components
const TrendUp = () => (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7V17" />
    </svg>
);

const TrendDown = () => (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 17L7 7M7 7H17M7 7V17" />
    </svg>
);

// Format price with ₹ symbol
const formatPrice = (value: number | string): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '₹0.00';
    return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Format percentage change
const formatChange = (value: number | string): { text: string; isPositive: boolean } => {
    if (value === null || value === undefined) return { text: '0.00%', isPositive: true };
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return { text: '0.00%', isPositive: true };
    const isPositive = num >= 0;
    return {
        text: `${isPositive ? '+' : ''}${num.toFixed(5)}%`,
        isPositive,
    };
};

interface WatchlistRowProps {
    name: string;
    symbol: string;
    price: number;
    change: number;
    index: number;
    currency?: string;
}

// Watchlist Item Row Component
function WatchlistRow({ name, symbol, price, change, index, currency }: WatchlistRowProps) {
    const { text: changeText, isPositive } = formatChange(change);

    // Generate color based on index for variety
    const colors = [
        'bg-pink-500/20 text-pink-400',
        'bg-emerald-500/20 text-emerald-400',
        'bg-blue-500/20 text-blue-400',
        'bg-purple-500/20 text-purple-400',
        'bg-orange-500/20 text-orange-400',
    ];
    const colorClass = colors[index % colors.length];

    return (
        <div className="flex items-center justify-between rounded-xl bg-[var(--bg-secondary)] px-4 py-3 transition-all hover:bg-[var(--bg-card)]">
            <div className="flex items-center gap-3">
                {/* Icon with trend */}
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${colorClass}`}>
                    {isPositive ? <TrendUp /> : <TrendDown />}
                </div>
                {/* Name and symbol */}
                <div>
                    <p className="font-semibold text-[var(--text-primary)]">{name}</p>
                    <p className="text-xs uppercase text-[var(--text-muted)]">{symbol}</p>
                </div>
            </div>
            {/* Price and change */}
            <div className="text-right">
                <p className="font-semibold text-[var(--text-primary)]">
                    {formatValue(price, 'currency', { currency })}
                </p>
                <p className={`text-sm ${isPositive ? 'text-emerald-400' : 'text-pink-400'}`}>
                    {changeText}
                </p>
            </div>
        </div>
    );
}

// Financial Data Card (centered large display + grid)
function FinancialDataCard({ widget, data }: CardWidgetProps) {
    // Get symbol from widget name or data
    const symbol = widget.name || 'STOCK';
    const currency = getCurrency(widget);

    // Find price and change fields for main display
    // Prioritize exact matches to avoid partial matches on metadata (e.g. 'priceToEarnings' object)
    const priceField = widget.selectedFields.find(f =>
        f.path === 'currentPrice' || f.path === 'c' || f.path === 'price' || f.path === 'ltp'
    ) || widget.selectedFields.find(f =>
        f.path.toLowerCase().includes('price') && !f.path.includes('Reference') && !f.path.includes('Ratio')
    );

    const changeField = widget.selectedFields.find(f =>
        f.path === 'percentChange' || f.path === 'dp' || f.path === 'change' || f.path === 'price_change_percentage_24h'
    ) || widget.selectedFields.find(f =>
        f.path.toLowerCase().includes('change') || f.path.toLowerCase().includes('percent')
    );

    const price = priceField ? getValueByPath(data, priceField.path) : 0;
    const change = changeField ? getValueByPath(data, changeField.path) : 0;
    const { text: changeText, isPositive } = formatChange(change as number);

    // Filter fields for grid (exclude main price/change if we want to avoid duplication, or keep all)
    // User requested "only selected attribute are shown", so we iterate selectedFields.
    // However, price/change are usually main. User screenshot shows Price/Change prominent + grid.
    // We will render ALL selected fields in the grid, but highlight Price in header.
    // Actually, user said: "Main -> Current Price, Grid -> Selected metrics".

    const gridFields = widget.selectedFields.filter(f =>
        f.path !== priceField?.path && f.path !== changeField?.path
    );

    return (
        <div className="flex h-full flex-col p-4">
            {/* Header */}
            <div className="mb-4 text-center">
                <p className="text-sm uppercase tracking-wider text-[var(--text-muted)]">
                    {symbol.toUpperCase().split(' ')[0]}
                </p>
                <div className="flex items-baseline justify-center gap-2">
                    <h2 className="text-4xl font-bold text-[var(--text-primary)]">
                        {formatValue(price, 'currency', { currency })}
                    </h2>
                </div>
                <div className={`flex items-center justify-center gap-1 text-sm font-medium ${isPositive ? 'text-emerald-400' : 'text-pink-400'}`}>
                    {isPositive ? <TrendUp /> : <TrendDown />}
                    <span>{changeText}</span>
                </div>
            </div>

            {/* Grid of Attributes */}
            <div className="grid flex-1 grid-cols-2 gap-3 overflow-y-auto">
                {gridFields.map((field, index) => {
                    const value = getValueByPath(data, field.path);
                    return (
                        <div key={index} className="flex flex-col justify-center rounded-lg bg-[var(--bg-card-secondary)] p-3">
                            <span className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                                {field.label}
                            </span>
                            <span className="text-lg font-bold text-[var(--text-primary)]">
                                {formatValue(value, field.format, { currency })}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// Watchlist Card (list of assets)
function WatchlistCard({ widget, data }: CardWidgetProps) {
    const items = widget.watchlistItems || [];

    // If no data or no items, show fallback
    if (!data || items.length === 0) {
        // Try fallback to selectedFields
        if (widget.selectedFields.length > 0) {
            return (
                <div className="space-y-2">
                    {widget.selectedFields.map((field, index) => {
                        const value = getValueByPath(data, field.path);
                        const formattedValue = formatValue(value, field.format);

                        return (
                            <div
                                key={`${field.path}-${index}`}
                                className="flex items-center justify-between rounded-lg bg-[var(--bg-secondary)] px-4 py-3"
                            >
                                <span className="text-sm text-[var(--text-secondary)]">
                                    {field.label}
                                </span>
                                <span className="font-mono font-medium text-[var(--text-primary)]">
                                    {formattedValue}
                                </span>
                            </div>
                        );
                    })}
                </div>
            );
        }

        return (
            <div className="flex h-32 items-center justify-center text-[var(--text-muted)]">
                No data available
            </div>
        );
    }

    // Data is an object with symbols as keys (from our combined results)
    const dataObj = data as Record<string, Record<string, unknown>>;

    return (
        <div className="space-y-2">
            {items.map((item, index) => {
                // Try different data lookup approaches based on provider
                const symbolKey = item.symbol;
                const symbolKeyLower = item.symbol.toLowerCase();

                // Get data for this symbol (try both cases)
                const itemData = dataObj[symbolKey] || dataObj[symbolKeyLower] || {};

                let price = 0;
                let change = 0;

                // CoinGecko format: { bitcoin: { inr: 1234, inr_24h_change: 1.5 } }
                if ('inr' in itemData || 'usd' in itemData) {
                    price = (itemData.inr || itemData.usd || 0) as number;
                    change = (itemData.inr_24h_change || itemData.usd_24h_change || 0) as number;
                }
                // Finnhub format: { AAPL: { c: 150.5, dp: 1.2, _name: "Apple Inc" } }
                else if ('c' in itemData) {
                    price = (itemData.c || 0) as number;
                    change = (itemData.dp || 0) as number;
                }
                // AlphaVantage format: { "Global Quote": { "05. price": "150.5", "10. change percent": "1.5%" } }
                else if (itemData['Global Quote']) {
                    const gq = itemData['Global Quote'] as Record<string, string>;
                    price = parseFloat(gq['05. price'] || '0');
                    const changeStr = gq['10. change percent'] || '0';
                    change = parseFloat(changeStr.replace('%', '')) || 0;
                }
                // IndianAPI format: { currentPrice: { BSE: "3162.50", NSE: "3165.00" }, percentChange: "0.30" }
                else if ('currentPrice' in itemData) {
                    const currentPrice = itemData.currentPrice;
                    // Handle nested price object with BSE/NSE values
                    if (typeof currentPrice === 'object' && currentPrice !== null) {
                        const priceObj = currentPrice as Record<string, string | number>;
                        // Try NSE first, then BSE
                        const priceValue = priceObj.NSE || priceObj.BSE || 0;
                        price = typeof priceValue === 'string' ? parseFloat(priceValue) : priceValue;
                    } else {
                        price = typeof currentPrice === 'string' ? parseFloat(currentPrice) : (currentPrice || 0) as number;
                    }
                    // percentChange may be a string like "0.30"
                    const pctChange = itemData.percentChange;
                    change = typeof pctChange === 'string' ? parseFloat(pctChange) : (pctChange || 0) as number;
                }

                // Get display name from data or item
                const displayName = (itemData._name || item.name || item.symbol) as string;

                return (
                    <WatchlistRow
                        key={item.symbol}
                        name={displayName}
                        symbol={item.symbol}
                        price={price}
                        change={change}
                        index={index}
                    />
                );
            })}
        </div>
    );
}

// Helper to determine widget currency
const getCurrency = (widget: WidgetConfig): string => {
    // 1. Check endpoint params (e.g. CoinGecko vs_currency)
    if (widget.endpointParams?.vs_currency) {
        return widget.endpointParams.vs_currency.toUpperCase();
    }
    // 2. Check provider default (IndianAPI usually INR)
    if (widget.providerId === 'indianapi') {
        return 'INR';
    }
    // 3. Fallback to USD (CoinGecko defaults, Finnhub, etc)
    return 'USD';
};

// Market Gainers Card (top movers)
function MarketGainersCard({ widget, data }: CardWidgetProps) {
    const currency = getCurrency(widget);

    // Normalize data from different provider formats
    interface GainerItem {
        name: string;
        symbol: string;
        price: number;
        change: number;
    }

    let gainers: GainerItem[] = [];

    // CoinGecko format: Array with current_price, price_change_percentage_24h
    if (Array.isArray(data)) {
        gainers = data.map((item: Record<string, unknown>) => ({
            name: (item.name || item.id || 'Unknown') as string,
            symbol: (item.symbol || 'N/A') as string,
            price: (item.current_price || item.price || 0) as number,
            change: (item.price_change_percentage_24h || item.change || 0) as number,
        }));
    }
    // IndianAPI format: { trending_stocks: { top_gainers: [...] } }
    else if (data && typeof data === 'object') {
        const dataObj = data as Record<string, unknown>;
        const trendingStocks = dataObj.trending_stocks as Record<string, unknown> | undefined;
        const topGainers = (trendingStocks?.top_gainers || dataObj.top_gainers || dataObj.topGainers) as Record<string, unknown>[] | undefined;

        if (topGainers && Array.isArray(topGainers)) {
            gainers = topGainers.map((item: Record<string, unknown>) => {
                // IndianAPI uses snake_case in trending endpoint
                // Fields from verification: price, percent_change, net_change, ltp
                const ltp = item.ltp || item.price || item.lastPrice || item.close || 0;
                // Use percent_change for sorting (it's what users expect for 'gainers')
                const pctChange = item.percent_change || item.percentChange || item.net_change || item.netChange || 0;

                return {
                    name: (item.company_name || item.companyName || item.symbol || 'Unknown') as string,
                    symbol: (item.symbol || 'N/A') as string,
                    price: typeof ltp === 'string' ? parseFloat(ltp) : ltp as number,
                    change: typeof pctChange === 'string' ? parseFloat(pctChange) : pctChange as number,
                };
            });
        }
    }

    // Sort by percentage change (descending), filter out losers, and take top 5
    const topGainers = gainers
        .filter(item => item.change > 0) // Only show actual gainers
        .sort((a, b) => b.change - a.change)
        .slice(0, 5);

    if (topGainers.length > 0) {
        return (
            <div className="space-y-2">
                {topGainers.map((item, index) => (
                    <WatchlistRow
                        key={item.symbol + index}
                        name={item.name}
                        symbol={item.symbol.toUpperCase()}
                        price={item.price}
                        change={item.change}
                        index={index}
                        currency={currency}
                    />
                ))}
            </div>
        );
    }

    // Fallback
    return (
        <div className="flex h-32 items-center justify-center text-[var(--text-muted)]">
            No gainers data available
        </div>
    );
}

export default function CardWidget({ widget, data }: CardWidgetProps) {
    // Route to the appropriate card style
    switch (widget.cardStyle) {
        case 'financial-data':
            return <FinancialDataCard widget={widget} data={data} />;
        case 'market-gainers':
            return <MarketGainersCard widget={widget} data={data} />;
        case 'watchlist':
        default:
            return <WatchlistCard widget={widget} data={data} />;
    }
}
