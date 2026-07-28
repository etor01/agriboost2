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
        response = NextResponse.next({ request: { headers: request.headers }})
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

  const protectedRoutes = ['/dashboard', '/profile', '/farm', '/finances', '/ai-center', '/marketplace']
  const adminRoutes = ['/admin']
  const authRoutes = ['/login', '/signup', '/forgot-password']

  // Rule 1: If user is not signed in, redirect protected/admin routes to /login
  if (!user && (protectedRoutes.some(path => pathname.startsWith(path)) || adminRoutes.some(path => pathname.startsWith(path)))) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Rule 2: If user is signed in, prevent access to auth routes
  if (user && authRoutes.some(path => pathname.startsWith(path))) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Rule 3: If user is trying to access an admin route, verify their role from the profiles table
  if (user && adminRoutes.some(path => pathname.startsWith(path))) {
    // The role is stored in the `profiles` table.
    // app_metadata.role is only set via service-role operations (not our app's auth flow).
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
        // If the role is not 'admin', redirect them away.
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

  // If none of the rules match, allow the request to proceed
  return response
}
