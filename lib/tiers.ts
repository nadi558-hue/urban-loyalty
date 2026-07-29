/* eslint-disable @typescript-eslint/no-explicit-any */
import { createServiceClient } from '@/lib/supabase'
import { calcTier } from '@/lib/points'

/**
 * ─── Nightly tier review ──────────────────────────────────────────────────
 *
 * A tier reflects the last 12 months of activity, not a lifetime total. Coins
 * earned longer ago than that age out, which is the only thing that can move a
 * member down — awardPoints can only ever move them up.
 *
 * Recomputed from the ledger rather than decremented, because the ledger is the
 * record of what actually happened and a drift here would silently mis-tier a
 * member for a year.
 */

export const QUALIFYING_WINDOW_MONTHS = 12

/**
 * A drop is announced before it takes effect. A member who has slipped below
 * their tier's threshold keeps it for this long, so the app can tell them and
 * they have a fair chance to earn the difference back.
 */
export const DEMOTION_NOTICE_DAYS = 30

export type TierReviewResult = { reviewed: number; promoted: number; demoted: number; pending: number }

export async function runTierReview(): Promise<TierReviewResult> {
  const empty = { reviewed: 0, promoted: 0, demoted: 0, pending: 0 }
  try {
    const db = createServiceClient() as any
    const since = new Date()
    since.setMonth(since.getMonth() - QUALIFYING_WINDOW_MONTHS)

    const [{ data: members }, { data: ledger }] = await Promise.all([
      db.from('members').select('*').limit(5000),
      db.from('point_ledger').select('member_id, points, created_at')
        .gt('points', 0).gte('created_at', since.toISOString()).limit(200000),
    ])
    if (!members) return empty

    const earned = new Map<string, number>()
    for (const l of (ledger ?? []) as any[]) {
      earned.set(l.member_id, (earned.get(l.member_id) ?? 0) + l.points)
    }

    const today = new Date().toISOString().slice(0, 10)
    let promoted = 0, demoted = 0, pending = 0

    for (const m of members as any[]) {
      const qualifying = earned.get(m.id) ?? 0
      const target = calcTier(qualifying)
      const update: Record<string, unknown> = { qualifying_coins: qualifying }

      if (target === m.tier) {
        // Back where they belong — clear any pending drop.
        if (m.tier_reviewed_at) update.tier_reviewed_at = null
      } else if (rank(target) > rank(m.tier)) {
        update.tier = target
        update.tier_reviewed_at = null
        promoted++
      } else {
        // Below the threshold. Start the notice period, or act on it once the
        // member has had the full window to earn the difference back.
        if (!m.tier_reviewed_at) {
          update.tier_reviewed_at = today
          pending++
        } else if (daysBetween(m.tier_reviewed_at, today) >= DEMOTION_NOTICE_DAYS) {
          update.tier = target
          update.tier_reviewed_at = null
          demoted++
        } else {
          pending++
        }
      }

      await db.from('members').update(update).eq('id', m.id)
    }

    return { reviewed: members.length, promoted, demoted, pending }
  } catch {
    return empty
  }
}

function rank(tier: string): number {
  return tier === 'platinum' ? 2 : tier === 'gold' ? 1 : 0
}

function daysBetween(from: string, to: string): number {
  const [y1, m1, d1] = from.split('-').map(Number)
  const [y2, m2, d2] = to.split('-').map(Number)
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86400000)
}
