import { createServiceClient } from '@/lib/supabase'
import { getEligiblePlanMembers } from '@/lib/arbox'
import { payReferral } from '@/lib/referrals'

export type MemberSyncResult = {
  eligible: number
  inserted: number
  updated: number
  adopted: number
  referralsPaid: number
  errors: string | null
}

// Import active subscription holders from Arbox into `members`.
// Matching precedence: existing by arbox_id → existing by phone (adopt the real
// Arbox id onto that row) → insert new. This never duplicates a phone and keeps
// coins/tier/streak intact on existing members.
export async function syncPlanMembers(): Promise<MemberSyncResult> {
  const db = createServiceClient()
  let inserted = 0, updated = 0, adopted = 0, referralsPaid = 0
  let errors: string | null = null

  try {
    const eligible = await getEligiblePlanMembers()

    const { data: existing } = await db
      .from('members')
      .select('id, arbox_id, phone, referred_by') as {
        data: { id: string; arbox_id: string; phone: string; referred_by: string | null }[] | null
      }

    const byArbox = new Map((existing ?? []).map((m) => [m.arbox_id, m]))
    const byPhone = new Map((existing ?? []).map((m) => [m.phone, m]))

    for (const m of eligible) {
      const hitArbox = byArbox.get(m.arbox_id)
      const hitPhone = byPhone.get(m.phone)

      if (hitArbox) {
        await db.from('members')
          .update({ name: m.name, phone: m.phone, preferred_branch: m.branch })
          .eq('id', hitArbox.id)
        updated++
        // Appearing here means an active plan — the referral's second milestone.
        // Pays once; a member whose referrer isn't attached yet is picked up on
        // a later run, after they've opened the app.
        if (await payReferral(hitArbox, 'referral_subscribed')) referralsPaid++
      } else if (hitPhone) {
        // Same person already in DB (e.g. placeholder) — adopt the real Arbox id
        await db.from('members')
          .update({ arbox_id: m.arbox_id, name: m.name, preferred_branch: m.branch })
          .eq('id', hitPhone.id)
        adopted++
        byArbox.set(m.arbox_id, { ...hitPhone, arbox_id: m.arbox_id })
      } else {
        const { error } = await db.from('members').insert({
          arbox_id: m.arbox_id,
          name: m.name,
          phone: m.phone,
          preferred_branch: m.branch,
        })
        if (error) { errors = error.message; continue }
        inserted++
      }
    }

    return { eligible: eligible.length, inserted, updated, adopted, referralsPaid, errors }
  } catch (e) {
    return { eligible: 0, inserted, updated, adopted, referralsPaid, errors: e instanceof Error ? e.message : String(e) }
  }
}
