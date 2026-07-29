import { createServiceClient } from './supabase'

// ─── Urban Coins Economy ───────────────────────────────────────────────────
// 1 Urban Coin = per class attended (base)
// Bonuses and special events add on top

export const DEFAULT_RULES: Record<string, number> = {
  class_attended: 1,          // כל שיעור שהושלם
  streak_10: 10,              // 10 שיעורים רצופים ללא ביטול
  full_month: 30,             // 12+ שיעורים בחודש קלנדרי
  happy_hour: 1,              // כפל מטבעות בשיעור Happy Hour (מוסיף 1 נוסף)
  welcome_bonus: 20,          // בונוס הצטרפות לאפליקציה
  referral_trial: 50,         // חבר הגיע לשיעור ניסיון
  referral_subscribed: 50,    // חבר רכש מנוי (גם מפנה וגם מופנה מקבלים)
  social_share: 7,            // שיתוף סטורי עם תיוג (5-10, ממוצע 7)
  birthday: 50,               // יום הולדת
  anniversary: 20,            // שנת חברות בסטודיו
}

export type PointReason =
  | 'class_attended'
  | 'streak_10'
  | 'full_month'
  | 'happy_hour'
  | 'welcome_bonus'
  | 'referral_trial'
  | 'referral_subscribed'
  | 'social_share'
  | 'birthday'
  | 'anniversary'
  | 'manual'
  | 'redemption'

// ─── Tier thresholds (lifetime coins) ─────────────────────────────────────
export const TIER_THRESHOLDS = {
  silver:   0,
  gold:     500,
  platinum: 1500,
} as const

export const TIER_LABELS: Record<string, string> = {
  silver:   'כסף',
  gold:     'זהב',
  platinum: 'פלטינום',
}

export const TIER_NEXT: Record<string, number> = {
  silver:   500,
  gold:     1500,
  platinum: Infinity,
}

// What each tier unlocks, phrased only in terms of things the rewards catalog
// actually enforces (min_tier). Don't promise anything here that a member
// can't redeem in the app.
export const TIER_PERKS: Record<string, string> = {
  silver:   'גישה להטבות הבסיס במסך ההטבות',
  gold:     'גישה להטבות זהב: 10% הנחה על חידוש + שריון VIP שבועיים מראש',
  platinum: 'כל הטבות הזהב + הטבות פלטינום שיתווספו בהמשך',
}

export async function getRules(): Promise<Record<string, number>> {
  try {
    const db = createServiceClient()
    const { data } = await db.from('point_rules').select('key, points')
    if (!data || data.length === 0) return DEFAULT_RULES
    return Object.fromEntries((data as { key: string; points: number }[]).map((r) => [r.key, r.points]))
  } catch {
    return DEFAULT_RULES
  }
}

export async function awardPoints(
  memberId: string,
  points: number,
  reason: PointReason,
  metadata?: Record<string, unknown>
) {
  const db = createServiceClient()

  await db.from('point_ledger').insert({
    member_id: memberId,
    points,
    reason,
    metadata: metadata ?? null,
  })

  const { data: member } = await db
    .from('members')
    // '*' rather than a column list: naming a column that a not-yet-run
    // migration hasn't added fails the query, and this function would then
    // silently stop awarding coins at all.
    .select('*')
    .eq('id', memberId)
    .single() as { data: { total_coins: number; lifetime_coins: number; qualifying_coins: number | null } | null }

  if (!member) return

  const newTotal = member.total_coins + points
  // lifetime_coins is the all-time record and never falls; qualifying_coins is
  // the rolling 12-month total the tier is derived from, and the nightly review
  // is what ages entries out of it.
  const newLifetime = member.lifetime_coins + (points > 0 ? points : 0)
  const newQualifying = (member.qualifying_coins ?? 0) + (points > 0 ? points : 0)

  await db
    .from('members')
    .update({
      total_coins: newTotal,
      lifetime_coins: newLifetime,
      qualifying_coins: newQualifying,
      tier: calcTier(newQualifying),
    })
    .eq('id', memberId)
}

export async function deductPoints(memberId: string, points: number, reason: string) {
  return awardPoints(memberId, -points, 'redemption', { note: reason })
}

/** Tier from the rolling 12-month qualifying total, not the all-time one. */
export function calcTier(qualifyingPoints: number): 'silver' | 'gold' | 'platinum' {
  if (qualifyingPoints >= TIER_THRESHOLDS.platinum) return 'platinum'
  if (qualifyingPoints >= TIER_THRESHOLDS.gold) return 'gold'
  return 'silver'
}

export const TIER_RANK: Record<string, number> = { silver: 0, gold: 1, platinum: 2 }

/** Does this member's tier meet a reward's minimum? */
export function tierMeets(memberTier: string, minTier: string): boolean {
  return (TIER_RANK[memberTier] ?? 0) >= (TIER_RANK[minTier] ?? 0)
}

// Check if a weekly social share has already been awarded this week
export async function canAwardSocialShare(memberId: string): Promise<boolean> {
  try {
    const db = createServiceClient()
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    weekStart.setHours(0, 0, 0, 0)

    const { count } = await db
      .from('point_ledger')
      .select('*', { count: 'exact', head: true })
      .eq('member_id', memberId)
      .eq('reason', 'social_share')
      .gte('created_at', weekStart.toISOString()) as { count: number | null }

    return (count ?? 0) === 0
  } catch {
    return false
  }
}
