// lib/supabase/middleware.ts

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // It's important to define cookie handlers once
  const cookieHandlers = {
    get(name: string) {
      return request.cookies.get(name)?.value
    },
    set(name: string, value: string, options: CookieOptions) {
      request.cookies.set({ name, value, ...options })
      response = NextResponse.next({ request: { headers: request.headers }})
      response.cookies.set({ name, value, ...options })
    },
    remove(name: string, options: CookieOptions) {
      request.cookies.set({ name, value: '', ...options })
      response = NextResponse.next({ request: { headers: request.headers }})
      response.cookies.set({ name, value, ...options })
    },
  };

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: cookieHandlers }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  const adminRoutes = ['/admin']

  // If a user is trying to access an admin route, we must perform a role check.
  if (user && adminRoutes.some(path => pathname.startsWith(path))) {
    console.log(`[Middleware] Attempting to access admin route: ${pathname}`);

    // Create a special client with the SERVICE_ROLE_KEY to bypass RLS
    const serviceClient = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { cookies: cookieHandlers }
    );

    // Fetch the user's profile from the database
    const { data: profile, error } = await serviceClient
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
    
    // --- THIS IS OUR DEBUGGING LINE ---
    // It will print the result of our database query to the terminal.
    console.log(`[Middleware] User: ${user.email}, Role found in DB: ${profile?.role}`);

    if (error) {
        console.error('[Middleware] Error fetching profile:', error.message);
    }
    
    // If the query fails or the role is not 'admin', redirect them.
    if (error || profile?.role !== 'admin') {
        console.log('[Middleware] Access DENIED. Redirecting to /dashboard.');
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    console.log('[Middleware] Access GRANTED to admin route.');
  }

  // Allow the request to proceed if no rules matched
  return response
}
