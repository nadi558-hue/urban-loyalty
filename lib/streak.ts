import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * ─── Streak engine ────────────────────────────────────────────────────────
 *
 * A streak counts CONSECUTIVE ACTIVE DAYS, not classes. Two classes in one day
 * advance it once; a doubles-day does not buy a free tomorrow.
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
 * Record that a member trained today. Returns the streak after the visit and
 * whether this visit crossed a bonus milestone.
 *
 * Idempotent within a day: a second class today returns the current streak
 * untouched and reports no milestone, so the bonus can't be paid twice.
 */
export async function registerAttendance(
  db: SupabaseClient,
  member: StreakMember,
  today: string = localDate(),
): Promise<{ streak: number; milestone: boolean }> {
  const last = member.last_active_date ?? null

  if (last === today) {
    return { streak: member.current_streak ?? 0, milestone: false }
  }

  // Yesterday counts as continuous. A consumed freeze leaves last_active_date
  // parked on the covered day, so a frozen gap continues through here.
  const streak = last === addDays(today, -1) ? (member.current_streak ?? 0) + 1 : 1
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
 * Daily decay. A streak survives while the member trained today or yesterday —
 * today is still in progress, so it is never counted against them.
 *
 * One missed day is covered by a streak freeze if they hold one. The freeze is
 * recorded on the day it covered and moves last_active_date onto that day, so
 * the chain reads as unbroken to registerAttendance. A freeze covers a single
 * day only: miss two in a row and the streak goes regardless.
 */
export async function runStreakRollover(
  db: SupabaseClient,
  today: string = localDate(),
): Promise<RolloverResult> {
  const yesterday = addDays(today, -1)
  const dayBefore = addDays(today, -2)

  const { data, error } = await db.from('members')
    .select('id, current_streak, longest_streak, last_active_date, streak_freezes, streak_frozen_on')
    .gt('current_streak', 0)
    .limit(5000)
  if (error || !data) return { broken: 0, frozen: 0 }

  let broken = 0, frozen = 0

  for (const m of data as StreakMember[]) {
    const last = m.last_active_date ?? null

    // Trained today or yesterday — still alive.
    if (last === today || last === yesterday) continue

    // Missed exactly yesterday, and holds a freeze.
    if (last === dayBefore && (m.streak_freezes ?? 0) > 0) {
      await db.from('members').update({
        streak_freezes: (m.streak_freezes ?? 0) - 1,
        streak_frozen_on: yesterday,
        last_active_date: yesterday,
      }).eq('id', m.id)
      frozen++
      continue
    }

    // Gone. A streak carrying no date at all is stale data and also resets.
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
