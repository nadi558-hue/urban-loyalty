import { createServiceClient } from '@/lib/supabase'

export const SHARE_BUCKET = 'social-shares'
export const COOLDOWN_DAYS = 7

export type ShareStatus = 'pending' | 'approved' | 'rejected'

export type Share = {
  id: string
  member_id: string
  image_url: string
  status: ShareStatus
  coins_awarded: number | null
  note: string | null
  created_at: string
  reviewed_at: string | null
}

export type ShareEligibility = {
  canSubmit: boolean
  reason: 'ok' | 'pending' | 'cooldown'
  /** ISO date the next submission becomes available, when on cooldown. */
  nextAt?: string
}

/**
 * Whether this member may submit a story right now.
 *
 * Two gates: one submission may be awaiting review at a time, and an approved
 * one starts a 7-day cooldown. Rejected submissions don't count against either,
 * so a member whose screenshot was unclear can retry immediately.
 */
export async function checkEligibility(memberId: string): Promise<ShareEligibility> {
  const db = createServiceClient()
  const since = new Date(Date.now() - COOLDOWN_DAYS * 86_400_000).toISOString()

  const { data, error } = await db
    .from('social_shares')
    .select('status, created_at')
    .eq('member_id', memberId)
    .in('status', ['pending', 'approved'])
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(1) as { data: { status: ShareStatus; created_at: string }[] | null; error: unknown }

  // Table not migrated yet — don't block the screen, the submit action
  // re-checks and will surface the real failure.
  if (error) return { canSubmit: true, reason: 'ok' }

  const last = data?.[0]
  if (!last) return { canSubmit: true, reason: 'ok' }

  if (last.status === 'pending') return { canSubmit: false, reason: 'pending' }

  return {
    canSubmit: false,
    reason: 'cooldown',
    nextAt: new Date(new Date(last.created_at).getTime() + COOLDOWN_DAYS * 86_400_000).toISOString(),
  }
}

export async function getMemberShares(memberId: string, limit = 5): Promise<Share[]> {
  try {
    const db = createServiceClient()
    const { data } = await db
      .from('social_shares')
      .select('*')
      .eq('member_id', memberId)
      .order('created_at', { ascending: false })
      .limit(limit)
    return (data as Share[] | null) ?? []
  } catch {
    return []
  }
}
