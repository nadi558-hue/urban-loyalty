/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import {
  getAttendedCheckIns,
  getLateCancellations,
  reportWindow,
  arboxConfigured,
} from '@/lib/arbox'
import { awardPoints, getRules } from '@/lib/points'
import { grantDateBonuses } from '@/lib/bonuses'
import { payReferral } from '@/lib/referrals'
import { registerAttendance, breakStreak, runStreakRollover, type RolloverResult, type StreakMember } from '@/lib/streak'

// Allow up to 60s (Vercel Hobby max) — the sync fetches Arbox + reconciles.
export const maxDuration = 60

// A QR scan may land from 15 min before class start through ~30 min after a
// ~60 min class ends. An Arbox 'attended' check-in must match a scan inside
// this window for coins to be awarded.
const SCAN_MATCH_BEFORE_MS = 15 * 60 * 1000
const SCAN_MATCH_AFTER_MS = 90 * 60 * 1000
const PENDING_LOOKBACK_MS = 2 * 86_400_000

// Accept both Vercel Cron's `Authorization: Bearer <CRON_SECRET>` and a manual
// `x-cron-secret` header.
function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  if (req.headers.get('authorization') === `Bearer ${secret}`) return true
  return req.headers.get('x-cron-secret') === secret
}

export async function GET(req: NextRequest) { return handleSync(req) }
export async function POST(req: NextRequest) { return handleSync(req) }

type PendingScan = { id: string; created_at: string }

