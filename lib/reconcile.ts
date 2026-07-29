/* eslint-disable @typescript-eslint/no-explicit-any */
import { createServiceClient } from '@/lib/supabase'
import { getAttendedCheckIns, reportWindow, arboxConfigured } from '@/lib/arbox'
import { getRules } from '@/lib/points'
import { awardAttendance, matchingScanIndex, type AttendedEvent, type AwardMember, type Promo } from '@/lib/attendance'

/**
 * ─── On-demand reconciliation ─────────────────────────────────────────────
 *
 * A scan records presence but not participation, so coins wait for Arbox to
 * confirm the class was attended. Left to the nightly cron alone that wait is
 * up to a day, which reads as "the app ate my points". This runs the same
 * check for one member, over the last couple of days only, when they open the
 * app with a scan still pending — so in the normal case (members check in at
 * the door on arrival) the coins land within minutes.
 *
 * Deliberately cheap and quiet: it does nothing unless that member actually
 * has a pending scan, it never throws into a page render, and awarding goes
 * through the same awardAttendance the cron uses so the two cannot drift.
 */

const PENDING_LOOKBACK_MS = 2 * 86_400_000

/** How long a scan may sit unconfirmed before we stop expecting Arbox to
 *  confirm it — usually an instructor who never marked the class. */
export const STALE_PENDING_MS = 20 * 60 * 60 * 1000

export type PendingScan = { id: string; created_at: string }

/** The member's unconfirmed scans, newest first. Cheap — used to decide
 *  whether a reconcile is worth attempting at all. */
export async function getPendingScans(memberId: string): Promise<PendingScan[]> {
  if (memberId === 'demo') return []
  try {
    const db = createServiceClient()
    const { data, error } = await db.from('checkins')
      .select('id, created_at')
      .eq('member_id', memberId)
      .eq('status', 'pending')
      .is('arbox_checkin_id', null)
      .gte('created_at', new Date(Date.now() - PENDING_LOOKBACK_MS).toISOString())
      .order('created_at', { ascending: false })
    if (error) return []
    return (data ?? []) as PendingScan[]
  } catch { return [] }
}

export type ReconcileResult = { awarded: number; coins: number }

/**
 * Try to confirm this member's pending scans against Arbox. Returns what was
 * awarded, so a caller can surface it. Safe to call on every page load.
 */
export async function reconcileMember(memberId: string): Promise<ReconcileResult> {
  const none = { awarded: 0, coins: 0 }
  if (memberId === 'demo' || !arboxConfigured()) return none

  try {
    const pending = await getPendingScans(memberId)
    if (pending.length === 0) return none

    const db = createServiceClient() as any

    const { data: member } = await db.from('members')
      .select('id, arbox_id, current_streak, longest_streak, last_active_date, referred_by')
      .eq('id', memberId)
      .single()
    if (!member?.arbox_id) return none

    const { fromDate, toDate } = reportWindow(new Date(Date.now() - PENDING_LOOKBACK_MS).toISOString())
    const attended = (await getAttendedCheckIns(fromDate, toDate))
      .filter((e: AttendedEvent) => e.arbox_user_id === String(member.arbox_id))
    if (attended.length === 0) return none

    // Skip anything the cron already credited.
    const { data: processedRows } = await db.from('processed_checkins')
      .select('arbox_checkin_id')
      .eq('member_id', memberId)
    const processed = new Set<string>((processedRows ?? []).map((r: any) => r.arbox_checkin_id))

    const [{ data: promoRows }, rules] = await Promise.all([
      db.from('promoted_classes').select('title, branch, bonus_coins').eq('active', true),
      getRules(),
    ])
    const promos = (promoRows ?? []) as Promo[]

    const scans = [...pending].sort((a, b) => a.created_at.localeCompare(b.created_at))
    let awarded = 0, coins = 0

    for (const ev of attended) {
      if (processed.has(ev.arbox_checkin_id)) continue
      const idx = matchingScanIndex(scans, ev)
      if (idx < 0) continue
      const scan = scans.splice(idx, 1)[0] // consume so it can't match twice
      const res = await awardAttendance(db, member as AwardMember, ev, scan.id, rules, promos)
      processed.add(ev.arbox_checkin_id)
      awarded++
      coins += res.coins
    }

    return { awarded, coins }
  } catch {
    // Never let a reconcile failure break a page render — the cron is the
    // backstop and will pick these up tonight regardless.
    return none
  }
}
