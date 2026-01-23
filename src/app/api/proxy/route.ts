import { NextRequest, NextResponse } from 'next/server';

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
            return NextResponse.json(
                { error: `API returned ${response.status}: ${response.statusText}` },
                { status: response.status }
            );
        }

        const contentType = response.headers.get('content-type');

        if (contentType?.includes('application/json')) {
            const data = await response.json();
            return NextResponse.json(data);
        } else {
            const text = await response.text();
            // Try to parse as JSON anyway
            try {
                const data = JSON.parse(text);
                return NextResponse.json(data);
            } catch {
                return NextResponse.json(
                    { error: 'Response is not valid JSON' },
                    { status: 400 }
                );
            }
        }
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
