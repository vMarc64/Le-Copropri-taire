import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const protectedRoutes = ['/app', '/portal', '/platform'];

// Public routes (no auth required)
const publicRoutes = ['/owner', '/manager', '/forgot-password', '/product'];

// Pending pages (accessible even without tenant)
const pendingPages = ['/app/pending', '/portal/pending'];

// Manager-only routes (role = manager, syndic_admin)
const managerOnlyRoutes = ['/app'];

// Owner-only routes (role = owner)
const ownerOnlyRoutes = ['/portal'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get the access token from cookies
  const accessToken = request.cookies.get('accessToken')?.value;
  
  // Check route types
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  const isPendingPage = pendingPages.some(route => pathname === route);
  const isHomePage = pathname === '/';
  const isManagerRoute = managerOnlyRoutes.some(route => pathname.startsWith(route));
  const isOwnerRoute = ownerOnlyRoutes.some(route => pathname.startsWith(route));
  
  // If accessing a protected route without auth, redirect to home
  if (isProtectedRoute && !accessToken) {
    const homeUrl = new URL('/', request.url);
    return NextResponse.redirect(homeUrl);
  }
  
  // If authenticated, check tenant and role
  if (accessToken) {
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const role = payload.role;
      const tenantId = payload.tenantId;
      
      // Platform admin always has access
      if (role === 'platform_admin') {
        if (isPublicRoute) {
          return NextResponse.redirect(new URL('/platform', request.url));
        }
        return NextResponse.next();
      }
      
      // Role-based route restrictions
      const isManager = role === 'manager' || role === 'syndic_admin';
      const isOwner = role === 'owner' || role === 'tenant';
      
      // Owners cannot access /app routes (except pending)
      if (isOwner && isManagerRoute && !isPendingPage) {
        return NextResponse.redirect(new URL('/portal', request.url));
      }
      
      // Managers cannot access /portal routes (redirect to /app)
      if (isManager && isOwnerRoute && !isPendingPage) {
        return NextResponse.redirect(new URL('/app', request.url));
      }
      
      // Check if user has no tenant (pending state)
      const hasTenant = tenantId && tenantId !== null;
      
      if (!hasTenant) {
        // User without tenant can only access pending pages
        if (!isPendingPage && isProtectedRoute) {
          if (isManager) {
            return NextResponse.redirect(new URL('/app/pending', request.url));
          } else {
            return NextResponse.redirect(new URL('/portal/pending', request.url));
          }
        }
      } else {
        // User with tenant should not access pending pages
        if (isPendingPage) {
          if (isManager) {
            return NextResponse.redirect(new URL('/app', request.url));
          } else {
            return NextResponse.redirect(new URL('/portal', request.url));
          }
        }
      }
      
      // Redirect from login/register/home if authenticated
      if (isPublicRoute || isHomePage) {
        if (isManager) {
          return NextResponse.redirect(new URL(hasTenant ? '/app' : '/app/pending', request.url));
        } else {
          return NextResponse.redirect(new URL(hasTenant ? '/portal' : '/portal/pending', request.url));
        }
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
