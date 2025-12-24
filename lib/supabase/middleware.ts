// lib/supabase/middleware.ts

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

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

  const protectedRoutes = ['/dashboard', '/profile', '/farm', '/finances', '/ai-center', '/marketplace/new']
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

  // Rule 3: If user is trying to access an admin route, verify their role from the session token
  if (user && adminRoutes.some(path => pathname.startsWith(path))) {
    // Read the role directly from the user's session token (app_metadata).
    // This is instant and requires no database call.
    const userRole = user.app_metadata?.role;

    if (userRole !== 'admin') {
        // If the role is not 'admin', redirect them away.
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // If none of the rules match, allow the request to proceed
  return response
}
