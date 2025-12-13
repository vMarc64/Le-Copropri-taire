import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const protectedRoutes = ['/app', '/portal', '/platform'];

// Public routes (no auth required)
const publicRoutes = ['/login', '/register', '/forgot-password'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get the access token from cookies
  const accessToken = request.cookies.get('accessToken')?.value;
  
  // Check if trying to access a protected route
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  
  // If accessing a protected route without auth, redirect to login
  if (isProtectedRoute && !accessToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // If authenticated and trying to access login/register, redirect to app
  if (isPublicRoute && accessToken) {
    // Decode token to check role (basic decode, not verification)
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const role = payload.role;
      
      if (role === 'platform_admin') {
        return NextResponse.redirect(new URL('/platform', request.url));
      } else if (role === 'manager' || role === 'syndic_admin') {
        return NextResponse.redirect(new URL('/app', request.url));
      } else {
        return NextResponse.redirect(new URL('/portal', request.url));
      }
    } catch {
      // If token is invalid, let them access login
      return NextResponse.next();
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico
     * - public files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
