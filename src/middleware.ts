import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// List of paths that don't require authentication
const publicPaths = [
  '/',
  '/sign-in',
  '/register',
  '/auth/google',
  '/auth/facebook',
  '/auth/twitter',
  '/auth/callback',
  '/auth/verify-email',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/complete-profile',
  '/auth/verify',
  '/auth/refresh-token',
  '/admin/login',
  // '/auth/signout',
];

// Role-based dashboard paths
const roleBasedPaths = {
  admin: '/admin',
  vendor: '/vendor/dashboard',
  event_planner: '/planner/dashboard',
  user: '/user/dashboard',
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to all dashboard routes without verification
  if (pathname.includes('/dashboard')) {
    return NextResponse.next();
  }

  // Check if the path is public
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

  // If it's a public path, allow access
  if (isPublicPath) {
    return NextResponse.next();
  }

  // For all other routes, redirect to sign-in
  const signInUrl = new URL('/sign-in', request.url);
  signInUrl.searchParams.set('callbackUrl', pathname);
  return NextResponse.redirect(signInUrl);
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
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 