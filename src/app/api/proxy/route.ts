import { NextRequest, NextResponse } from 'next/server';

// Shared fetch logic
async function fetchFromUrl(url: string) {
    // Validate URL
    const targetUrl = new URL(url);

    // Fetch from the target API
    const response = await fetch(targetUrl.toString(), {
        headers: {
            'Accept': 'application/json',
            'User-Agent': 'FinBoard/1.0',
        },
        // Add timeout
        signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
        const errorText = await response.text().catch(() => 'No error details');
        throw new Error(`API returned ${response.status}: ${response.statusText}. ${errorText}`);
    }

    const text = await response.text();

    // Handle empty response
    if (!text || text.trim() === '') {
        throw new Error('API returned empty response');
    }

    // Try to parse as JSON
    try {
        return JSON.parse(text);
    } catch {
        throw new Error('Response is not valid JSON');
    }
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get('url');

    if (!url) {
        return NextResponse.json(
            { error: 'URL parameter is required' },
            { status: 400 }
        );
    }

    try {
        const data = await fetchFromUrl(url);
        return NextResponse.json(data);
    } catch (error) {
        if (error instanceof TypeError && error.message.includes('Invalid URL')) {
            return NextResponse.json(
                { error: 'Invalid URL format' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to fetch from API' },
            { status: 500 }
        );
    }
}

// POST handler for the modal's API calls
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const url = body.url;

        if (!url) {
            return NextResponse.json(
                { error: 'URL is required in request body' },
                { status: 400 }
            );
        }

        const data = await fetchFromUrl(url);
        return NextResponse.json(data);
    } catch (error) {
        if (error instanceof SyntaxError) {
            return NextResponse.json(
                { error: 'Invalid request body - expected JSON' },
                { status: 400 }
            );
        }

        if (error instanceof TypeError && error.message.includes('Invalid URL')) {
            return NextResponse.json(
                { error: 'Invalid URL format' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to fetch from API' },
            { status: 500 }
        );
    }
}

