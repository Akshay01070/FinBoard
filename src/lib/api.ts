import { ApiTestResult, FlattenedField } from '@/types';
import { flattenObject } from './dataMapper';

const API_CACHE = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 30000; // 30 seconds default

/**
 * Tests an API endpoint and returns the response structure
 */
export async function testApiConnection(url: string): Promise<ApiTestResult> {
    try {
        // Use our proxy to avoid CORS issues
        const proxyUrl = `/api/proxy?url=${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        const flattened = flattenObject(data);

        return {
            success: true,
            data,
            fields: flattened.map((f: FlattenedField) => f.path),
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to connect to API',
        };
    }
}

/**
 * Fetches data from an API with caching
 * Uses /api/data for provider-based requests (with API key injection)
 * Uses /api/proxy for custom URLs
 */
export async function fetchApiData(
    url: string,
    options: {
        useCache?: boolean;
        cacheTTL?: number;
        providerId?: string;
        endpointId?: string;
        params?: Record<string, string>;
    } = {}
): Promise<{ data: unknown; fromCache: boolean; error?: string }> {
    const { useCache = true, cacheTTL = CACHE_TTL, providerId, endpointId, params } = options;

    // Check cache first
    const cacheKey = providerId ? `${providerId}:${endpointId}:${JSON.stringify(params)}` : url;
    if (useCache) {
        const cached = API_CACHE.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < cacheTTL) {
            return { data: cached.data, fromCache: true };
        }
    }

    try {
        let response;

        // Use /api/data for provider-based requests (adds API keys)
        if (providerId && providerId !== 'custom' && endpointId) {
            response = await fetch('/api/data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    providerId,
                    endpointId,
                    params: params || {},
                }),
            });
        } else {
            // Use /api/proxy for custom URLs
            const proxyUrl = `/api/proxy?url=${encodeURIComponent(url)}`;
            response = await fetch(proxyUrl);
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        const data = result.data || result;

        // Update cache
        API_CACHE.set(cacheKey, { data, timestamp: Date.now() });

        return { data, fromCache: false };
    } catch (error) {
        return {
            data: null,
            fromCache: false,
            error: error instanceof Error ? error.message : 'Failed to fetch data',
        };
    }
}

/**
 * Clears the API cache
 */
export function clearApiCache(url?: string): void {
    if (url) {
        API_CACHE.delete(url);
    } else {
        API_CACHE.clear();
    }
}
