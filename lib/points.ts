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

export const TIER_PERKS: Record<string, string> = {
  silver:   'הנחה 5% על מנויים + עדיפות הרשמה לסדנאות',
  gold:     'הנחה 10% + כניסה חינם לסדנה מיוחדת כל 3 חודשים',
  platinum: 'הנחה 15% + סדנה חודשית + כרטיסייה VIP',
}

// ─── Reward costs (Urban Coins) ────────────────────────────────────────────
export const REWARD_COSTS = {
  credit_25: 30,       // 25₪ קרדיט למנוי הבא
  workshop: 40,        // כניסה לסדנה מיוחדת
  discount_10pct: 100, // 10% הנחה על חידוש מנוי
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
    .select('total_coins, lifetime_coins')
    .eq('id', memberId)
    .single() as { data: { total_coins: number; lifetime_coins: number } | null }

  if (!member) return

  const newTotal = member.total_coins + points
  const newLifetime = member.lifetime_coins + (points > 0 ? points : 0)
  const tier = calcTier(newLifetime)

  await db
    .from('members')
    .update({ total_coins: newTotal, lifetime_coins: newLifetime, tier })
    .eq('id', memberId)
}

export async function deductPoints(memberId: string, points: number, reason: string) {
  return awardPoints(memberId, -points, 'redemption', { note: reason })
}

export function calcTier(lifetimePoints: number): 'silver' | 'gold' | 'platinum' {
  if (lifetimePoints >= TIER_THRESHOLDS.platinum) return 'platinum'
  if (lifetimePoints >= TIER_THRESHOLDS.gold) return 'gold'
  return 'silver'
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
