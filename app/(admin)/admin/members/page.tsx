import { createServiceClient } from '@/lib/supabase'
import { TIER_LABELS } from '@/lib/points'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

type Member = {
  id: string
  name: string
  phone: string
  tier: string
  total_coins: number
  lifetime_coins: number
  preferred_branch: string | null
  created_at: string
}

const TIER_BADGE: Record<string, string> = { silver: '🥈', gold: '🥇', platinum: '💎' }

async function getMembers(): Promise<Member[]> {
  const db = createServiceClient()
  const { data } = await db
    .from('members')
    .select('id, name, phone, tier, total_coins, lifetime_coins, preferred_branch, created_at')
    .order('lifetime_coins', { ascending: false })
  return (data as Member[]) ?? []
}

export default async function AdminMembersPage() {
  const members = await getMembers()

  return (
    <main className="max-w-3xl mx-auto px-4 pt-8 pb-12" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/admin" className="text-sm text-gray-400 hover:underline">← חזרה לדשבורד</Link>
          <h1 className="text-2xl font-bold mt-1" style={{ color: 'var(--urban-dark)' }}>כל החברים</h1>
        </div>
        <span className="text-sm text-gray-400">{members.length} חברים</span>
      </div>

      {members.length === 0 ? (
        <p className="text-sm text-gray-400">אין חברים עדיין</p>
      ) : (
        <div className="bg-white rounded-2xl border border-[#e8e0d0] overflow-hidden">
          {members.map((m, i) => (
            <div
              key={m.id}
              className="flex items-center justify-between px-4 py-3"
              style={{ borderTop: i === 0 ? 'none' : '1px solid #f0eadc' }}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-lg shrink-0">{TIER_BADGE[m.tier] ?? '🥈'}</span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--urban-dark)' }}>{m.name}</p>
                  <p className="text-xs text-gray-400">
                    {m.phone}{m.preferred_branch ? ` · ${m.preferred_branch}` : ''} · {TIER_LABELS[m.tier] ?? m.tier}
                  </p>
                </div>
              </div>
              <div className="text-left shrink-0">
                <p className="text-sm font-bold" style={{ color: 'var(--urban-gold)' }}>{m.total_coins} UC</p>
                <p className="text-xs text-gray-400">{m.lifetime_coins} כל הזמנים</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
