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
import {
  awardAttendance, matchingScanIndex, type Promo,
} from '@/lib/attendance'
import { grantDateBonuses } from '@/lib/bonuses'
import { syncPlanMembers, type MemberSyncResult } from '@/lib/member-sync'
import { payReferral } from '@/lib/referrals'
import { registerAttendance, breakStreak, runStreakRollover, type RolloverResult, type StreakMember } from '@/lib/streak'

// Allow up to 60s (Vercel Hobby max) — the sync fetches Arbox + reconciles.
export const maxDuration = 60

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

  // Import active plan holders first, so someone who joined the studio today
  // has a member row before their check-ins are reconciled below. This used to
  // run only when an admin clicked the button in /admin/members, which meant a
  // new member simply couldn't use the app until someone remembered.
  let members: MemberSyncResult | null = null
  try {
    members = await syncPlanMembers()
  } catch (e) {
    errors = e instanceof Error ? e.message : String(e)
  }

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
    const promos = (promosRes.data ?? []) as Promo[]

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
      const idx = matchingScanIndex(list, ev)

      if (idx < 0) {
        // Attended in Arbox but no QR scan yet → no coins (blocks buddy check-in).
        // Not marked processed → a later scan today can still match on a next run.
        unmatched++
        continue
      }

      const scan = list.splice(idx, 1)[0] // consume so it can't match twice
      const { coins, referralPaid } = await awardAttendance(db, member, ev, scan.id, rules, promos)
      coinsAwarded += coins
      verified++
      processed.add(ev.arbox_checkin_id)
      if (referralPaid) referralsPaid++
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
    errors = [errors, e instanceof Error ? e.message : String(e)].filter(Boolean).join(' | ')
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

  return NextResponse.json({ ok: true, members, checkInsFound, verified, unmatched, lateCancels, coinsAwarded, referralsPaid, dateBonuses, streaks, errors })
}

