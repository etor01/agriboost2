// lib/supabase/middleware.ts

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export type AdminLevel = 'super_admin' | 'moderator' | 'support';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // It's important to define cookie handlers once
  const cookieHandlers = {
    getAll() {
      return request.cookies.getAll()
    },
    setAll(cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) {
      cookiesToSet.forEach(({ name, value, options }) => {
        request.cookies.set({ name, value, ...options })
        response = NextResponse.next({ request: { headers: request.headers } })
        response.cookies.set({ name, value, ...options })
      })
    },
  };

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: cookieHandlers }
  )

  // This will refresh the session and its token
  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  // Routes that require authentication
  const farmerProtectedRoutes = ['/dashboard', '/profile', '/farm', '/finances', '/ai-center']
  const buyerProtectedRoutes = ['/buyer']
  const internalMarketplaceRoutes = ['/marketplace'] // farmer-only internal marketplace
  const adminRoutes = ['/admin']
  // const metricsRoutes = ['/metrics'] // investor/sponsor metrics — admin only
  const authRoutes = ['/login', '/signup', '/forgot-password']

  // /market is a PUBLIC route — no auth needed, skip all checks for it.
  if (pathname.startsWith('/market')) {
    return response;
  }

  // Rule 1: If user is not signed in, redirect protected routes to /login
  const isProtected =
    farmerProtectedRoutes.some(path => pathname.startsWith(path)) ||
    buyerProtectedRoutes.some(path => pathname.startsWith(path)) ||
    internalMarketplaceRoutes.some(path => pathname.startsWith(path)) ||
    adminRoutes.some(path => pathname.startsWith(path));
  // metricsRoutes.some(path => pathname.startsWith(path))

  if (!user && isProtected) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Rule 2: If user is signed in, prevent access to auth routes — redirect to role-appropriate home
  if (user && authRoutes.some(path => pathname.startsWith(path))) {
    // Fetch role to determine which home page to send them to
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role === 'buyer') {
      return NextResponse.redirect(new URL('/buyer/shop', request.url))
    }
    // default: farmers and unrecognised roles go to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Rule 3: Role-based cross-route guard for authenticated users
  if (user && isProtected) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const role = profile?.role;

    // Buyers should not access farmer routes
    if (
      role === 'buyer' &&
      (farmerProtectedRoutes.some(path => pathname.startsWith(path)) ||
        internalMarketplaceRoutes.some(path => pathname.startsWith(path)))
    ) {
      return NextResponse.redirect(new URL('/buyer/shop', request.url));
    }

    // Farmers should not access buyer routes
    if (role === 'farmer' && buyerProtectedRoutes.some(path => pathname.startsWith(path))) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Rule 4: Admin route verification
    if (adminRoutes.some(path => pathname.startsWith(path))) {
      if (role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }

      // Fetch the admin_level from the admins sub-table
      const { data: adminRow } = await supabase
        .from('admins')
        .select('admin_level')
        .eq('profile_id', user.id)
        .single();

      const adminLevel: AdminLevel = (adminRow?.admin_level as AdminLevel) ?? 'moderator';

      // Gate super_admin-only routes — redirect lower-level admins to dashboard
      const superAdminOnlyRoutes = ['/admin/settings', '/admin/team', '/admin/transactions', '/admin/subscriptions'];
      if (superAdminOnlyRoutes.some(path => pathname.startsWith(path)) && adminLevel !== 'super_admin') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }

      // Store admin_level in a cookie so server components / layouts can read it without
      // making an extra DB query. Value is safe to expose — it's informational, not a secret.
      response.cookies.set('x-admin-level', adminLevel, {
        httpOnly: false,   // needs to be readable by both server and client components
        sameSite: 'lax',
        path: '/admin',
        maxAge: 60 * 60,   // 1 hour — refreshed on each admin page load
      });
    }

    // Rule 5: /metrics is restricted to admin users only (investor/sponsor data)
    // if (metricsRoutes.some(path => pathname.startsWith(path)) && role !== 'admin') {
    //   return NextResponse.redirect(new URL('/dashboard', request.url));
    // }
  }

  // If none of the rules match, allow the request to proceed
  return response
}