async function handleSync(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!arboxConfigured()) {
    return NextResponse.json({ ok: false, error: 'Arbox API key not configured' }, { status: 503 })
  }

  const db = createServiceClient() as any
  const rules = await getRules()

  const { data: lastSync } = await db
    .from('sync_log').select('synced_at')
    .order('synced_at', { ascending: false }).limit(1).single()

  // Default lookback kept short — the cron runs frequently and Arbox reports
  // are date-granular, so today's check-ins stay in-window all day.
  const since = lastSync?.synced_at ?? new Date(Date.now() - 2 * 86_400_000).toISOString()
  const { fromDate, toDate } = reportWindow(since)

  let checkInsFound = 0, coinsAwarded = 0, verified = 0, unmatched = 0, lateCancels = 0, referralsPaid = 0
  let errors: string | null = null

  try {
    const [attended, cancellations] = await Promise.all([
      getAttendedCheckIns(fromDate, toDate),
      getLateCancellations(fromDate, toDate),
    ])
    checkInsFound = attended.length

    // ── Bulk pre-fetch (avoids per-row round-trips → fast enough for serverless).
    // Fetch members + processed fully rather than huge .in() lists, which can
    // exceed PostgREST's URL length limit and fail silently. Both tables are
    // small: members are bounded (~hundreds), processed holds only awards.
    const [membersRes, processedRes, pendingRes, promosRes] = await Promise.all([
      db.from('members')
        .select('id, arbox_id, current_streak, longest_streak, last_active_date, referred_by')
        .limit(5000),
      db.from('processed_checkins').select('arbox_checkin_id').limit(50000),
      db.from('checkins').select('id, member_id, created_at')
        .eq('status', 'pending').is('arbox_checkin_id', null)
        .gte('created_at', new Date(Date.now() - PENDING_LOOKBACK_MS).toISOString()),
      db.from('promoted_classes').select('title, branch, bonus_coins').eq('active', true),
    ])

    type SyncMember = StreakMember & { arbox_id: string; referred_by: string | null }
    const memberByArbox = new Map<string, SyncMember>(
      (membersRes.data ?? []).map((m: any) => [m.arbox_id, m]),
    )
    const processed = new Set<string>((processedRes.data ?? []).map((r: any) => r.arbox_checkin_id))
    const promos = (promosRes.data ?? []) as { title: string; branch: string | null; bonus_coins: number }[]

    const scansByMember = new Map<string, PendingScan[]>()
    for (const s of (pendingRes.data ?? []) as any[]) {
      const list = scansByMember.get(s.member_id) ?? []
      list.push({ id: s.id, created_at: s.created_at })
      scansByMember.set(s.member_id, list)
    }

    // ── Attended check-ins: award only when a matching QR scan confirms presence ──
    for (const ev of attended) {
      if (processed.has(ev.arbox_checkin_id)) continue
      const member = memberByArbox.get(ev.arbox_user_id)
      if (!member) continue

      const list = scansByMember.get(member.id) ?? []
      const start = new Date(ev.start).getTime()
      const idx = list.findIndex((s) => {
        const t = new Date(s.created_at).getTime()
        return t >= start - SCAN_MATCH_BEFORE_MS && t <= start + SCAN_MATCH_AFTER_MS
      })

      if (idx < 0) {
        // Attended in Arbox but no QR scan yet → no coins (blocks buddy check-in).
        // Not marked processed → a later scan today can still match on a next run.
        unmatched++
        continue
      }

      const scan = list.splice(idx, 1)[0] // consume so it can't match twice
      const bonus = happyHourBonus(ev, promos)
      const pts = (rules['class_attended'] ?? 1) + bonus

      await awardPoints(member.id, pts, 'class_attended', {
        class_name: ev.class_name, branch: ev.branch,
        arbox_checkin_id: ev.arbox_checkin_id, verified: true,
        ...(bonus > 0 ? { happy_hour_bonus: bonus } : {}),
      })
      coinsAwarded += pts
      verified++

      await db.from('checkins').update({
        status: 'verified', arbox_checkin_id: ev.arbox_checkin_id,
        coins_awarded: pts, verified_at: new Date().toISOString(),
      }).eq('id', scan.id)

      await db.from('processed_checkins').insert({
        arbox_checkin_id: ev.arbox_checkin_id, member_id: member.id, is_happy_hour: bonus > 0,
      })
      processed.add(ev.arbox_checkin_id)

      // Streaks count active DAYS — a second class today doesn't advance it,
      // and doesn't pay the milestone a second time.
      const { streak: newStreak, milestone } = await registerAttendance(db, member)
      if (milestone) {
        const streakPts = rules['streak_10'] ?? 10
        await awardPoints(member.id, streakPts, 'streak_10', { streak: newStreak })
        coinsAwarded += streakPts
      }
      await checkMonthBonus(member.id, rules, db)

      // First verified class by someone who arrived through a referral link
      // pays both sides. payReferral is a no-op on later classes.
      if (member.referred_by && await payReferral(member, 'referral_trial')) {
        coinsAwarded += (rules['referral_trial'] ?? 50) * 2
        referralsPaid++
      }
    }

    // ── Late cancellations: break streak, no coins, recorded for the member ──
    for (const ev of cancellations) {
      if (processed.has(ev.arbox_checkin_id)) continue
      const member = memberByArbox.get(ev.arbox_user_id)
      if (!member) continue

      await breakStreak(db, member)
      await db.from('point_ledger').insert({
        member_id: member.id, points: 0, reason: 'late_cancel',
        metadata: { class_name: ev.class_name, branch: ev.branch, note: 'ביטול מאוחר — רצף האימונים אופס, ללא נקודות' },
      })
      await db.from('processed_checkins').insert({
        arbox_checkin_id: ev.arbox_checkin_id, member_id: member.id, is_happy_hour: false,
      })
      processed.add(ev.arbox_checkin_id)
      lateCancels++
    }
  } catch (e) {
    errors = e instanceof Error ? e.message : String(e)
  }

  // Once-a-year date bonuses. Kept outside the try above so a failure in the
  // Arbox reconciliation doesn't skip them, and vice versa.
  let dateBonuses = { birthday: 0, anniversary: 0 }
  try {
    dateBonuses = await grantDateBonuses()
  } catch (e) {
    errors = [errors, e instanceof Error ? e.message : String(e)].filter(Boolean).join(' | ')
  }

  // Daily decay. Must run last: it expires anyone who didn't train yesterday,
  // and the loop above has already credited today's classes, so a member who
  // came in this run is safe. Kept outside the try for the same reason as the
  // date bonuses — a lapsed streak has to expire even if Arbox was down.
  let streaks: RolloverResult = { broken: 0, frozen: 0 }
  try {
    streaks = await runStreakRollover(db)
  } catch (e) {
    errors = [errors, e instanceof Error ? e.message : String(e)].filter(Boolean).join(' | ')
  }

  await db.from('sync_log').insert({ check_ins_found: checkInsFound, coins_awarded: coinsAwarded, errors })

  return NextResponse.json({ ok: true, checkInsFound, verified, unmatched, lateCancels, coinsAwarded, referralsPaid, dateBonuses, streaks, errors })
}

// Bonus coins if the attended class matches an active promoted ("Happy Hour") class
function happyHourBonus(
  ev: { class_name: string | null; branch: string | null },
  promos: { title: string; branch: string | null; bonus_coins: number }[],
): number {
  if (!promos.length) return 0
  const name = (ev.class_name ?? '').toLowerCase()
  const branch = (ev.branch ?? '').toLowerCase()
  for (const p of promos) {
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
    .from('point_ledger').select('*', { count: 'exact', head: true })
    .eq('member_id', memberId).eq('reason', 'class_attended')
    .gte('created_at', monthStart).lte('created_at', monthEnd)

  const { count: alreadyAwarded } = await db
    .from('point_ledger').select('*', { count: 'exact', head: true })
    .eq('member_id', memberId).eq('reason', 'full_month').gte('created_at', monthStart)

  if ((classCount ?? 0) >= 12 && (alreadyAwarded ?? 0) === 0) {
    await awardPoints(memberId, rules['full_month'] ?? 30, 'full_month', {
      month: `${now.getFullYear()}-${now.getMonth() + 1}`,
    })
  }
}
