import { NextRequest, NextResponse } from 'next/server';
import { getProvider } from '@/lib/providers';

export interface SearchResult {
    symbol: string;
    name: string;
    type?: string;
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const providerId = searchParams.get('provider');
    const query = searchParams.get('q');

    if (!providerId) {
        return NextResponse.json(
            { error: 'Provider ID is required' },
            { status: 400 }
        );
    }

    if (!query || query.length < 2) {
        return NextResponse.json({ results: [] });
    }

    const provider = getProvider(providerId);
    if (!provider) {
        return NextResponse.json(
            { error: `Unknown provider: ${providerId}` },
            { status: 400 }
        );
    }

    if (!provider.searchEndpoint) {
        return NextResponse.json(
            { error: `Provider ${provider.name} does not support symbol search` },
            { status: 400 }
        );
    }

    try {
        const searchConfig = provider.searchEndpoint;
        let searchUrl = `${provider.baseUrl}${searchConfig.path}`;

        // Build search URL with query
        const urlParams = new URLSearchParams();
        urlParams.set(searchConfig.queryParam, query);

        // Add API key if required
        if (provider.requiresApiKey && provider.envKeyName) {
            const apiKey = process.env[provider.envKeyName];
            if (!apiKey) {
                return NextResponse.json(
                    { error: `API key not configured for ${provider.name}` },
                    { status: 500 }
                );
            }

            // Provider-specific API key handling
            switch (providerId) {
                case 'alphavantage':
                    urlParams.set('function', 'SYMBOL_SEARCH');
                    urlParams.set('apikey', apiKey);
                    break;
                case 'finnhub':
                    urlParams.set('token', apiKey);
                    break;
                case 'indianapi':
                    // IndianAPI uses header auth - will add below
                    break;
                default:
                    urlParams.set('api_key', apiKey);
            }
        }

        searchUrl += (searchUrl.includes('?') ? '&' : '?') + urlParams.toString();

        // Prepare headers
        const headers: HeadersInit = {
            'Accept': 'application/json',
            'User-Agent': 'FinBoard/1.0',
        };

        // IndianAPI uses X-Api-Key header
        if (providerId === 'indianapi' && provider.envKeyName) {
            const apiKey = process.env[provider.envKeyName];
            if (apiKey) {
                headers['X-Api-Key'] = apiKey;
            }
        }

        // CoinGecko demo API key
        if (providerId === 'coingecko' && provider.envKeyName) {
            const apiKey = process.env[provider.envKeyName];
            if (apiKey) {
                headers['x-cg-demo-api-key'] = apiKey;
            }
        }

        const response = await fetch(searchUrl, {
            headers,
            signal: AbortSignal.timeout(10000),
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'No details');
            return NextResponse.json(
                { error: `Search API error: ${response.status} - ${errorText}` },
                { status: response.status }
            );
        }

        const data = await response.json();

        // Extract results from response based on provider config
        let rawResults = data;
        if (searchConfig.resultsPath) {
            rawResults = data[searchConfig.resultsPath] || [];
        }

        if (!Array.isArray(rawResults)) {
            rawResults = [];
        }

        // Normalize results
        const results: SearchResult[] = rawResults.slice(0, 10).map((item: Record<string, unknown>) => ({
            symbol: String(item[searchConfig.symbolField] || ''),
            name: String(item[searchConfig.nameField] || ''),
            type: searchConfig.typeField ? String(item[searchConfig.typeField] || '') : undefined,
        }));

        return NextResponse.json({ results });
    } catch (error) {
        console.error('Search API error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Search failed' },
            { status: 500 }
        );
    }
}
