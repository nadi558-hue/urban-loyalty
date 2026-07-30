import { createServiceClient } from '@/lib/supabase'

export type LedgerEntry = {
  id: string
  reason: string
  points: number
  created_at: string
  metadata: Record<string, unknown> | null
}

export const REASON_LABELS: Record<string, string> = {
  class_attended:      'שיעור הושלם',
  happy_hour:          'Happy Hour · מטבע נוסף',
  streak_10:           'בונוס רצף 10 שיעורים',
  half_month:          'בונוס חצי חודש',
  full_month:          'בונוס נוכחות מלאה',
  welcome_bonus:       'בונוס הצטרפות',
  referral_trial:      'חבר הגיע לשיעור ניסיון',
  referral_subscribed: 'הפניית חבר · רכש מנוי',
  social_share:        'שיתוף סטורי',
  birthday:            'מתנת יום הולדת',
  anniversary:         'מתנת שנת חברות',
  manual:              'הוספה ידנית',
  redemption:          'מימוש הטבה',
  late_cancel:         'ביטול מאוחר · רצף אופס',
  // Written once by supabase/migration_opening_balance.sql, for members whose
  // balance predates the ledger.
  opening_balance:     'יתרת פתיחה',
  opening_redemption:  'מימושים קודמים',
}

export function reasonLabel(reason: string) {
  return REASON_LABELS[reason] ?? reason
}

/** A member's ledger, newest first. Empty for the demo member or on failure. */
export async function getLedger(memberId: string, limit = 100): Promise<LedgerEntry[]> {
  if (memberId === 'demo') return []
  try {
    const db = createServiceClient()
    const { data, error } = await db.from('point_ledger')
      .select('id, reason, points, created_at, metadata')
      .eq('member_id', memberId)
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) return []
    return (data ?? []) as LedgerEntry[]
  } catch { return [] }
}

/**
 * Classes attended in the current calendar month — the counter behind the
 * "full month" challenge, which pays at 12. Counts `class_attended` only;
 * `happy_hour` is a top-up on the same visit, not a second class.
 */
export async function countClassesThisMonth(memberId: string): Promise<number> {
  if (memberId === 'demo') return 0
  try {
    const now = new Date()
    const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString()
    const db = createServiceClient()
    const { count, error } = await db.from('point_ledger')
      .select('*', { count: 'exact', head: true })
      .eq('member_id', memberId)
      .eq('reason', 'class_attended')
      .gte('created_at', from)
    if (error) return 0
    return count ?? 0
  } catch { return 0 }
}
