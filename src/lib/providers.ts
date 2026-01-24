// API Provider Registry
// Centralized configuration for all supported financial data providers

import { DisplayMode, ChartType, FieldConfig } from '@/types';

export type ProviderCategory = 'crypto' | 'stocks' | 'forex' | 'indian' | 'custom';

export interface ParamDef {
    id: string;
    name: string;
    type: 'text' | 'select' | 'symbol';  // 'symbol' triggers search
    required: boolean;
    default?: string;
    options?: { value: string; label: string }[];
    placeholder?: string;
}

export interface SearchEndpoint {
    path: string;
    queryParam: string;  // e.g., 'q' or 'query' or 'keywords'
    resultsPath?: string;  // JSON path to results array
    symbolField: string;  // Field name for symbol in response
    nameField: string;    // Field name for name in response
    typeField?: string;   // Optional field for asset type
}

export interface ApiEndpoint {
    id: string;
    name: string;
    description: string;
    path: string;
    params: ParamDef[];
    defaultFields: FieldConfig[];
    displayMode: DisplayMode;
    chartType?: ChartType;
    defaultLayout?: { w: number; h: number };
}

export interface ApiProvider {
    id: string;
    name: string;
    icon: string;
    category: ProviderCategory;
    description: string;
    baseUrl: string;
    endpoints: ApiEndpoint[];
    requiresApiKey: boolean;
    envKeyName?: string;
    docsUrl?: string;
    searchEndpoint?: SearchEndpoint;  // Symbol search config
    // Widget type compatibility
    supportsCard: boolean;
    supportsTable: boolean;
    supportsChart: boolean;
}

