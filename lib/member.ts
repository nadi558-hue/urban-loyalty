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
  created_at: '2026-01-15T00:00:00.000Z',
}

// Fetch the currently logged-in member. Returns null when Supabase isn't
// configured (local demo) so callers can fall back to DEMO_MEMBER.
export async function getCurrentMember(): Promise<Member | null> {
  if (
    !process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY.includes('placeholder')
  ) return null
  try {
    const authClient = await createSupabaseServerClient()
    const { data: { user } } = await authClient.auth.getUser()
    if (!user?.phone) return null
    const db = createServiceClient()
    const { data } = await db.from('members')
      .select('id, name, phone, tier, total_coins, lifetime_coins, preferred_branch, referral_code, birth_date, created_at, current_streak')
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
