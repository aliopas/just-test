import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public routes that don't require authentication
const publicRoutes = ['/', '/login', '/register', '/verify', '/reset-password', '/home', '/news'];

/**
 * Middleware for Next.js App Router
 * Handles basic route protection and public routes
 * Authentication is primarily handled client-side
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow all public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Allow API routes
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Allow static assets and Next.js internal files
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico' ||
    pathname === '/sw.js' ||
    pathname === '/manifest.json' ||
    pathname === '/robots.txt'
  ) {
    return NextResponse.next();
  }

  // For all other routes, let Next.js handle them
  // Client-side will handle authentication redirects
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Simple matcher: match all paths
     * The middleware function itself filters out static files and API routes
     */
    '/(.*)',
  ],
};
