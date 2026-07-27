import { createServiceClient } from '@/lib/supabase'

export type ReferralRow = {
  name: string
  status: 'pending' | 'trial' | 'subscribed'
  coins: number
  detail: string
}

// Show "שי כ." rather than the full name of someone who hasn't consented to
// having their name shown to another member.
function initialise(fullName: string): string {
  const [first, ...rest] = fullName.trim().split(/\s+/)
  return rest.length ? `${first} ${rest[rest.length - 1][0]}.` : first
}

/**
 * People this member invited, with how far each one has got.
 *
 * Status comes from the referred member's own ledger: a referral_subscribed
 * row means they bought a plan, referral_trial means they've attended, and
 * neither means they're still pending.
 */
export async function getReferrals(memberId: string): Promise<ReferralRow[]> {
  if (memberId === 'demo') return []

  try {
    const db = createServiceClient()

    const { data: invited } = await db
      .from('members')
      .select('id, name, created_at')
      .eq('referred_by', memberId)
      .order('created_at', { ascending: false }) as {
        data: { id: string; name: string; created_at: string }[] | null
      }

    if (!invited || invited.length === 0) return []

    const { data: ledger } = await db
      .from('point_ledger')
      .select('member_id, reason, points')
      .in('member_id', invited.map(m => m.id))
      .in('reason', ['referral_trial', 'referral_subscribed']) as {
        data: { member_id: string; reason: string; points: number }[] | null
      }

    const byMember = new Map<string, { trial: number; subscribed: number }>()
    for (const row of ledger ?? []) {
      const e = byMember.get(row.member_id) ?? { trial: 0, subscribed: 0 }
      if (row.reason === 'referral_trial') e.trial = row.points
      else e.subscribed = row.points
      byMember.set(row.member_id, e)
    }

    return invited.map(m => {
      const e = byMember.get(m.id) ?? { trial: 0, subscribed: 0 }
      // What this member earned is the mirror of what the friend earned.
      const coins = e.trial + e.subscribed
      if (e.subscribed) {
        return { name: initialise(m.name), status: 'subscribed' as const, coins, detail: 'רכש/ה מנוי! שניכם קיבלתם' }
      }
      if (e.trial) {
        return { name: initialise(m.name), status: 'trial' as const, coins, detail: 'הגיע/ה לשיעור ניסיון' }
      }
      return { name: initialise(m.name), status: 'pending' as const, coins: 0, detail: 'ממתין לשיעור ניסיון...' }
    })
  } catch {
    return []
  }
}
