import { createServiceClient } from '@/lib/supabase'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { grantWelcomeBonus } from '@/lib/bonuses'
import { attachReferrer } from '@/lib/referrals'

export type Member = {
  id: string
  name: string
  phone: string
  tier: 'silver' | 'gold' | 'platinum'
  total_coins: number
  lifetime_coins: number
  preferred_branch: string | null
  referral_code: string
  birth_date: string | null
  created_at: string
  current_streak: number
  longest_streak: number
  last_active_date: string | null
  streak_freezes: number
  streak_frozen_on: string | null
  preferred_coach: 'maya' | 'sara' | 'idan'
  gender: 'female' | 'male' | 'unspecified'
  qualifying_coins: number
  tier_reviewed_at: string | null
}

/** True when a real Supabase project is wired up, as opposed to local demo mode. */
export function supabaseConfigured(): boolean {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  return Boolean(key) && !key!.includes('placeholder')
}

/**
 * Does the signed-in phone belong to an actual member?
 *
 * Supabase will send an OTP to any phone number, so passing the login says
 * nothing about membership. Without this check the screens fall through to
 * DEMO_MEMBER and show a stranger a fabricated profile — someone else's name
 * and balance. Cheap on purpose: it selects one column and runs from the
 * member layout on every page.
 *
 * 'demo' means Supabase isn't configured at all, which is the only case where
 * DEMO_MEMBER is the right answer.
 */
export type MemberStatus = 'demo' | 'member' | 'not-a-member' | 'signed-out'

export async function getMemberStatus(): Promise<MemberStatus> {
  if (!supabaseConfigured()) return 'demo'
  try {
    const authClient = await createSupabaseServerClient()
    const { data: { user } } = await authClient.auth.getUser()
    if (!user?.phone) return 'signed-out'
    const db = createServiceClient()
    const { data } = await db.from('members').select('id').eq('phone', user.phone).maybeSingle()
    return data ? 'member' : 'not-a-member'
  } catch {
    // A lookup failure must not lock a real member out — the pages below
    // handle a missing member on their own.
    return 'member'
  }
}

// Demo fallback — used locally when Supabase isn't configured, so every
// screen shows the SAME person instead of drifting mock data.
export const DEMO_MEMBER: Member = {
  id: 'demo',
  name: 'מאיה לוי',
  phone: '050-1234567',
  tier: 'silver',
  total_coins: 47,
  lifetime_coins: 147,
  preferred_branch: 'סוקולוב',
  referral_code: 'URBAN6',
  birth_date: null,
  current_streak: 0,
  longest_streak: 0,
  last_active_date: null,
  streak_freezes: 0,
  streak_frozen_on: null,
  preferred_coach: 'maya',
  gender: 'unspecified',
  qualifying_coins: 147,
  tier_reviewed_at: null,
  created_at: '2026-01-15T00:00:00.000Z',
}

// Fetch the currently logged-in member. Returns null when Supabase isn't
// configured (local demo) so callers can fall back to DEMO_MEMBER.
export async function getCurrentMember(): Promise<Member | null> {
  if (!supabaseConfigured()) return null
  try {
    const authClient = await createSupabaseServerClient()
    const { data: { user } } = await authClient.auth.getUser()
    if (!user?.phone) return null
    const db = createServiceClient()
    const { data } = await db.from('members')
      .select('*')  // '*' rather than a column list: a member row is small, and
                    // naming columns means any not-yet-run migration fails the
                    // query and silently drops every member to DEMO_MEMBER.
      .eq('phone', user.phone)
      .single()
    const member = (data as Member) ?? null
    if (!member) return null

    // If they arrived through a friend's /join link, record who invited them.
    await attachReferrer(member.id)

    // First time this member opens the app — grant the joining bonus and
    // reflect it right away, so the balance on screen already includes it.
    const welcome = await grantWelcomeBonus(member.id)
    if (welcome) {
      return {
        ...member,
        total_coins: member.total_coins + welcome,
        lifetime_coins: member.lifetime_coins + welcome,
      }
    }
    return member
  } catch { return null }
}

const HE_MONTHS = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר']

export function memberSinceLabel(iso: string): string {
  const d = new Date(iso)
  return `${HE_MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

export function memberIdLabel(m: Member): string {
  // Short, stable display id derived from the member's UUID/referral.
  const base = m.id === 'demo' ? '2847' : m.id.replace(/\D/g, '').slice(0, 4).padStart(4, '0')
  return `URB-${base}`
}
