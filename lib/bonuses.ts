import { createServiceClient } from '@/lib/supabase'
import { awardPoints, getRules } from '@/lib/points'

type DatedMember = {
  id: string
  birth_date: string | null
  created_at: string
}

const sameDayAndMonth = (a: Date, b: Date) =>
  a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

/**
 * Award the once-a-year date bonuses: birthday and membership anniversary.
 *
 * Runs from the daily cron. Idempotency comes from point_ledger — a member who
 * already has an award with that reason in the current calendar year is skipped,
 * so re-running the cron on the same day is harmless.
 *
 * Note: birthdays only fire for members whose birth_date is populated. The Arbox
 * import does not supply it, so it must be collected in the app.
 */
export async function grantDateBonuses(): Promise<{ birthday: number; anniversary: number }> {
  const db = createServiceClient()
  const today = new Date()
  const yearStart = new Date(today.getFullYear(), 0, 1).toISOString()

  const [membersRes, ledgerRes] = await Promise.all([
    db.from('members').select('id, birth_date, created_at').limit(5000),
    db.from('point_ledger')
      .select('member_id, reason')
      .in('reason', ['birthday', 'anniversary'])
      .gte('created_at', yearStart),
  ])

  const members = (membersRes.data as DatedMember[] | null) ?? []
  const ledger = (ledgerRes.data as { member_id: string; reason: string }[] | null) ?? []

  // "<memberId>:<reason>" for everyone already paid this year.
  const paid = new Set(ledger.map(r => `${r.member_id}:${r.reason}`))

  const rules = await getRules()
  let birthday = 0
  let anniversary = 0

  for (const m of members) {
    if (m.birth_date && !paid.has(`${m.id}:birthday`)) {
      // Parse as plain Y-M-D; a DATE column has no timezone and Date() would
      // shift it a day in negative-offset zones.
      const [, mo, da] = m.birth_date.split('-').map(Number)
      if (mo === today.getMonth() + 1 && da === today.getDate()) {
        await awardPoints(m.id, rules['birthday'] ?? 50, 'birthday', { year: today.getFullYear() })
        birthday++
      }
    }

    if (!paid.has(`${m.id}:anniversary`)) {
      const joined = new Date(m.created_at)
      const years = today.getFullYear() - joined.getFullYear()
      // Only from the first anniversary onward — not the joining day itself.
      if (years >= 1 && sameDayAndMonth(joined, today)) {
        await awardPoints(m.id, rules['anniversary'] ?? 20, 'anniversary', { years })
        anniversary++
      }
    }
  }

  return { birthday, anniversary }
}

/**
 * Grant the one-time joining bonus.
 *
 * The flag is flipped with a conditional update (`welcome_bonus_given = false`
 * in the WHERE clause) and we only award when that update actually claimed a
 * row. Postgres locks the row for the update, so if two page loads race, exactly
 * one of them gets a row back and the bonus is granted once.
 *
 * Safe to call on every page load: after the first grant the update matches
 * nothing and this is a single cheap no-op query.
 */
export async function grantWelcomeBonus(memberId: string): Promise<number | null> {
  const db = createServiceClient()
  let claimedHere = false

  try {
    const { data: claimed } = await db
      .from('members')
      .update({ welcome_bonus_given: true })
      .eq('id', memberId)
      .eq('welcome_bonus_given', false)
      .select('id')

    if (!claimed || claimed.length === 0) return null
    claimedHere = true

    const rules = await getRules()
    const points = rules['welcome_bonus'] ?? 20
    await awardPoints(memberId, points, 'welcome_bonus')
    return points
  } catch {
    // The flag is committed before the award, so a failure here would
    // otherwise deny the bonus forever. Release the claim so the next page
    // load retries it.
    if (claimedHere) {
      try {
        await db.from('members').update({ welcome_bonus_given: false }).eq('id', memberId)
      } catch { /* nothing more we can do */ }
    }
    // Never let a bonus failure break page rendering.
    return null
  }
}
