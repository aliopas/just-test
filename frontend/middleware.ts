import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public routes that don't require authentication
const publicRoutes = ['/', '/login', '/register', '/verify', '/reset-password'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.includes(pathname) || pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Redirect root to appropriate page based on auth (handled client-side)
  if (pathname === '/') {
    return NextResponse.next();
  }

  // Check authentication via cookie or header
  // This is a basic check - client-side will handle actual auth state
  const authCookie = request.cookies.get('auth_token');
  const sessionCookie = request.cookies.get('session');

  // For routes that require auth, let client-side handle redirects
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
