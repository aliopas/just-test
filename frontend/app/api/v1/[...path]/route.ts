import { NextRequest, NextResponse } from 'next/server';

/**
 * API Proxy Route Handler for Next.js
 * 
 * This route handler proxies all API requests to the backend server.
 * It works in both development (localhost) and production (via Netlify).
 * 
 * In development: proxies to http://localhost:3001
 * In production: Netlify handles routing via netlify.toml redirects
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> | { path: string[] } }
) {
  const params = await Promise.resolve(context.params);
  if (process.env.NODE_ENV === 'development') {
    console.log('[API Proxy] GET request received:', request.nextUrl.pathname);
  }
  return proxyRequest(request, params);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> | { path: string[] } }
) {
  const params = await Promise.resolve(context.params);
  return proxyRequest(request, params);
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> | { path: string[] } }
) {
  const params = await Promise.resolve(context.params);
  return proxyRequest(request, params);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> | { path: string[] } }
) {
  const params = await Promise.resolve(context.params);
  return proxyRequest(request, params);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> | { path: string[] } }
) {
  const params = await Promise.resolve(context.params);
  return proxyRequest(request, params);
}

export async function OPTIONS() {
  // Handle CORS preflight requests
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

async function proxyRequest(
  request: NextRequest,
  { path }: { path: string[] }
) {
  try {
    // Build the backend URL
    const pathSegments = path || [];
    const apiPath = pathSegments.join('/');
    const backendUrl = `${BACKEND_URL}/api/v1/${apiPath}`;

    // Get query string from request
    const searchParams = request.nextUrl.searchParams.toString();
    const fullUrl = searchParams
      ? `${backendUrl}?${searchParams}`
      : backendUrl;

    // Log for debugging in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Proxy] ${request.method} ${request.nextUrl.pathname} -> ${fullUrl}`);
    }

    // Get request body if present
    let body: BodyInit | undefined;
    const contentType = request.headers.get('content-type');
    
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      if (contentType?.includes('application/json')) {
        body = await request.text();
      } else if (contentType?.includes('multipart/form-data')) {
        body = await request.formData();
      } else if (contentType?.includes('application/x-www-form-urlencoded')) {
        body = await request.text();
      } else {
        body = await request.arrayBuffer();
      }
    }

    // Prepare headers
    const headers = new Headers();
    
    // Copy relevant headers from the original request
    request.headers.forEach((value, key) => {
      // Skip headers that shouldn't be forwarded
      if (
        !['host', 'connection', 'content-length', 'transfer-encoding'].includes(
          key.toLowerCase()
        )
      ) {
        headers.set(key, value);
      }
    });

    // Make the request to the backend
    let response: Response;
    try {
      response = await fetch(fullUrl, {
        method: request.method,
        headers,
        body,
        // Forward credentials if present
        credentials: 'include',
      });

      if (process.env.NODE_ENV === 'development') {
        console.log(`[API Proxy] Response: ${response.status} ${response.statusText} from ${fullUrl}`);
      }
    } catch (fetchError) {
      console.error('[API Proxy] Fetch error:', fetchError);
      throw new Error(
        `Failed to connect to backend at ${fullUrl}. Is the backend server running on ${BACKEND_URL}?`
      );
    }

    // Get response body
    const responseText = await response.text();
    
    // Create response with same status and headers
    const proxiedResponse = new NextResponse(responseText, {
      status: response.status,
      statusText: response.statusText,
    });

    // Copy response headers (except some that shouldn't be forwarded)
    response.headers.forEach((value, key) => {
      if (
        !['content-encoding', 'transfer-encoding', 'content-length'].includes(
          key.toLowerCase()
        )
      ) {
        proxiedResponse.headers.set(key, value);
      }
    });

    // Set CORS headers if needed
    proxiedResponse.headers.set('Access-Control-Allow-Origin', '*');
    proxiedResponse.headers.set(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, PATCH, DELETE, OPTIONS'
    );
    proxiedResponse.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization'
    );

    return proxiedResponse;
  } catch (error) {
    console.error('[API Proxy] Error:', error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Failed to proxy request to backend';
    
    // Check if it's a connection error
    if (errorMessage.includes('Failed to connect')) {
      return NextResponse.json(
        {
          error: {
            code: 'BACKEND_CONNECTION_ERROR',
            message: `Cannot connect to backend server at ${BACKEND_URL}. Please ensure the backend is running.`,
          },
        },
        { status: 503 } // Service Unavailable
      );
    }

    return NextResponse.json(
      {
        error: {
          code: 'PROXY_ERROR',
          message: errorMessage,
        },
      },
      { status: 500 }
    );
  }
}

