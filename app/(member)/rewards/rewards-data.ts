import { createServiceClient } from '@/lib/supabase'

export type IconKey = 'waitlist' | 'early' | 'discount' | 'single_class'

export type Reward = {
  id: string
  name: string
  description: string
  cost: number
  icon: IconKey
  minTier: 'silver' | 'gold' | 'platinum'
}

type RewardRow = {
  id: string
  name: string
  description: string
  cost_coins: number
  reward_type: string
  min_tier: string | null
}

/**
 * Pick the card icon from the reward's type. `priority` covers both the
 * waitlist bump and early booking, so the name disambiguates those two.
 */
function iconFor(row: Pick<RewardRow, 'reward_type' | 'name'>): IconKey {
  switch (row.reward_type) {
    case 'discount': return 'discount'
    case 'class':
    case 'workshop': return 'single_class'
    case 'priority': return /המתנה|הקפצה/.test(row.name) ? 'waitlist' : 'early'
    default: return 'discount'
  }
}

// Mirrors the seed in supabase/schema.sql. Used only when Supabase isn't
// configured (local demo), so the screen still renders something real-shaped.
const DEMO_REWARDS: Reward[] = [
  { id: 'demo-1', name: 'הקפצה בראש רשימת המתנה', description: 'קפיצה לראש רשימת ההמתנה בשיעור מלא', cost: 20, icon: 'waitlist', minTier: 'silver' },
  { id: 'demo-2', name: 'שריון מוקדם · שבוע מראש', description: 'פתיחת מערכת השעות שבוע לפני כולם', cost: 35, icon: 'early', minTier: 'silver' },
  { id: 'demo-3', name: '5% הנחה · חידוש מנוי או כרטיסייה', description: '5% הנחה על החידוש הבא (מנוי פעיל 3+ חודשים)', cost: 45, icon: 'discount', minTier: 'silver' },
  { id: 'demo-4', name: '10% הנחה · חידוש מנוי או כרטיסייה', description: '10% הנחה על החידוש הבא (מנוי פעיל 3+ חודשים)', cost: 90, icon: 'discount', minTier: 'silver' },
  { id: 'demo-5', name: 'שריון VIP · שבועיים מראש', description: 'פתיחת מערכת השעות שבועיים לפני כולם', cost: 110, icon: 'early', minTier: 'silver' },
  { id: 'demo-6', name: 'שיעור בודד מעבר למכסה', description: 'שיעור נוסף מעבר למכסת המנוי החודשי', cost: 120, icon: 'single_class', minTier: 'silver' },
]

/**
 * Active rewards, cheapest first. Falls back to the demo set when Supabase
 * isn't configured or the query fails, so the screen never renders empty
 * just because the environment is missing keys.
 */
export async function getRewards(): Promise<Reward[]> {
  if (
    !process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY.includes('placeholder')
  ) return DEMO_REWARDS

  try {
    const db = createServiceClient()
    const { data } = await db
      .from('rewards')
      .select('*')  // see lib/member.ts: a named column list breaks on an unrun migration
      .eq('active', true)
      .order('cost_coins', { ascending: true })

    const rows = (data as RewardRow[] | null) ?? []
    if (rows.length === 0) return DEMO_REWARDS

    return rows.map(r => ({
      id: r.id,
      name: r.name,
      description: r.description,
      cost: r.cost_coins,
      icon: iconFor(r),
      minTier: (r.min_tier ?? 'silver') as Reward['minTier'],
    }))
  } catch {
    return DEMO_REWARDS
  }
}
