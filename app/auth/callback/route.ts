// app/auth/callback/route.ts

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Validates that a redirect target is a safe relative path.
 * Prevents open-redirect attacks by rejecting any absolute URLs.
 */
function isSafeRedirectPath(path: string | null | undefined): path is string {
  return typeof path === 'string' && path.startsWith('/') && !path.includes('://')
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next')

  // Validate the `next` param — fall back to /profile if absent or unsafe
  const redirectTo = isSafeRedirectPath(next) ? next : '/profile'

  // If no code is present there is nothing to exchange
  if (!code) {
    return NextResponse.redirect(new URL('/login', origin))
  }

  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch {
            // Ignored: set() called from a context where cookies are read-only.
            // The middleware session refresh handles persistence.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch {
            // Ignored: same as above.
          }
        },
      },
    }
  )

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(new URL('/login?error=invalid_link', origin))
  }

  return NextResponse.redirect(new URL(redirectTo, origin))
}
