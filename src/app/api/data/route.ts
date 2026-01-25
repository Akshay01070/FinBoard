import { NextRequest, NextResponse } from 'next/server';
import { getProvider, getEndpoint, buildApiUrl } from '@/lib/providers';

// Request body interface
interface DataRequest {
    providerId: string;
    endpointId: string;
    params: Record<string, string>;
}

// Simple cache for API responses (30 second TTL)
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 30 * 1000; // 30 seconds

export async function POST(request: NextRequest) {
    try {
        const body: DataRequest = await request.json();
        const { providerId, endpointId, params } = body;

        // Validate provider
        const provider = getProvider(providerId);
        if (!provider) {
            return NextResponse.json(
                { error: `Unknown provider: ${providerId}` },
                { status: 400 }
            );
        }

        // Validate endpoint
        const endpoint = getEndpoint(providerId, endpointId);
        if (!endpoint) {
            return NextResponse.json(
                { error: `Unknown endpoint: ${endpointId}` },
                { status: 400 }
            );
        }

        // Build the API URL
        let apiUrl = buildApiUrl(provider, endpoint, params);

        // DEBUG: Log API call details
        console.log('=== API Data Route Debug ===');
        console.log('Provider:', providerId, '| Endpoint:', endpointId);
        console.log('Params:', JSON.stringify(params, null, 2));
        console.log('Constructed URL:', apiUrl);
        console.log('===========================');

        // Special handling for custom URLs
        if (providerId === 'custom') {
            apiUrl = params.url;
            if (!apiUrl) {
                return NextResponse.json(
                    { error: 'Custom URL is required' },
                    { status: 400 }
                );
            }
        }

        // Add API key from environment variables
        if (provider.requiresApiKey && provider.envKeyName) {
            const apiKey = process.env[provider.envKeyName];

            if (!apiKey) {
                return NextResponse.json(
                    { error: `API key not configured for ${provider.name}. Please add ${provider.envKeyName} to your .env.local file.` },
                    { status: 500 }
                );
            }

            // Different providers expect keys in different ways
            const urlObj = new URL(apiUrl);

            switch (providerId) {
                case 'alphavantage':
                    urlObj.searchParams.set('apikey', apiKey);
                    break;
                case 'finnhub':
                    urlObj.searchParams.set('token', apiKey);
                    break;
                case 'indianapi':
                    // IndianAPI uses header-based auth, handled below
                    break;
                default:
                    // Generic api_key parameter
                    urlObj.searchParams.set('api_key', apiKey);
            }

            apiUrl = urlObj.toString();
        }

        // Check cache
        const cacheKey = `${providerId}:${endpointId}:${JSON.stringify(params)}`;
        const cached = cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
            return NextResponse.json({
                data: cached.data,
                cached: true,
                provider: provider.name,
                endpoint: endpoint.name,
            });
        }

        // Prepare headers
        const headers: HeadersInit = {
            'Accept': 'application/json',
            'User-Agent': 'FinBoard/1.0',
        };

        // Add API key as header for providers that require it
        if (providerId === 'indianapi' && provider.envKeyName) {
            const apiKey = process.env[provider.envKeyName];
            if (apiKey) {
                headers['X-Api-Key'] = apiKey;
            }
        }

        // CoinGecko Pro API key (optional)
        if (providerId === 'coingecko' && provider.envKeyName) {
            const apiKey = process.env[provider.envKeyName];
            if (apiKey) {
                headers['x-cg-demo-api-key'] = apiKey;
            }
        }

        // Fetch data from the external API
        const response = await fetch(apiUrl, {
            headers,
            signal: AbortSignal.timeout(15000), // 15 second timeout
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'No error details');
            console.error(`[API Error] ${response.status} from ${apiUrl}`);
            console.error(`[API Body] ${errorText}`);

            return NextResponse.json(
                { error: `API error: ${response.status} - ${errorText}` },
                { status: response.status }
            );
        }

        // Get response text first to handle empty responses
        const text = await response.text();

        if (!text || text.trim() === '') {
            return NextResponse.json(
                { error: 'API returned empty response' },
                { status: 500 }
            );
        }

        let data;
        try {
            data = JSON.parse(text);
        } catch {
            return NextResponse.json(
                { error: 'API returned invalid JSON' },
                { status: 500 }
            );
        }

        // Store in cache
        cache.set(cacheKey, { data, timestamp: Date.now() });

        return NextResponse.json({
            data,
            cached: false,
            provider: provider.name,
            endpoint: endpoint.name,
        });
    } catch (error) {
        console.error('Data API error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error occurred' },
            { status: 500 }
        );
    }
}

// GET handler for simple testing
export async function GET() {
    return NextResponse.json({
        message: 'FinBoard Data API',
        usage: 'POST with { providerId, endpointId, params }',
        providers: ['coingecko', 'alphavantage', 'finnhub', 'indianapi', 'custom'],
    });
}