// Provider configurations
export const providers: ApiProvider[] = [
    // ============================================
    // CoinGecko - Free crypto data
    // ============================================
    {
        id: 'coingecko',
        name: 'CoinGecko',
        icon: '🦎',
        category: 'crypto',
        description: 'Free cryptocurrency data - prices, market cap, volume',
        baseUrl: 'https://api.coingecko.com/api/v3',
        requiresApiKey: false,
        envKeyName: 'COINGECKO_API_KEY',
        docsUrl: 'https://www.coingecko.com/api/documentation',
        searchEndpoint: {
            path: '/search',
            queryParam: 'query',
            resultsPath: 'coins',
            symbolField: 'id',  // Use 'id' (e.g. 'bitcoin') instead of 'symbol' (e.g. 'btc') for API calls
            nameField: 'name',
            typeField: 'market_cap_rank',
        },
        endpoints: [
            {
                id: 'simple-price',
                name: 'Crypto Price',
                description: 'Current price for cryptocurrencies',
                path: '/simple/price',
                params: [
                    {
                        id: 'ids',
                        name: 'Coin',
                        type: 'symbol',
                        required: true,
                        placeholder: 'Search for a coin...',
                    },
                    {
                        id: 'vs_currencies',
                        name: 'Currency',
                        type: 'select',
                        required: true,
                        default: 'inr',
                        options: [
                            { value: 'usd', label: 'USD' },
                            { value: 'eur', label: 'EUR' },
                            { value: 'inr', label: 'INR' },
                        ],
                    },
                    {
                        id: 'include_24hr_change',
                        name: 'Include 24h Change',
                        type: 'select',
                        required: false,
                        default: 'true',
                        options: [
                            { value: 'true', label: 'Yes' },
                            { value: 'false', label: 'No' },
                        ],
                    },
                ],
                defaultFields: [],
                displayMode: 'card',
                defaultLayout: { w: 4, h: 3 },
            },
            {
                id: 'coins-markets',
                name: 'Market Data',
                description: 'Top coins with market cap, volume, price change',
                path: '/coins/markets',
                params: [
                    {
                        id: 'vs_currency',
                        name: 'Currency',
                        type: 'select',
                        required: true,
                        default: 'usd',
                        options: [
                            { value: 'usd', label: 'USD' },
                            { value: 'eur', label: 'EUR' },
                            { value: 'inr', label: 'INR' },
                        ],
                    },
                    {
                        id: 'per_page',
                        name: 'Limit',
                        type: 'select',
                        required: false,
                        default: '10',
                        options: [
                            { value: '5', label: '5' },
                            { value: '10', label: '10' },
                            { value: '25', label: '25' },
                        ],
                    },
                ],
                defaultFields: [
                    { path: '[].name', label: 'Name', format: 'text' },
                    { path: '[].symbol', label: 'Symbol', format: 'text' },
                    { path: '[].current_price', label: 'Price', format: 'currency' },
                    { path: '[].price_change_percentage_24h', label: '24h %', format: 'percentage' },
                    { path: '[].market_cap', label: 'Market Cap', format: 'currency' },
                ],
                displayMode: 'table',
                defaultLayout: { w: 6, h: 3 },
            },
            {
                id: 'market-chart',
                name: 'Price Chart',
                description: 'Historical price data for charting',
                path: '/coins/{coinId}/market_chart',
                params: [
                    {
                        id: 'coinId',
                        name: 'Coin',
                        type: 'symbol',
                        required: true,
                        placeholder: 'Search for a coin...',
                    },
                    {
                        id: 'vs_currency',
                        name: 'Currency',
                        type: 'select',
                        required: true,
                        default: 'usd',
                        options: [
                            { value: 'usd', label: 'USD' },
                            { value: 'inr', label: 'INR' },
                        ],
                    },
                    {
                        id: 'days',
                        name: 'Days',
                        type: 'select',
                        required: true,
                        default: '7',
                        options: [
                            { value: '1', label: '1 Day' },
                            { value: '7', label: '7 Days' },
                            { value: '30', label: '30 Days' },
                        ],
                    },
                ],
                defaultFields: [
                    { path: 'prices', label: 'Price', format: 'currency' },
                ],
                displayMode: 'chart',
                chartType: 'line',
                defaultLayout: { w: 6, h: 3 },
            },
            {
                id: 'ohlc',
                name: 'Candlestick Chart',
                description: 'OHLC data for candlestick charts',
                path: '/coins/{coinId}/ohlc',
                params: [
                    {
                        id: 'coinId',
                        name: 'Coin',
                        type: 'symbol',
                        required: true,
                        placeholder: 'Search for a coin...',
                    },
                    {
                        id: 'vs_currency',
                        name: 'Currency',
                        type: 'select',
                        required: true,
                        default: 'usd',
                        options: [
                            { value: 'usd', label: 'USD' },
                        ],
                    },
                    {
                        id: 'days',
                        name: 'Days',
                        type: 'select',
                        required: true,
                        default: '7',
                        options: [
                            { value: '1', label: '1 Day' },
                            { value: '7', label: '7 Days' },
                            { value: '30', label: '30 Days' },
                        ],
                    },
                ],
                defaultFields: [],
                displayMode: 'chart',
                chartType: 'candlestick',
                defaultLayout: { w: 6, h: 3 },
            },
        ],
        supportsCard: true,
        supportsTable: true,
        supportsChart: true,
    },

    // ============================================
    // Alpha Vantage - Stocks & Forex
    // ============================================
    {
        id: 'alphavantage',
        name: 'Alpha Vantage',
        icon: '📈',
        category: 'stocks',
        description: 'Stock quotes, forex rates, technical indicators',
        baseUrl: 'https://www.alphavantage.co/query',
        requiresApiKey: true,
        envKeyName: 'ALPHA_VANTAGE_API_KEY',
        docsUrl: 'https://www.alphavantage.co/documentation/',
        searchEndpoint: {
            path: '',
            queryParam: 'keywords',
            resultsPath: 'bestMatches',
            symbolField: '1. symbol',
            nameField: '2. name',
            typeField: '3. type',
        },
        endpoints: [
            {
                id: 'global-quote',
                name: 'Stock Quote',
                description: 'Real-time stock price and change',
                path: '',
                params: [
                    {
                        id: 'function',
                        name: 'Function',
                        type: 'text',
                        required: true,
                        default: 'GLOBAL_QUOTE',
                    },
                    {
                        id: 'symbol',
                        name: 'Stock Symbol',
                        type: 'symbol',
                        required: true,
                        placeholder: 'Search for a stock...',
                    },
                ],
                defaultFields: [
                    { path: 'Global Quote.01. symbol', label: 'Symbol', format: 'text' },
                    { path: 'Global Quote.05. price', label: 'Price', format: 'currency' },
                    { path: 'Global Quote.10. change percent', label: 'Change %', format: 'percentage' },
                ],
                displayMode: 'card',
                defaultLayout: { w: 4, h: 3 },
            },
            {
                id: 'currency-exchange',
                name: 'Forex Rate',
                description: 'Real-time currency exchange rates',
                path: '',
                params: [
                    {
                        id: 'function',
                        name: 'Function',
                        type: 'text',
                        required: true,
                        default: 'CURRENCY_EXCHANGE_RATE',
                    },
                    {
                        id: 'from_currency',
                        name: 'From Currency',
                        type: 'text',
                        required: true,
                        default: 'USD',
                        placeholder: 'USD',
                    },
                    {
                        id: 'to_currency',
                        name: 'To Currency',
                        type: 'text',
                        required: true,
                        default: 'INR',
                        placeholder: 'INR',
                    },
                ],
                defaultFields: [
                    { path: 'Realtime Currency Exchange Rate.1. From_Currency Code', label: 'From', format: 'text' },
                    { path: 'Realtime Currency Exchange Rate.3. To_Currency Code', label: 'To', format: 'text' },
                    { path: 'Realtime Currency Exchange Rate.5. Exchange Rate', label: 'Rate', format: 'number' },
                ],
                displayMode: 'card',
                defaultLayout: { w: 4, h: 3 },
            },
        ],
        supportsCard: true,
        supportsTable: false,
        supportsChart: true,
    },

    // ============================================
    // Finnhub - Real-time market data
    // ============================================
    {
        id: 'finnhub',
        name: 'Finnhub',
        icon: '🐟',
        category: 'stocks',
        description: 'Real-time stock data, company profiles, news',
        baseUrl: 'https://finnhub.io/api/v1',
        requiresApiKey: true,
        envKeyName: 'FINNHUB_API_KEY',
        docsUrl: 'https://finnhub.io/docs/api',
        searchEndpoint: {
            path: '/search',
            queryParam: 'q',
            resultsPath: 'result',
            symbolField: 'symbol',
            nameField: 'description',
            typeField: 'type',
        },
        endpoints: [
            {
                id: 'quote',
                name: 'Stock Quote',
                description: 'Real-time quote data for US stocks',
                path: '/quote',
                params: [
                    {
                        id: 'symbol',
                        name: 'Stock Symbol',
                        type: 'symbol',
                        required: true,
                        placeholder: 'Search for a stock...',
                    },
                ],
                defaultFields: [
                    { path: 'c', label: 'Current Price', format: 'currency' },
                    { path: 'h', label: 'High', format: 'currency' },
                    { path: 'l', label: 'Low', format: 'currency' },
                    { path: 'dp', label: 'Change %', format: 'percentage' },
                ],
                displayMode: 'card',
                defaultLayout: { w: 4, h: 3 },
            },
            {
                id: 'company-profile',
                name: 'Company Profile',
                description: 'Company information and metrics',
                path: '/stock/profile2',
                params: [
                    {
                        id: 'symbol',
                        name: 'Stock Symbol',
                        type: 'symbol',
                        required: true,
                        placeholder: 'Search for a stock...',
                    },
                ],
                defaultFields: [
                    { path: 'name', label: 'Name', format: 'text' },
                    { path: 'ticker', label: 'Ticker', format: 'text' },
                    { path: 'marketCapitalization', label: 'Market Cap', format: 'currency' },
                    { path: 'finnhubIndustry', label: 'Industry', format: 'text' },
                ],
                displayMode: 'card',
                defaultLayout: { w: 4, h: 3 },
            },
            {
                id: 'market-news',
                name: 'Market News',
                description: 'Latest financial news',
                path: '/news',
                params: [
                    {
                        id: 'category',
                        name: 'Category',
                        type: 'select',
                        required: true,
                        default: 'general',
                        options: [
                            { value: 'general', label: 'General' },
                            { value: 'forex', label: 'Forex' },
                            { value: 'crypto', label: 'Crypto' },
                            { value: 'merger', label: 'Mergers' },
                        ],
                    },
                ],
                defaultFields: [
                    { path: '[].headline', label: 'Headline', format: 'text' },
                    { path: '[].source', label: 'Source', format: 'text' },
                ],
                displayMode: 'table',
                defaultLayout: { w: 6, h: 3 },
            },
        ],
        supportsCard: true,
        supportsTable: true,
        supportsChart: true,
    },

    // ============================================
    // IndianAPI - NSE/BSE data
    // ============================================
    {
        id: 'indianapi',
        name: 'IndianAPI',
        icon: '🇮🇳',
        category: 'indian',
        description: 'Indian stock market data - NSE, BSE',
        baseUrl: 'https://stock.indianapi.in',
        requiresApiKey: true,
        envKeyName: 'INDIANAPI_API_KEY',
        docsUrl: 'https://indianapi.in/docs/stock',
        searchEndpoint: {
            path: '/search',
            queryParam: 'name',
            resultsPath: 'results',
            symbolField: 'symbol',
            nameField: 'name',
        },
        endpoints: [
            {
                id: 'stock-price',
                name: 'Stock Price',
                description: 'Real-time Indian stock prices',
                path: '/stock',
                params: [
                    {
                        id: 'name',
                        name: 'Stock',
                        type: 'symbol',
                        required: true,
                        placeholder: 'Search for a stock...',
                    },
                ],
                defaultFields: [
                    { path: 'companyName', label: 'Company', format: 'text' },
                    { path: 'currentPrice', label: 'Price', format: 'currency' },
                    { path: 'percentChange', label: 'Change %', format: 'percentage' },
                ],
                displayMode: 'card',
                defaultLayout: { w: 4, h: 3 },
            },
            {
                id: 'trending',
                name: 'Trending Stocks',
                description: 'Most active stocks in Indian market',
                path: '/trending',
                params: [],
                defaultFields: [
                    { path: 'topGainers.[].symbol', label: 'Symbol', format: 'text' },
                    { path: 'topGainers.[].ltp', label: 'Price', format: 'currency' },
                    { path: 'topGainers.[].netChange', label: 'Change', format: 'currency' },
                ],
                displayMode: 'table',
                defaultLayout: { w: 6, h: 3 },
            },
            {
                id: 'ipo',
                name: 'IPO Calendar',
                description: 'Upcoming and ongoing IPOs',
                path: '/ipo',
                params: [],
                defaultFields: [
                    { path: 'upcoming.[].name', label: 'Company', format: 'text' },
                    { path: 'upcoming.[].date', label: 'Date', format: 'text' },
                    { path: 'upcoming.[].price', label: 'Price Range', format: 'text' },
                ],
                displayMode: 'table',
                defaultLayout: { w: 6, h: 3 },
            },
        ],
        supportsCard: true,
        supportsTable: true,
        supportsChart: false,
    },

    // ============================================
    // Custom URL - Fallback for any API
    // ============================================
    {
        id: 'custom',
        name: 'Custom URL',
        icon: '🔗',
        category: 'custom',
        description: 'Connect to any REST API with a custom URL',
        baseUrl: '',
        requiresApiKey: false,
        endpoints: [
            {
                id: 'custom-endpoint',
                name: 'Custom Endpoint',
                description: 'Enter your own API URL',
                path: '',
                params: [
                    {
                        id: 'url',
                        name: 'API URL',
                        type: 'text',
                        required: true,
                        placeholder: 'https://api.example.com/data',
                    },
                ],
                defaultFields: [],
                displayMode: 'card',
                defaultLayout: { w: 4, h: 3 },
            },
        ],
        supportsCard: true,
        supportsTable: true,
        supportsChart: true,
    },
];

