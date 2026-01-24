'use client';

import { Widget, WatchlistItem } from '@/types';
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
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return { text: '0.00%', isPositive: true };
    const isPositive = num >= 0;
    return {
        text: `${isPositive ? '+' : ''}${num.toFixed(5)}%`,
        isPositive,
    };
};

// Watchlist Item Row Component
function WatchlistRow({
    name,
    symbol,
    price,
    change,
    index
}: {
    name: string;
    symbol: string;
    price: number;
    change: number;
    index: number;
}) {
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
                <p className="font-semibold text-[var(--text-primary)]">{formatPrice(price)}</p>
                <p className={`text-sm ${isPositive ? 'text-emerald-400' : 'text-pink-400'}`}>
                    {changeText}
                </p>
            </div>
        </div>
    );
}

// Financial Data Card (centered large display)
function FinancialDataCard({ widget, data }: CardWidgetProps) {
    // Get first field values for display
    const priceField = widget.selectedFields.find(f =>
        f.path.toLowerCase().includes('price') || f.path.toLowerCase().includes('c')
    );
    const changeField = widget.selectedFields.find(f =>
        f.path.toLowerCase().includes('change') || f.path.toLowerCase().includes('dp')
    );

    const price = priceField ? getValueByPath(data, priceField.path) : 0;
    const change = changeField ? getValueByPath(data, changeField.path) : 0;
    const { text: changeText, isPositive } = formatChange(change as number);

    // Get symbol from widget name or data
    const symbol = widget.name || 'STOCK';

    return (
        <div className="flex h-full flex-col items-center justify-center py-8">
            {/* Symbol */}
            <p className="mb-1 text-sm uppercase tracking-wider text-[var(--text-muted)]">
                {symbol.toUpperCase().split(' ')[0]}
            </p>
            {/* Name */}
            <h2 className="mb-4 text-2xl font-bold text-[var(--text-primary)]">
                {widget.name || 'Stock'}
            </h2>
            {/* Large Price */}
            <p className="mb-4 text-5xl font-bold text-[var(--text-primary)]">
                {formatPrice(price as number)}
            </p>
            {/* Change Badge */}
            <div className={`flex items-center gap-1 rounded-full px-4 py-2 ${isPositive
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-pink-500/20 text-pink-400'
                }`}>
                {isPositive ? <TrendUp /> : <TrendDown />}
                <span className="font-semibold">{changeText}</span>
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
                // IndianAPI format: { currentPrice: 1234, percentChange: 1.5 }
                else if ('currentPrice' in itemData) {
                    price = (itemData.currentPrice || 0) as number;
                    change = (itemData.percentChange || 0) as number;
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

// Market Gainers Card (top movers)
function MarketGainersCard({ widget, data }: CardWidgetProps) {
    // Try to extract top gainers from data
    // CoinGecko trending or markets endpoint returns array
    const items = Array.isArray(data) ? data.slice(0, 5) : [];

    if (items.length > 0) {
        return (
            <div className="space-y-2">
                {items.map((item: Record<string, unknown>, index: number) => {
                    const name = (item.name || item.id || `Item ${index + 1}`) as string;
                    const symbol = (item.symbol || name.substring(0, 4)) as string;
                    const price = (item.current_price || item.price || 0) as number;
                    const change = (item.price_change_percentage_24h || item.change || 0) as number;

                    return (
                        <WatchlistRow
                            key={symbol + index}
                            name={name}
                            symbol={symbol.toUpperCase()}
                            price={price}
                            change={change}
                            index={index}
                        />
                    );
                })}
            </div>
        );
    }

    // Fallback
    return (
        <div className="flex h-32 items-center justify-center text-[var(--text-muted)]">
            No gainers data
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
