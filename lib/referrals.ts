import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase'
import { awardPoints, getRules } from '@/lib/points'
import { REFERRAL_COOKIE } from '@/app/join/route'

/**
 * Attach the referrer parked by /join to this member, once.
 *
 * Called on authenticated page loads. Only ever sets `referred_by` when it is
 * still null, so a member can't be re-attributed later, and it can't be used
 * to overwrite an existing referral by visiting another /join link.
 */
export async function attachReferrer(memberId: string): Promise<void> {
  try {
    const jar = await cookies()
    const code = jar.get(REFERRAL_COOKIE)?.value
    if (!code) return

    const db = createServiceClient()

    const { data: referrer } = await db
      .from('members')
      .select('id')
      .eq('referral_code', code)
      .single() as { data: { id: string } | null }

    // Unknown code, or the link was their own — nothing to attach.
    if (!referrer || referrer.id === memberId) return

    await db
      .from('members')
      .update({ referred_by: referrer.id })
      .eq('id', memberId)
      .is('referred_by', null)
  } catch {
    // Attribution is best-effort; never break the page over it.
  }
}

type ReferredMember = { id: string; referred_by: string | null }

/**
 * Pay both sides of a referral milestone, once per referred member.
 *
 * Idempotency is keyed on the *referred* member having a ledger row with this
 * reason — both sides are paid together, so that single check covers both.
 */
export async function payReferral(
  member: ReferredMember,
  reason: 'referral_trial' | 'referral_subscribed',
): Promise<boolean> {
  if (!member.referred_by) return false

  const db = createServiceClient()

  const { count } = await db
    .from('point_ledger')
    .select('*', { count: 'exact', head: true })
    .eq('member_id', member.id)
    .eq('reason', reason)

  if ((count ?? 0) > 0) return false

  const rules = await getRules()
  const points = rules[reason] ?? 50

  // The friend who joined, and the member who invited them.
  await awardPoints(member.id, points, reason, { as: 'referred' })
  await awardPoints(member.referred_by, points, reason, { as: 'referrer', referred_member: member.id })
  return true
}
