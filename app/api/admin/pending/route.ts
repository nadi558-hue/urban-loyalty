import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createServiceClient } from '@/lib/supabase'
import { isAdminPhone } from '@/lib/admin'

export const dynamic = 'force-dynamic'

/**
 * What is waiting for the desk right now.
 *
 * The kiosk polls this so a redemption reaches reception without anyone
 * remembering to open the admin screen. There is no push infrastructure —
 * no OneSignal app id, no VAPID keys, no push handler in the service worker —
 * so "notification" here means a screen that is already open noticing sooner.
 *
 * The proxy's matcher does not cover /api, so this route does its own auth.
 * It returns member names, which is exactly what must not leak.
 */
export async function GET(req: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return req.cookies.getAll() },
        setAll() {},
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.phone || !isAdminPhone(user.phone)) {
    return NextResponse.json({ error: 'אין הרשאה' }, { status: 403 })
  }

  const db = createServiceClient()

  const [redRes, shareRes] = await Promise.all([
    db.from('redemptions')
      .select('id, code, coins_spent, created_at, members(name), rewards(name)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(20),
    db.from('social_shares').select('id').eq('status', 'pending').limit(50),
  ])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = (redRes.data ?? []) as any[]

  return NextResponse.json({
    redemptions: rows.map(r => ({
      id: r.id,
      code: r.code,
      coins: r.coins_spent,
      member: r.members?.name ?? '—',
      reward: r.rewards?.name ?? '—',
      at: r.created_at,
    })),
    shares: (shareRes.data ?? []).length,
  }, { headers: { 'Cache-Control': 'no-store' } })
}
