/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { getCheckInsSince, arboxConfigured, type ArboxCheckIn } from '@/lib/arbox'
import { awardPoints, getRules } from '@/lib/points'

// A QR scan may land from 15 min before class start through ~30 min after a
// ~60 min class ends. An Arbox 'attended' check-in must match a scan inside
// this window for coins to be awarded.
const SCAN_MATCH_BEFORE_MS = 15 * 60 * 1000
const SCAN_MATCH_AFTER_MS = 90 * 60 * 1000

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!arboxConfigured()) {
    return NextResponse.json({ ok: false, error: 'Arbox API key not configured' }, { status: 503 })
  }

  const db = createServiceClient() as any
  const rules = await getRules()

  const { data: lastSync } = await db
    .from('sync_log')
    .select('synced_at')
    .order('synced_at', { ascending: false })
    .limit(1)
    .single()

  const since = lastSync?.synced_at ?? new Date(Date.now() - 7 * 86_400_000).toISOString()

  let checkInsFound = 0
  let coinsAwarded = 0
  let verified = 0
  let unmatched = 0
  let lateCancels = 0
  let errors: string | null = null

  try {
    const checkIns = await getCheckInsSince(since)
    checkInsFound = checkIns.length

    for (const ci of checkIns) {
      // Idempotency — never process the same Arbox check-in twice
      const { data: done } = await db
        .from('processed_checkins')
        .select('arbox_checkin_id')
        .eq('arbox_checkin_id', ci.id)
        .single()
      if (done) continue

      const { data: member } = await db
        .from('members')
        .select('id, current_streak')
        .eq('arbox_id', ci.customer_id)
        .single()
      if (!member) continue

      // Late cancel → break streak, no coins, recorded for the member
      if (ci.status === 'late_cancel') {
        await handleLateCancel(member.id, ci, db)
        lateCancels++
        await markProcessed(db, ci, member.id, false)
        continue
      }

      if (ci.status !== 'attended') continue

      // ── CROSS-CHECK: require a matching QR scan (proof of presence) ──
      const start = new Date(ci.start_time).getTime()
      const from = new Date(start - SCAN_MATCH_BEFORE_MS).toISOString()
      const to = new Date(start + SCAN_MATCH_AFTER_MS).toISOString()

      const { data: scans } = await db
        .from('checkins')
        .select('id')
        .eq('member_id', member.id)
        .eq('status', 'pending')
        .is('arbox_checkin_id', null)
        .gte('created_at', from)
        .lte('created_at', to)
        .order('created_at', { ascending: true })
        .limit(1)

      const scan = scans?.[0]
      if (!scan) {
        // Attendance marked in Arbox but the member never scanned →
        // possible buddy check-in → NO coins.
        unmatched++
        await markProcessed(db, ci, member.id, false)
        continue
      }

      // Both sides confirmed → award once
      const base = rules['class_attended'] ?? 1
      const bonus = await happyHourBonus(ci, db)
      const pts = base + bonus

      await awardPoints(member.id, pts, 'class_attended', {
        class_name: ci.class_name,
        branch: ci.branch_name,
        arbox_checkin_id: ci.id,
        verified: true,
        ...(bonus > 0 ? { happy_hour_bonus: bonus } : {}),
      })
      coinsAwarded += pts
      verified++

      await db
        .from('checkins')
        .update({
          status: 'verified',
          arbox_checkin_id: ci.id,
          coins_awarded: pts,
          verified_at: new Date().toISOString(),
        })
        .eq('id', scan.id)

      await markProcessed(db, ci, member.id, bonus > 0)

      // Advance streak, award the 10-in-a-row bonus on multiples of 10
      const newStreak = (member.current_streak ?? 0) + 1
      await db.from('members').update({ current_streak: newStreak }).eq('id', member.id)
      if (newStreak % 10 === 0) {
        const streakPts = rules['streak_10'] ?? 10
        await awardPoints(member.id, streakPts, 'streak_10', { streak: newStreak })
        coinsAwarded += streakPts
      }

      await checkMonthBonus(member.id, rules, db)
    }
  } catch (e) {
    errors = e instanceof Error ? e.message : String(e)
  }

  await db.from('sync_log').insert({ check_ins_found: checkInsFound, coins_awarded: coinsAwarded, errors })

  return NextResponse.json({ ok: true, checkInsFound, verified, unmatched, lateCancels, coinsAwarded, errors })
}

async function markProcessed(db: any, ci: ArboxCheckIn, memberId: string, isHappyHour: boolean) {
  await db.from('processed_checkins').insert({
    arbox_checkin_id: ci.id,
    member_id: memberId,
    is_happy_hour: isHappyHour,
  })
}

async function handleLateCancel(memberId: string, ci: ArboxCheckIn, db: any) {
  await db.from('members').update({ current_streak: 0 }).eq('id', memberId)
  await db.from('point_ledger').insert({
    member_id: memberId,
    points: 0,
    reason: 'late_cancel',
    metadata: {
      class_name: ci.class_name,
      branch: ci.branch_name,
      note: 'ביטול מאוחר — רצף האימונים אופס, ללא נקודות',
    },
  })
}

// Bonus coins if the attended class matches an active promoted ("Happy Hour") class
async function happyHourBonus(ci: ArboxCheckIn, db: any): Promise<number> {
  const { data: promos } = await db
    .from('promoted_classes')
    .select('title, branch, bonus_coins')
    .eq('active', true)
  if (!promos?.length) return 0

  const name = (ci.class_name ?? '').toLowerCase()
  const branch = (ci.branch_name ?? '').toLowerCase()
  for (const p of promos as { title: string; branch: string | null; bonus_coins: number }[]) {
    const titleMatch = p.title && name.includes(p.title.toLowerCase())
    const branchMatch = !p.branch || branch.includes(p.branch.toLowerCase())
    if (titleMatch && branchMatch) return p.bonus_coins ?? 0
  }
  return 0
}

async function checkMonthBonus(memberId: string, rules: Record<string, number>, db: any) {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()

  const { count: classCount } = await db
    .from('point_ledger')
    .select('*', { count: 'exact', head: true })
    .eq('member_id', memberId)
    .eq('reason', 'class_attended')
    .gte('created_at', monthStart)
    .lte('created_at', monthEnd)

  const { count: alreadyAwarded } = await db
    .from('point_ledger')
    .select('*', { count: 'exact', head: true })
    .eq('member_id', memberId)
    .eq('reason', 'full_month')
    .gte('created_at', monthStart)

  if ((classCount ?? 0) >= 12 && (alreadyAwarded ?? 0) === 0) {
    await awardPoints(memberId, rules['full_month'] ?? 30, 'full_month', {
      month: `${now.getFullYear()}-${now.getMonth() + 1}`,
    })
  }
}
