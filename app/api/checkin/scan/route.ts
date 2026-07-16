import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase'
import { verifyToken } from '@/lib/checkin'

export const dynamic = 'force-dynamic'

// Minimum gap between two awarded check-ins for the same member.
// One class ≈ 50-60 min, so 90 min blocks double-scans / replay within a class.
const DEDUPE_MINUTES = 90

// Member scans the kiosk QR → verify freshness → award class coins once.
export async function POST(req: Request) {
  let token = ''
  try {
    const body = await req.json()
    token = String(body?.token ?? '')
  } catch { /* fall through to invalid */ }

  if (!token || !verifyToken(token)) {
    return NextResponse.json(
      { ok: false, error: 'קוד לא תקף או שפג תוקפו — סרקו שוב את המסך בסטודיו' },
      { status: 400 },
    )
  }

  // Identify the signed-in member
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.phone) {
    return NextResponse.json({ ok: false, error: 'נדרשת התחברות' }, { status: 401 })
  }

  const db = createServiceClient()
  const { data: member } = await db
    .from('members')
    .select('id, name, total_coins, lifetime_coins')
    .eq('phone', user.phone)
    .single() as { data: { id: string; name: string; total_coins: number; lifetime_coins: number } | null }

  if (!member) {
    return NextResponse.json({ ok: false, error: 'לא נמצאה רשומת חבר' }, { status: 404 })
  }

  // Dedupe: one awarded scan per class window
  const since = new Date(Date.now() - DEDUPE_MINUTES * 60_000).toISOString()
  const { data: recent } = await db
    .from('checkins')
    .select('id, created_at')
    .eq('member_id', member.id)
    .gte('created_at', since)
    .limit(1) as { data: { id: string; created_at: string }[] | null }

  if (recent && recent.length > 0) {
    return NextResponse.json({
      ok: true,
      alreadyCheckedIn: true,
      message: 'כבר נרשם לך צ׳ק-אין לשיעור הזה 💪',
    })
  }

  // How many coins per attended class (admin-configurable rule)
  const { data: rule } = await db
    .from('point_rules')
    .select('points')
    .eq('key', 'class_attended')
    .single() as { data: { points: number } | null }
  const coins = rule?.points ?? 1

  const { error: insertErr } = await db
    .from('checkins')
    .insert({ member_id: member.id, source: 'qr', coins_awarded: coins })
  if (insertErr) {
    return NextResponse.json({ ok: false, error: 'שגיאה בשמירת הצ׳ק-אין' }, { status: 500 })
  }

  await db.from('members').update({
    total_coins: member.total_coins + coins,
    lifetime_coins: member.lifetime_coins + coins,
  }).eq('id', member.id)

  await db.from('point_ledger').insert({
    member_id: member.id,
    points: coins,
    reason: 'class_attended',
    metadata: { source: 'qr_checkin' },
  })

  return NextResponse.json({ ok: true, coins, name: member.name })
}
