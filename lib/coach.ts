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

export type Gender = 'female' | 'male' | 'unspecified'

/** Poses this resolver can select. All 16 exist per coach; these are the ones
 *  the home screen has a reason to show. */
export type CoachPose =
  | 'wave' | 'basic' | 'energetic' | 'empathetic'
  | 'celebrate' | 'streak_flame' | 'streak_lost'

/** Day 3 of a live streak is where it starts feeling like a habit. */
export const ENERGETIC_MIN = 3
export const MILESTONES = [3, 7, 14, 30, 60, 100]

/**
 * A line, in the forms Hebrew needs.
 *
 * A plain string is one that reads the same either way — often because the
 * verb is first-person plural ("נתחיל"), or a past-tense second person that is
 * a homograph without niqqud ("הצטרפת"). Where the sentence genuinely has to
 * choose, `n` carries a neutral rewrite for members who have not told us, so
 * nobody is addressed wrongly by default.
 */
type Line = string | { n: string; f: string; m: string }

const MESSAGES: Record<CoachPose, Line[]> = {
  wave: [
    {
      n: 'ברוכים הבאים למועדון! אני כאן ללוות אתכם.',
      f: 'ברוכה הבאה למועדון! אני כאן ללוות אותך.',
      m: 'ברוך הבא למועדון! אני כאן ללוות אותך.',
    },
    {
      n: 'נעים להכיר! מתחילים את המסע הזה יחד.',
      f: 'נעים להכיר! בואי נתחיל את המסע הזה יחד.',
      m: 'נעים להכיר! בוא נתחיל את המסע הזה יחד.',
    },
    'איזה כיף שהצטרפת. השיעור הראשון תמיד הכי מרגש.',
  ],
  basic: [
    {
      n: 'איזה כיף לראות אתכם כאן! מתחילים חזק.',
      f: 'איזה כיף לראות אותך כאן! בואי נתחיל חזק.',
      m: 'איזה כיף לראות אותך כאן! בוא נתחיל חזק.',
    },
    {
      n: 'היום יום מצוין לזוז. מוכנים?',
      f: 'היום יום מצוין לזוז. מוכנה?',
      m: 'היום יום מצוין לזוז. מוכן?',
    },
    'נתחיל בנשימה עמוקה ונצא לדרך.',
  ],
  energetic: [
    {
      n: 'רצף של {streak} ימים! כושר שיא. שאפו!',
      f: 'רצף של {streak} ימים! את בכושר שיא. שאפו!',
      m: 'רצף של {streak} ימים! אתה בכושר שיא. שאפו!',
    },
    'האנרגיה שלך מדבקת! {streak} ימים ברצף ועוד היד נטויה.',
    'התמדה משתלמת — {streak} ימים ברצף. גאה בך!',
  ],
  empathetic: [
    'החיים עמוסים לפעמים. הרצף שלך מוקפא להיום.',
    'התגעגענו אליך היום. יש זמן להתאושש — המגן שומר על הרצף.',
    'הפספוס הקטן הזה לא מגדיר אותך. נתראה מחר?',
  ],
  celebrate: [
    'רצף של {streak} ימים! רגע ששווה לעצור ולחגוג.',
  ],
  streak_flame: [
    '{streak} ימים ברצף והאש בוערת. לא עוצרים עכשיו!',
  ],
  streak_lost: [
    'הרצף נקטע, אבל ההרגל לא. מתחילים חדש היום.',
    'כל רצף מתחיל מיום אחד. שנתחיל את היום הזה?',
  ],
}

const MILESTONE_MESSAGES: Record<number, Line> = {
  3: 'שלושה ימים ברצף — ההרגל מתחיל להיבנות 🌱',
  7: {
    n: 'שבוע שלם ברצף! 🎉 רשמית במסלול המנצח.',
    f: 'שבוע שלם ברצף! 🎉 את רשמית במסלול המנצח.',
    m: 'שבוע שלם ברצף! 🎉 אתה רשמית במסלול המנצח.',
  },
  14: 'שבועיים ברצף 🔥 ההרגל כבר חלק מהזהות.',
  30: {
    n: 'חודש שלם! 👑 ליגה של עצמכם — כל הכבוד.',
    f: 'חודש שלם! 👑 את בליגה של עצמך — כל הכבוד.',
    m: 'חודש שלם! 👑 אתה בליגה של עצמך — כל הכבוד.',
  },
  60: '60 יום של התמדה. השראה לכל המועדון 🌟',
  100: {
    n: '100 ימים! ✨ מעטים מגיעים לכאן. אנחנו גאים בך.',
    f: '100 ימים! ✨ מעטות מגיעות לכאן. אנחנו גאים בך.',
    m: '100 ימים! ✨ מעטים מגיעים לכאן. אנחנו גאים בך.',
  },
}

export type CoachView = {
  coach: CoachId
  pose: CoachPose
  image: string
  message: string
  isMilestone: boolean
  streak: number
}

type CoachMember = StreakMember & {
  preferred_coach?: string | null
  last_active_date?: string | null
  gender?: string | null
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
export function getCoachView(member: CoachMember, today?: string): CoachView {
  const coach = (COACHES.includes(member.preferred_coach as CoachId)
    ? member.preferred_coach : 'maya') as CoachId
  const gender: Gender =
    member.gender === 'female' || member.gender === 'male' ? member.gender : 'unspecified'

  const { currentStreak: streak, streakFreezeUsed } = streakView(member, today)
  const everTrained = Boolean(member.last_active_date) || streak > 0
  const isMilestone = MILESTONES.includes(streak)

  const pose: CoachPose =
    !everTrained              ? 'wave'
    : streakFreezeUsed        ? 'empathetic'
    : isMilestone             ? 'celebrate'
    : streak >= 7             ? 'streak_flame'
    : streak >= ENERGETIC_MIN ? 'energetic'
    : streak === 0            ? 'streak_lost'
    : 'basic'

  return {
    coach,
    pose,
    image: `/avatars/${coach}/${pose}.png`,
    message: pickMessage(pose, streak, isMilestone, gender),
    isMilestone,
    streak,
  }
}

function inflect(line: Line, gender: Gender): string {
  if (typeof line === 'string') return line
  return gender === 'female' ? line.f : gender === 'male' ? line.m : line.n
}

/** Milestone lines win. Otherwise rotate the bank by day-of-month, so the line
 *  varies day to day but stays stable within a day (no hydration mismatch). */
function pickMessage(pose: CoachPose, streak: number, isMilestone: boolean, gender: Gender): string {
  const milestone = isMilestone ? MILESTONE_MESSAGES[streak] : undefined
  const bank = MESSAGES[pose]
  const line = milestone ?? bank[new Date().getDate() % bank.length]
  return inflect(line, gender).replace('{streak}', String(streak))
}
