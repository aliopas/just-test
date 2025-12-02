import { NextRequest, NextResponse } from 'next/server';

/**
 * Next.js API Route Handler that proxies all /api/v1/* requests to the backend server.
 * This works for both Server-Side and Client-Side requests.
 * 
 * In local development: proxies to http://localhost:3001
 * In production (Netlify): this route should not be used as Netlify redirects handle it
 */

// Extract backend base URL (without /api/v1 suffix)
function getBackendBaseUrl(): string {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
  
  // If it's a relative path or contains /api/v1, extract the base
  if (apiBaseUrl.startsWith('/')) {
    // Relative path - use default localhost
    return 'http://localhost:3001';
  }
  
  // If it contains /api/v1, remove it
  if (apiBaseUrl.includes('/api/v1')) {
    return apiBaseUrl.replace(/\/api\/v1\/?$/, '');
  }
  
  return apiBaseUrl;
}

const BACKEND_BASE_URL = getBackendBaseUrl();

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

async function proxyRequest(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const pathSegments = params.path || [];
    const path = pathSegments.join('/');
    
    // Get query string from original request
    const queryString = request.nextUrl.search;
    const backendUrl = `${BACKEND_BASE_URL}/api/v1/${path}${queryString}`;

    // Get headers from original request
    const headers = new Headers();
    
    // Forward relevant headers
    request.headers.forEach((value, key) => {
      // Skip headers that shouldn't be forwarded
      if (
        key.toLowerCase() === 'host' ||
        key.toLowerCase() === 'connection' ||
        key.toLowerCase() === 'content-length' ||
        key.toLowerCase() === 'transfer-encoding'
      ) {
        return;
      }
      headers.set(key, value);
    });

    // Prepare request options
    const requestOptions: RequestInit = {
      method: request.method,
      headers,
      // Forward body for POST, PUT, PATCH requests
      body: ['GET', 'HEAD'].includes(request.method)
        ? undefined
        : await request.text().catch(() => undefined),
    };

    // Make request to backend
    const backendResponse = await fetch(backendUrl, requestOptions);

    // Get response body
    const responseBody = await backendResponse.text();

    // Create response with same status and headers
    const response = new NextResponse(responseBody, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
    });

    // Forward response headers
    backendResponse.headers.forEach((value, key) => {
      // Skip headers that shouldn't be forwarded
      if (
        key.toLowerCase() === 'content-encoding' ||
        key.toLowerCase() === 'transfer-encoding' ||
        key.toLowerCase() === 'connection'
      ) {
        return;
      }
      response.headers.set(key, value);
    });

    // Ensure CORS headers are set
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return response;
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'PROXY_ERROR',
          message: 'Failed to proxy request to backend server',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}

// Handle all HTTP methods
export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
export const OPTIONS = proxyRequest;
export const HEAD = proxyRequest;

