import { createServiceClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'
import ConfirmButton from './ConfirmButton'

export const dynamic = 'force-dynamic'

type Redemption = {
  id: string
  coins_spent: number
  code: string
  status: 'pending' | 'used' | 'cancelled'
  created_at: string
  members: { name: string } | null
  rewards: { name: string } | null
}

const STATUS_LABEL: Record<string, string> = { pending: 'ממתין', used: 'מומש', cancelled: 'בוטל' }
const STATUS_COLOR: Record<string, string> = { pending: '#b8860b', used: '#3a8a3a', cancelled: '#b04040' }

async function getRedemptions(): Promise<Redemption[]> {
  const db = createServiceClient()
  const { data } = await db
    .from('redemptions')
    .select('id, coins_spent, code, status, created_at, members(name), rewards(name)')
    .order('created_at', { ascending: false })
  return (data as unknown as Redemption[]) ?? []
}

async function setStatus(formData: FormData) {
  'use server'
  const id = String(formData.get('id'))
  const status = String(formData.get('status'))
  const db = createServiceClient()

  // Refund the coins back to the member when cancelling (guard against double-refund)
  if (status === 'cancelled') {
    const { data: r } = await db
      .from('redemptions')
      .select('member_id, coins_spent, status')
      .eq('id', id)
      .single() as { data: { member_id: string; coins_spent: number; status: string } | null }
    if (r && r.status !== 'cancelled') {
      const { data: m } = await db
        .from('members')
        .select('total_coins')
        .eq('id', r.member_id)
        .single() as { data: { total_coins: number } | null }
      if (m) {
        await db.from('members').update({ total_coins: m.total_coins + r.coins_spent }).eq('id', r.member_id)
        await db.from('point_ledger').insert({
          member_id: r.member_id,
          points: r.coins_spent,
          reason: 'manual',
          metadata: { note: 'החזר על ביטול מימוש' },
        })
      }
    }
  }

  await db
    .from('redemptions')
    .update({ status, used_at: status === 'used' ? new Date().toISOString() : null })
    .eq('id', id)
  revalidatePath('/admin/redemptions')
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('he-IL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export default async function AdminRedemptionsPage() {
  const redemptions = await getRedemptions()
  const pending = redemptions.filter((r) => r.status === 'pending').length

  return (
    <main className="max-w-3xl mx-auto px-4 pt-8 pb-12" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/admin" className="text-sm text-gray-400 hover:underline">← חזרה לדשבורד</Link>
          <h1 className="text-2xl font-bold mt-1" style={{ color: 'var(--urban-dark)' }}>כל המימושים</h1>
        </div>
        <span className="text-sm text-gray-400">{pending} ממתינים · {redemptions.length} סה״כ</span>
      </div>

      {redemptions.length === 0 ? (
        <p className="text-sm text-gray-400">אין מימושים עדיין</p>
      ) : (
        <div className="space-y-2.5">
          {redemptions.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl border border-[#e8e0d0] px-4 py-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold" style={{ color: 'var(--urban-dark)' }}>
                    {r.rewards?.name ?? '—'}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {r.members?.name ?? '—'} · {r.coins_spent} UC · {formatDate(r.created_at)}
                  </p>
                  <p className="text-xs mt-1 font-mono tracking-wider" style={{ color: 'var(--urban-dark)' }}>
                    קוד: <span className="font-bold">{r.code}</span>
                  </p>
                </div>
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-full shrink-0"
                  style={{ color: STATUS_COLOR[r.status], background: `${STATUS_COLOR[r.status]}18` }}
                >
                  {STATUS_LABEL[r.status]}
                </span>
              </div>

              {r.status === 'pending' && (
                <div className="flex gap-2 mt-3">
                  <form action={setStatus} className="flex-1">
                    <input type="hidden" name="id" value={r.id} />
                    <input type="hidden" name="status" value="used" />
                    <button type="submit" className="w-full py-2 rounded-xl text-xs font-bold text-white" style={{ background: '#3a8a3a' }}>
                      סמן כמומש
                    </button>
                  </form>
                  <form action={setStatus} className="flex-1">
                    <input type="hidden" name="id" value={r.id} />
                    <input type="hidden" name="status" value="cancelled" />
                    <ConfirmButton
                      confirm={`לבטל את המימוש ולהחזיר ${r.coins_spent} UC ל${r.members?.name ?? 'חבר'}?`}
                      className="w-full py-2 rounded-xl text-xs font-bold"
                      style={{ background: '#f3ede0', color: '#b04040' }}
                    >
                      בטל + החזר UC
                    </ConfirmButton>
                  </form>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
