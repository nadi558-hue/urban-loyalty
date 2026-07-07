import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

export const SUPABASE_CONFIGURED =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your_supabase_url'

// Client-side (public) Supabase client — use in 'use client' components.
// createBrowserClient stores the session in cookies so the server (proxy,
// server components) can read it — createClient would use localStorage,
// which the server never sees.
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

// Service role client — bypasses RLS, only use in API routes and sync
export function createServiceClient() {
  return createClient(
    supabaseUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? supabaseAnonKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
