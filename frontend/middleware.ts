import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public routes that don't require authentication
const publicRoutes = ['/', '/login', '/register', '/verify', '/reset-password'];

// Admin routes
const adminRoutes = ['/admin'];

// Investor routes
const investorRoutes = ['/home', '/requests', '/profile', '/dashboard', '/internal-news', '/news'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))) {
    return NextResponse.next();
  }

  // Check authentication via cookie or header
  // This is a basic check - you may want to validate JWT token properly
  const authCookie = request.cookies.get('auth_token');
  const sessionCookie = request.cookies.get('session');

  // For now, we'll let the client-side handle auth checks
  // In production, you might want to validate JWT here
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|sw.js|manifest.json).*)',
  ],
};
