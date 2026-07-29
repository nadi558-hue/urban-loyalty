import { streakView, type StreakMember } from '@/lib/streak'

/**
 * ─── Coach avatar state ───────────────────────────────────────────────────
 *
 * A coach character mirrors the member's momentum, Duolingo-style. This is the
 * TypeScript port of avatar_system/avatar_logic.js, extended to use the poses
 * that actually shipped (16 per coach) rather than the original three. The .js
 * file stays as the design reference; this is what the app runs.
 *
 * Pure: feed it a member, get back what to render. No I/O.
 */

export type CoachId = 'maya' | 'sara' | 'idan'
export const COACHES: CoachId[] = ['maya', 'sara', 'idan']
export const COACH_NAMES: Record<CoachId, string> = { maya: 'מאיה', sara: 'שרה', idan: 'עידן' }

/** Poses this resolver can select. All 16 exist per coach; these are the ones
 *  the home screen has a reason to show. */
export type CoachPose =
  | 'wave' | 'basic' | 'energetic' | 'empathetic'
  | 'celebrate' | 'streak_flame' | 'streak_lost'

/** Day 3 of a live streak is where it starts feeling like a habit. */
export const ENERGETIC_MIN = 3
export const MILESTONES = [3, 7, 14, 30, 60, 100]

const MESSAGES: Record<CoachPose, string[]> = {
  wave: [
    'ברוכה הבאה למועדון! אני כאן ללוות אותך.',
    'נעים להכיר! בואי נתחיל את המסע הזה יחד.',
    'איזה כיף שהצטרפת. השיעור הראשון תמיד הכי מרגש.',
  ],
  basic: [
    'איזה כיף לראות אותך כאן! בואי נתחיל חזק.',
    'היום זה יום מצוין לזוז. מוכנה לזה?',
    'נתחיל בנשימה עמוקה ונצא לדרך.',
  ],
  energetic: [
    'רצף של {streak} ימים! את בכושר שיא. שאפו!',
    'האנרגיה שלך מדבקת! {streak} ימים ברצף ועוד היד נטויה.',
    'התמדה משתלמת — {streak} ימים ברצף. גאה בך!',
  ],
  empathetic: [
    'החיים עמוסים לפעמים, אני מבינה. הרצף שלך מוקפא להיום.',
    'התגעגענו אליך! קחי את הזמן, המגן שומר לך על הרצף.',
    'הפספוס הקטן הזה לא מגדיר אותך. נתראה מחר?',
  ],
  celebrate: [
    'רצף של {streak} ימים! זה רגע ששווה לעצור ולחגוג.',
  ],
  streak_flame: [
    '{streak} ימים ברצף והאש בוערת. אל תעצרי עכשיו!',
  ],
  streak_lost: [
    'הרצף נקטע, אבל ההרגל לא. בואי נתחיל אחד חדש היום.',
    'כל רצף מתחיל מיום אחד. שנתחיל את היום הזה?',
  ],
}

const MILESTONE_MESSAGES: Record<number, string> = {
  3:   'שלושה ימים ברצף — ההרגל מתחיל להיבנות 🌱',
  7:   'שבוע שלם ברצף! 🎉 את רשמית במסלול המנצח.',
  14:  'שבועיים ברצף 🔥 ההרגל כבר חלק ממי שאת.',
  30:  'חודש שלם! 👑 את בליגה של עצמך — כל הכבוד.',
  60:  '60 יום של התמדה. את השראה לכל המועדון 🌟',
  100: '100 ימים! ✨ מעטות מגיעות לכאן. אנחנו גאים בך.',
}

export type CoachView = {
  coach: CoachId
  pose: CoachPose
  image: string
  message: string
  isMilestone: boolean
  streak: number
}

/**
 * Pick the pose. Order matters — the first match wins:
 *
 *   never trained  → wave         (greeting, not a scolding)
 *   freeze used    → empathetic   (a day was missed but the streak survived)
 *   milestone day  → celebrate    (only on the exact day)
 *   streak ≥ 3     → energetic / streak_flame from a week in
 *   streak lost    → streak_lost  (they have history but the chain broke)
 *   otherwise      → basic
 */
export function getCoachView(
  member: StreakMember & { preferred_coach?: string | null; last_active_date?: string | null },
  today?: string,
): CoachView {
  const coach = (COACHES.includes(member.preferred_coach as CoachId)
    ? member.preferred_coach : 'maya') as CoachId
  const { currentStreak: streak, streakFreezeUsed } = streakView(member, today)
  const everTrained = Boolean(member.last_active_date) || streak > 0
  const isMilestone = MILESTONES.includes(streak)

  const pose: CoachPose =
    !everTrained          ? 'wave'
    : streakFreezeUsed    ? 'empathetic'
    : isMilestone         ? 'celebrate'
    : streak >= 7         ? 'streak_flame'
    : streak >= ENERGETIC_MIN ? 'energetic'
    : streak === 0        ? 'streak_lost'
    : 'basic'

  return {
    coach,
    pose,
    image: `/avatars/${coach}/${pose}.png`,
    message: pickMessage(pose, streak, isMilestone),
    isMilestone,
    streak,
  }
}

/** Milestone lines win. Otherwise rotate the bank by day-of-month, so the line
 *  varies day to day but stays stable within a day (no hydration mismatch). */
function pickMessage(pose: CoachPose, streak: number, isMilestone: boolean): string {
  if (isMilestone && MILESTONE_MESSAGES[streak]) return MILESTONE_MESSAGES[streak]
  const bank = MESSAGES[pose]
  return bank[new Date().getDate() % bank.length].replace('{streak}', String(streak))
}
