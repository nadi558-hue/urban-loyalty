/* eslint-disable @typescript-eslint/no-explicit-any */
import { awardPoints } from '@/lib/points'
import { payReferral } from '@/lib/referrals'
import { registerAttendance, type StreakMember } from '@/lib/streak'

/**
 * ─── Awarding a verified class ────────────────────────────────────────────
 *
 * Shared by the nightly /api/sync and the on-demand reconcile that runs when a
 * member opens the app with a scan still pending. Both must award identically:
 * if the two drifted, whether you got a streak day or a month bonus would
 * depend on which one happened to reach you first.
 */

export type AttendedEvent = {
  arbox_checkin_id: string
  arbox_user_id: string
  start: string
  class_name: string | null
  branch: string | null
}

export type Promo = { title: string; branch: string | null; bonus_coins: number }

export type AwardMember = StreakMember & { referred_by: string | null }

// A QR scan may land from 15 min before class start through ~30 min after a
// ~60 min class ends. An Arbox 'attended' check-in must match a scan inside
// this window for coins to be awarded.
export const SCAN_MATCH_BEFORE_MS = 15 * 60 * 1000
export const SCAN_MATCH_AFTER_MS = 90 * 60 * 1000

/** Bonus coins if the attended class matches an active promoted ("Happy Hour") class. */
export function happyHourBonus(
  ev: { class_name: string | null; branch: string | null },
  promos: Promo[],
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

/**
 * Two monthly thresholds rather than one. A single cliff at 12 classes paid a
 * 2x/week member (~9 classes) almost nothing next to a 3x/week member (~13) —
 * 44% more attendance for over 3x the coins. half_month at 8 classes ("מתמידה")
 * gives the twice-a-week member a bonus of their own instead of a rounding
 * error, ahead of full_month ("מתקדמת") at 12.
 */
export async function checkMonthBonus(memberId: string, rules: Record<string, number>, db: any): Promise<number> {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()
  const month = `${now.getFullYear()}-${now.getMonth() + 1}`

  const { count: classCount } = await db
    .from('point_ledger').select('*', { count: 'exact', head: true })
    .eq('member_id', memberId).eq('reason', 'class_attended')
    .gte('created_at', monthStart).lte('created_at', monthEnd)
  const n = classCount ?? 0

  const alreadyAwarded = async (reason: string, since: string) => {
    const { count } = await db
      .from('point_ledger').select('*', { count: 'exact', head: true })
      .eq('member_id', memberId).eq('reason', reason).gte('created_at', since)
    return (count ?? 0) > 0
  }

  let awarded = 0
  if (n >= 8 && !(await alreadyAwarded('half_month', monthStart))) {
    const pts = rules['half_month'] ?? 8
    await awardPoints(memberId, pts, 'half_month', { month })
    awarded += pts
  }
  if (n >= 12 && !(await alreadyAwarded('full_month', monthStart))) {
    const pts = rules['full_month'] ?? 10
    await awardPoints(memberId, pts, 'full_month', { month })
    awarded += pts
  }
  return awarded
}

/** Sunday-start week containing `d`, as an ISO string — the boundary used for
 *  both counting this week's classes and scoping "already awarded this week". */
function weekStart(d: Date): string {
  const start = new Date(d)
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - start.getDay())
  return start.toISOString()
}

/**
 * Two more thresholds, this time inside the week rather than the month — the
 * mechanism that actually rewards training 4 or 5 times a week instead of 3.
 * A flat per-class rate can't do that on its own: past the monthly cliffs,
 * every extra class was worth the same as every other one, so there was
 * nothing that specifically favoured the top end of frequency. Deliberately
 * NOT priced by "which numbered class this is" — that would depend on
 * processing order across a batch of same-day reconciliations, and a member
 * would see the same class pay differently depending on what else was in that
 * run. A weekly count is stable regardless of order.
 */
export async function checkWeekBonus(memberId: string, rules: Record<string, number>, db: any): Promise<number> {
  const since = weekStart(new Date())

  const { count: classCount } = await db
    .from('point_ledger').select('*', { count: 'exact', head: true })
    .eq('member_id', memberId).eq('reason', 'class_attended')
    .gte('created_at', since)
  const n = classCount ?? 0

  const alreadyAwarded = async (reason: string) => {
    const { count } = await db
      .from('point_ledger').select('*', { count: 'exact', head: true })
      .eq('member_id', memberId).eq('reason', reason).gte('created_at', since)
    return (count ?? 0) > 0
  }

  let awarded = 0
  if (n >= 4 && !(await alreadyAwarded('weekly_strong'))) {
    const pts = rules['weekly_strong'] ?? 2
    await awardPoints(memberId, pts, 'weekly_strong', { week: since })
    awarded += pts
  }
  if (n >= 5 && !(await alreadyAwarded('weekly_superstar'))) {
    const pts = rules['weekly_superstar'] ?? 2
    await awardPoints(memberId, pts, 'weekly_superstar', { week: since })
    awarded += pts
  }
  return awarded
}

/** Index of the pending scan that matches this class, or -1. */
export function matchingScanIndex(
  scans: { id: string; created_at: string }[],
  ev: { start: string },
): number {
  const start = new Date(ev.start).getTime()
  return scans.findIndex((s) => {
    const t = new Date(s.created_at).getTime()
    return t >= start - SCAN_MATCH_BEFORE_MS && t <= start + SCAN_MATCH_AFTER_MS
  })
}

export type AwardResult = { coins: number; referralPaid: boolean }

/**
 * Credit one confirmed class: coins, the check-in row, the processed marker,
 * the streak day and its milestone, the month bonus, and a referral if this is
 * the referred member's first class.
 *
 * The caller must have already matched `scanId` to `ev` and confirmed the
 * check-in is not in processed_checkins — the processed insert here is what
 * makes a repeat run a no-op.
 */
export async function awardAttendance(
  db: any,
  member: AwardMember,
  ev: AttendedEvent,
  scanId: string,
  rules: Record<string, number>,
  promos: Promo[],
): Promise<AwardResult> {
  const bonus = happyHourBonus(ev, promos)
  const pts = (rules['class_attended'] ?? 1) + bonus
  let coins = pts

  await awardPoints(member.id, pts, 'class_attended', {
    class_name: ev.class_name, branch: ev.branch,
    arbox_checkin_id: ev.arbox_checkin_id, verified: true,
    ...(bonus > 0 ? { happy_hour_bonus: bonus } : {}),
  })

  await db.from('checkins').update({
    status: 'verified', arbox_checkin_id: ev.arbox_checkin_id,
    coins_awarded: pts, verified_at: new Date().toISOString(),
  }).eq('id', scanId)

  await db.from('processed_checkins').insert({
    arbox_checkin_id: ev.arbox_checkin_id, member_id: member.id, is_happy_hour: bonus > 0,
  })

  // Streaks count active DAYS — a second class today doesn't advance it,
  // and doesn't pay the milestone a second time.
  const { streak, milestone } = await registerAttendance(db, member)
  if (milestone) {
    const streakPts = rules['streak_10'] ?? 10
    await awardPoints(member.id, streakPts, 'streak_10', { streak })
    coins += streakPts
  }

  coins += await checkMonthBonus(member.id, rules, db)
  coins += await checkWeekBonus(member.id, rules, db)

  // First verified class by someone who arrived through a referral link pays
  // both sides. payReferral is a no-op on later classes.
  let referralPaid = false
  if (member.referred_by && await payReferral(member, 'referral_trial')) {
    coins += (rules['referral_trial'] ?? 50) * 2
    referralPaid = true
  }

  return { coins, referralPaid }
}
