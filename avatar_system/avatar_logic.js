/**
 * URBAN Club — Coach Avatar State System
 * ---------------------------------------
 * Duolingo-style streak gamification. A fixed coach character (maya / sara)
 * is shown in one of 3 watercolor states that mirror the member's momentum:
 *
 *   basic       — relaxed, confident. Default daily home screen.
 *   energetic   — dynamic, gold aura. Shown on an ACTIVE streak (3+ days).
 *   empathetic  — soft, hand-on-heart. Shown when a day was missed and the
 *                 Streak Freeze (מגן רצף) protected the streak.
 *
 * The module is pure and framework-agnostic: feed it a user object, get back
 * { state, image, message }. No side effects, easy to unit-test.
 */

/**
 * @typedef {'basic'|'energetic'|'empathetic'} AvatarState
 * @typedef {'maya'|'sara'} CoachId
 * @typedef {Object} UserStreak
 * @property {string}  userId
 * @property {number}  currentStreak       // consecutive active days
 * @property {boolean} streakFreezeUsed     // freeze consumed today (a day was missed)
 * @property {number} [weeklyGoalStatus]    // 0-100, weekly goal completion %
 * @property {string} [name]                // for personalised bubbles
 */

/* ------------------------------------------------------------------ *
 * 1. CONFIG — the "evolution ladder"
 * ------------------------------------------------------------------ */
export const STREAK_TIERS = {
  ENERGETIC_MIN: 3, // day 3 onward of a live streak → energetic
};

// Milestone days that deserve a special celebratory bubble (still energetic).
export const MILESTONES = [3, 7, 14, 30, 60, 100];

/* ------------------------------------------------------------------ *
 * 2. MESSAGE BANK — brand voice: professional · luxurious · familial · encouraging
 *    {streak} and {name} are interpolated at render time.
 * ------------------------------------------------------------------ */
export const MESSAGES = {
  basic: [
    'איזה כיף לראות אותך כאן! בואי נתחיל חזק.',
    'היום זה יום מצוין לזוז. מוכנה לזה?',
    'ברוכה הבאה לסטודיו! נתחיל בנשימה עמוקה ונצא לדרך.',
  ],
  energetic: [
    'רצף מטורף! את בכושר שיא השבוע. שאפו!',
    'האנרגיה שלך מדבקת! תמשיכי ככה, את בדרך הנכונה.',
    'התמדה משתלמת – רואים את התוצאות על הגוף. גאה בך!',
  ],
  empathetic: [
    'החיים עמוסים לפעמים, אני מבינה לגמרי. אל תדאגי, הרצף שלך מוקפא להיום.',
    'התגעגענו אליך היום! קחי את הזמן להתאושש, ומחר נחזור למזרן.',
    'הפספוס הקטן הזה לא מגדיר אותך. אנחנו שומרים לך על המגן, נתראה מחר?',
  ],
};

// Special one-liners keyed by milestone day (override the generic energetic bank).
export const MILESTONE_MESSAGES = {
  7:   'שבוע שלם ברצף! 🎉 את רשמית במסלול המנצח.',
  14:  'שבועיים ברצף 🔥 ההרגל כבר חלק ממי שאת.',
  30:  'חודש שלם! 👑 את בליגה של עצמך — כל הכבוד.',
  60:  '60 יום של התמדה. את השראה לכל המועדון 🌟',
  100: '100 ימים! ✨ מעטות מגיעות לכאן. אנחנו גאים בך.',
};

/* ------------------------------------------------------------------ *
 * 3. CORE RESOLVERS
 * ------------------------------------------------------------------ */

/**
 * Decide which of the 3 visual states to show.
 * Priority: empathetic (freeze) > energetic (streak≥3) > basic (default).
 * @param {UserStreak} user
 * @returns {AvatarState}
 */
export function resolveAvatarState(user) {
  // 1) A day was missed but the Streak Freeze saved it → comfort mode (highest priority)
  if (user.streakFreezeUsed) return 'empathetic';
  // 2) Live streak of 3+ days → energetic
  if (user.currentStreak >= STREAK_TIERS.ENERGETIC_MIN) return 'energetic';
  // 3) Fresh start or day 1-2 → basic
  return 'basic';
}

/**
 * Resolve the asset path. Clean per-state PNGs live under public/avatars/.
 * @param {CoachId} coach
 * @param {AvatarState} state
 */
export function avatarImage(coach, state) {
  return `/avatars/${coach}/${state}.png`;
}

/**
 * Choose a motivation line. Milestone days win; otherwise rotate the bank by a
 * deterministic seed (day-of-month) so it varies day to day without randomness.
 * @param {UserStreak} user
 * @param {AvatarState} state
 */
export function pickMessage(user, state) {
  if (state === 'energetic' && MILESTONE_MESSAGES[user.currentStreak]) {
    return MILESTONE_MESSAGES[user.currentStreak];
  }
  const bank = MESSAGES[state];
  const seed = new Date().getDate(); // 1-31 → stable within a day
  const raw = bank[seed % bank.length];
  return raw
    .replace('{streak}', String(user.currentStreak))
    .replace('{name}', user.name ?? '');
}

/**
 * One call for the UI. Returns everything needed to render the coach card.
 * @param {UserStreak} user
 * @param {CoachId} [coach='maya']
 * @returns {{ state: AvatarState, image: string, message: string, isMilestone: boolean }}
 */
export function getCoachView(user, coach = 'maya') {
  const state = resolveAvatarState(user);
  return {
    state,
    image: avatarImage(coach, state),
    message: pickMessage(user, state),
    isMilestone: state === 'energetic' && MILESTONES.includes(user.currentStreak),
  };
}