// Helper functions
export function getProvider(providerId: string): ApiProvider | undefined {
    return providers.find(p => p.id === providerId);
}

export function getEndpoint(providerId: string, endpointId: string): ApiEndpoint | undefined {
    const provider = getProvider(providerId);
    return provider?.endpoints.find(e => e.id === endpointId);
}

export function getProvidersByCategory(category: ProviderCategory): ApiProvider[] {
    return providers.filter(p => p.category === category);
}

export function buildApiUrl(
    provider: ApiProvider,
    endpoint: ApiEndpoint,
    params: Record<string, string>
): string {
    if (provider.id === 'custom') {
        return params.url || '';
    }

    let url = provider.baseUrl + endpoint.path;

    // Replace path parameters like {coinId}
    Object.entries(params).forEach(([key, value]) => {
        url = url.replace(`{${key}}`, encodeURIComponent(value));
    });

    // Build query string for remaining params
    const queryParams = new URLSearchParams();
    endpoint.params.forEach(param => {
        if (!url.includes(`{${param.id}}`)) {
            const value = params[param.id] || param.default;
            if (value) {
                queryParams.set(param.id, value);
            }
        }
    });

    const queryString = queryParams.toString();
    if (queryString) {
        url += (url.includes('?') ? '&' : '?') + queryString;
    }

    return url;
}
