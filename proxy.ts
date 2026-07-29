import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isAdminPhone } from '@/lib/admin'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SUPABASE_CONFIGURED = !!SUPABASE_URL && !SUPABASE_URL.includes('placeholder')

export async function proxy(request: NextRequest) {
  // Demo mode — no real Supabase configured, allow all access
  if (!SUPABASE_CONFIGURED) return NextResponse.next({ request })

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() { return request.cookies.getAll() },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Admin routes require an allow-listed phone number
  if (request.nextUrl.pathname.startsWith('/admin') && !isAdminPhone(user.phone)) {
    const url = request.nextUrl.clone()
    url.pathname = '/home'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/home/:path*',
    '/rewards/:path*',
    '/history/:path*',
    '/referrals/:path*',
    '/share/:path*',
    '/qr/:path*',
    '/coach/:path*',
    '/help/:path*',
    '/profile/:path*',
    '/admin/:path*',
  ],
}
