// Pre-built widget templates for common finance use cases

export interface WidgetTemplate {
    id: string;
    name: string;
    description: string;
    category: 'stocks' | 'crypto' | 'forex' | 'commodities';
    displayMode: 'card' | 'table' | 'chart';
    chartType?: 'line' | 'candlestick';
    apiUrl: string;
    refreshInterval: number;
    selectedFields: {
        path: string;
        label: string;
        format?: 'currency' | 'percentage' | 'number' | 'text';
    }[];
    icon: string;
}

export const widgetTemplates: WidgetTemplate[] = [
    // Cryptocurrency Templates
    {
        id: 'btc-price',
        name: 'Bitcoin Price',
        description: 'Real-time BTC exchange rates',
        category: 'crypto',
        displayMode: 'card',
        apiUrl: 'https://api.coinbase.com/v2/exchange-rates?currency=BTC',
        refreshInterval: 30,
        selectedFields: [
            { path: 'data.currency', label: 'Currency', format: 'text' },
            { path: 'data.rates.USD', label: 'USD', format: 'currency' },
            { path: 'data.rates.EUR', label: 'EUR', format: 'currency' },
            { path: 'data.rates.GBP', label: 'GBP', format: 'currency' },
        ],
        icon: '₿',
    },
    {
        id: 'eth-price',
        name: 'Ethereum Price',
        description: 'Real-time ETH exchange rates',
        category: 'crypto',
        displayMode: 'card',
        apiUrl: 'https://api.coinbase.com/v2/exchange-rates?currency=ETH',
        refreshInterval: 30,
        selectedFields: [
            { path: 'data.currency', label: 'Currency', format: 'text' },
            { path: 'data.rates.USD', label: 'USD', format: 'currency' },
            { path: 'data.rates.EUR', label: 'EUR', format: 'currency' },
        ],
        icon: 'Ξ',
    },
    {
        id: 'crypto-prices',
        name: 'Crypto Watchlist',
        description: 'Top cryptocurrency prices',
        category: 'crypto',
        displayMode: 'table',
        apiUrl: 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1',
        refreshInterval: 60,
        selectedFields: [
            { path: 'name', label: 'Name', format: 'text' },
            { path: 'symbol', label: 'Symbol', format: 'text' },
            { path: 'current_price', label: 'Price', format: 'currency' },
            { path: 'price_change_percentage_24h', label: '24h Change', format: 'percentage' },
            { path: 'market_cap', label: 'Market Cap', format: 'number' },
        ],
        icon: '📊',
    },
    {
        id: 'market-gainers',
        name: 'Market Gainers',
        description: 'Top gaining cryptocurrencies',
        category: 'crypto',
        displayMode: 'table',
        apiUrl: 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=price_change_percentage_24h_desc&per_page=10&page=1',
        refreshInterval: 120,
        selectedFields: [
            { path: 'name', label: 'Name', format: 'text' },
            { path: 'symbol', label: 'Symbol', format: 'text' },
            { path: 'current_price', label: 'Price', format: 'currency' },
            { path: 'price_change_percentage_24h', label: '24h Change', format: 'percentage' },
        ],
        icon: '📈',
    },
    {
        id: 'market-losers',
        name: 'Market Losers',
        description: 'Top losing cryptocurrencies',
        category: 'crypto',
        displayMode: 'table',
        apiUrl: 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=price_change_percentage_24h_asc&per_page=10&page=1',
        refreshInterval: 120,
        selectedFields: [
            { path: 'name', label: 'Name', format: 'text' },
            { path: 'symbol', label: 'Symbol', format: 'text' },
            { path: 'current_price', label: 'Price', format: 'currency' },
            { path: 'price_change_percentage_24h', label: '24h Change', format: 'percentage' },
        ],
        icon: '📉',
    },
    // Chart Templates
    {
        id: 'btc-chart',
        name: 'Bitcoin Price Chart',
        description: '7-day BTC price history line chart',
        category: 'crypto',
        displayMode: 'chart',
        chartType: 'line',
        apiUrl: 'https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=7',
        refreshInterval: 300,
        selectedFields: [
            { path: 'prices', label: 'Price', format: 'currency' },
        ],
        icon: '📈',
    },
    {
        id: 'eth-chart',
        name: 'Ethereum Price Chart',
        description: '7-day ETH price history line chart',
        category: 'crypto',
        displayMode: 'chart',
        chartType: 'line',
        apiUrl: 'https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=usd&days=7',
        refreshInterval: 300,
        selectedFields: [
            { path: 'prices', label: 'Price', format: 'currency' },
        ],
        icon: '📊',
    },
    // Forex Templates
    {
        id: 'usd-rates',
        name: 'USD Exchange Rates',
        description: 'US Dollar exchange rates',
        category: 'forex',
        displayMode: 'card',
        apiUrl: 'https://api.coinbase.com/v2/exchange-rates?currency=USD',
        refreshInterval: 60,
        selectedFields: [
            { path: 'data.currency', label: 'Base', format: 'text' },
            { path: 'data.rates.EUR', label: 'EUR', format: 'number' },
            { path: 'data.rates.GBP', label: 'GBP', format: 'number' },
            { path: 'data.rates.JPY', label: 'JPY', format: 'number' },
            { path: 'data.rates.INR', label: 'INR', format: 'number' },
        ],
        icon: '$',
    },
    {
        id: 'eur-rates',
        name: 'EUR Exchange Rates',
        description: 'Euro exchange rates',
        category: 'forex',
        displayMode: 'card',
        apiUrl: 'https://api.coinbase.com/v2/exchange-rates?currency=EUR',
        refreshInterval: 60,
        selectedFields: [
            { path: 'data.currency', label: 'Base', format: 'text' },
            { path: 'data.rates.USD', label: 'USD', format: 'number' },
            { path: 'data.rates.GBP', label: 'GBP', format: 'number' },
            { path: 'data.rates.JPY', label: 'JPY', format: 'number' },
        ],
        icon: '€',
    },
];

export const getTemplatesByCategory = (category: WidgetTemplate['category']) => {
    return widgetTemplates.filter((t) => t.category === category);
};

export const getTemplateById = (id: string) => {
    return widgetTemplates.find((t) => t.id === id);
};
