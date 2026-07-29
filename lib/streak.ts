import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * ─── Streak engine ────────────────────────────────────────────────────────
 *
 * A streak counts CONSECUTIVE CLASSES, which is what the point rule promises:
 * "בונוס על 10 שיעורים רצופים ללא ביטול". Counting consecutive days instead
 * would never pay anyone here — members train two to four times a week, so a
 * day-based chain resets on the rest day between every session.
 *
 * A streak is broken by a late cancellation, or by going STREAK_GRACE_DAYS
 * without training at all. Without that second rule a member who simply stops
 * coming keeps their streak forever, since nothing else would ever reset it.
 *
 * Two halves, and both are required:
 *
 *   registerAttendance()  runs when a class is verified — it can only ever
 *                         raise a streak, so on its own a member who stops
 *                         coming keeps a stale number forever.
 *   runStreakRollover()   runs daily from the cron and is what actually
 *                         breaks streaks, since a lapsed member generates no
 *                         events to hang the check on.
 *
 * Dates are Israel-local, never UTC. The cron fires at 04:00 UTC, which is
 * already the next day in Jerusalem — computing "today" in UTC would expire
 * streaks a day early for anyone attending an evening class.
 */

const TZ = 'Asia/Jerusalem'

/** Today in Israel as YYYY-MM-DD. en-CA is the locale that formats that way. */
export function localDate(d: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(d)
}

/** Shift a YYYY-MM-DD string by whole days. Anchored at midday UTC so a DST
 *  shift can never push the result onto the neighbouring date. */
export function addDays(iso: string, n: number): string {
  const [y, m, d] = iso.split('-').map(Number)
  const t = Date.UTC(y, m - 1, d, 12) + n * 86400000
  return new Date(t).toISOString().slice(0, 10)
}

export type StreakMember = {
  id: string
  current_streak: number
  longest_streak?: number
  last_active_date?: string | null
  streak_freezes?: number
  streak_frozen_on?: string | null
}

export const STREAK_BONUS_EVERY = 10

/**
 * Days of total inactivity before a streak lapses.
 *
 * Has to clear the longest ordinary gap between sessions. A once-a-week member
 * leaves 7 days, so 14 gives a full missed week of slack — illness, reserve
 * duty, a holiday — without letting a streak survive a genuine drop-off.
 */
export const STREAK_GRACE_DAYS = 14

/**
 * Record one attended class. Returns the streak after it and whether this class
 * crossed a bonus milestone.
 *
 * Every awarded class advances the streak, including a second one on the same
 * day — ten classes is ten classes. Double-counting is prevented upstream:
 * processed_checkins makes each Arbox check-in payable exactly once, so this is
 * only ever reached for a class not yet credited.
 */
export async function registerAttendance(
  db: SupabaseClient,
  member: StreakMember,
  today: string = localDate(),
): Promise<{ streak: number; milestone: boolean }> {
  const last = member.last_active_date ?? null

  // Continue the chain unless they had already lapsed before this class. The
  // nightly rollover normally resets those, but a class can arrive first.
  const lapsed = last !== null && last < addDays(today, -STREAK_GRACE_DAYS)
  const streak = lapsed ? 1 : (member.current_streak ?? 0) + 1
  const longest = Math.max(member.longest_streak ?? 0, streak)

  await db.from('members').update({
    current_streak: streak,
    longest_streak: longest,
    last_active_date: today,
  }).eq('id', member.id)

  // Keep the caller's in-memory copy in step — sync reuses it across events.
  member.current_streak = streak
  member.longest_streak = longest
  member.last_active_date = today

  return { streak, milestone: streak > 0 && streak % STREAK_BONUS_EVERY === 0 }
}

/** A late cancellation drops the streak outright — a freeze does not cover it,
 *  since the member chose not to come. */
export async function breakStreak(db: SupabaseClient, member: StreakMember) {
  await db.from('members').update({
    current_streak: 0,
    last_active_date: null,
    streak_frozen_on: null,
  }).eq('id', member.id)
  member.current_streak = 0
  member.last_active_date = null
}

export type RolloverResult = { broken: number; frozen: number }

/**
 * Daily lapse check. A streak survives while the member has trained within the
 * last STREAK_GRACE_DAYS; past that it is gone.
 *
 * A streak freeze buys one extra day at the edge of that window, for the member
 * who is one day away from lapsing. It is spent on the day it covers and moves
 * last_active_date forward, so the chain reads as unbroken. It buys a day, not
 * a reprieve — the next day the same check applies again.
 */
export async function runStreakRollover(
  db: SupabaseClient,
  today: string = localDate(),
): Promise<RolloverResult> {
  const cutoff = addDays(today, -STREAK_GRACE_DAYS)

  const { data, error } = await db.from('members')
    .select('id, current_streak, longest_streak, last_active_date, streak_freezes, streak_frozen_on')
    .gt('current_streak', 0)
    .limit(5000)
  if (error || !data) return { broken: 0, frozen: 0 }

  let broken = 0, frozen = 0

  for (const m of data as StreakMember[]) {
    const last = m.last_active_date ?? null

    // Still inside the window.
    if (last !== null && last >= cutoff) continue

    // Exactly one day past it, and they hold a freeze.
    if (last !== null && last === addDays(cutoff, -1) && (m.streak_freezes ?? 0) > 0) {
      await db.from('members').update({
        streak_freezes: (m.streak_freezes ?? 0) - 1,
        streak_frozen_on: today,
        last_active_date: cutoff,
      }).eq('id', m.id)
      frozen++
      continue
    }

    // Lapsed. A streak carrying no date at all is stale data and also resets.
    await db.from('members').update({
      current_streak: 0,
      streak_frozen_on: null,
    }).eq('id', m.id)
    broken++
  }

  return { broken, frozen }
}

/** The shape avatar_logic's resolveAvatarState() expects. */
export function streakView(member: StreakMember, today: string = localDate()) {
  return {
    currentStreak: member.current_streak ?? 0,
    longestStreak: member.longest_streak ?? 0,
    // "a day was missed and the freeze absorbed it" — true only while the
    // covered day is still recent enough to be worth showing.
    streakFreezeUsed:
      member.streak_frozen_on === today || member.streak_frozen_on === addDays(today, -1),
  }
}
