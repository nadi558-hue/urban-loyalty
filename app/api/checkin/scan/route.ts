import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase'
import { verifyToken } from '@/lib/checkin'
import { arboxConfigured } from '@/lib/arbox'

export const dynamic = 'force-dynamic'

// Minimum gap between two scans for the same member (one class ≈ 50-60 min).
const DEDUPE_MINUTES = 90

// Member scans the kiosk QR → verify freshness → record presence.
//
// Two modes:
//  • Arbox connected  → record a PENDING scan (proof of physical presence);
//    coins are awarded later by /api/sync only if a matching Arbox 'attended'
//    check-in confirms it (cross-verification, blocks buddy check-ins).
//  • Arbox NOT connected → award class coins immediately (keeps the live
//    feature working until Arbox is wired).
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

  // Dedupe: one scan per class window
  const since = new Date(Date.now() - DEDUPE_MINUTES * 60_000).toISOString()
  const { data: recent } = await db
    .from('checkins')
    .select('id, status')
    .eq('member_id', member.id)
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(1) as { data: { id: string; status: string }[] | null }

  if (recent && recent.length > 0) {
    const pending = recent[0].status === 'pending'
    return NextResponse.json({
      ok: true,
      alreadyCheckedIn: true,
      pending,
      // Say plainly that this scan was NOT recorded. The old wording read as a
      // fresh success, so a member scanning five times believed five scans had
      // registered — and so did we, until the table showed one.
      message: pending
        ? 'הסריקה הזו לא נרשמה — כבר סרקת לשיעור הזה. המטבע ייכנס כשהנוכחות תסומן במערכת ⏳'
        : 'הסריקה הזו לא נרשמה — כבר סרקת לשיעור הזה והמטבע כבר אצלך 💪',
    })
  }

  // ── Cross-verification mode: record pending, award later via /api/sync ──
  if (arboxConfigured()) {
    const { error } = await db
      .from('checkins')
      .insert({ member_id: member.id, source: 'qr', status: 'pending', coins_awarded: 0 })
    if (error) {
      return NextResponse.json({ ok: false, error: 'שגיאה בשמירת הצ׳ק-אין' }, { status: 500 })
    }
    return NextResponse.json({
      ok: true,
      pending: true,
      name: member.name,
      // Says what actually has to happen next, not a vague "soon" — the
      // trigger is the studio marking attendance, which is usually within
      // minutes of the door check-in but occasionally never.
      message: 'נקלט! המטבעות ייכנסו ברגע שהנוכחות תסומן במערכת השיעורים ⏳',
    })
  }

  // ── Immediate-award mode (Arbox not wired yet) ──
  const { data: rule } = await db
    .from('point_rules')
    .select('points')
    .eq('key', 'class_attended')
    .single() as { data: { points: number } | null }
  const coins = rule?.points ?? 1

  const { error: insertErr } = await db
    .from('checkins')
    .insert({ member_id: member.id, source: 'qr', status: 'verified', coins_awarded: coins })
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
