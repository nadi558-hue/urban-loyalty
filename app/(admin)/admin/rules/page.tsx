import { createServiceClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

type Rule = { id: string; key: string; points: number; description: string }

async function getRules(): Promise<Rule[]> {
  const db = createServiceClient()
  const { data } = await db.from('point_rules').select('id, key, points, description').order('points', { ascending: false })
  return (data as Rule[]) ?? []
}

async function updateRule(formData: FormData) {
  'use server'
  const id = String(formData.get('id'))
  const points = Number(formData.get('points'))
  const db = createServiceClient()
  await db.from('point_rules').update({ points }).eq('id', id)
  revalidatePath('/admin/rules')
}

export default async function AdminRulesPage() {
  const rules = await getRules()

  return (
    <main className="max-w-2xl mx-auto px-4 pt-8 pb-12" dir="rtl">
      <div className="mb-6">
        <Link href="/admin" className="text-sm text-gray-400 hover:underline">← חזרה למסך הבית</Link>
        <h1 className="text-2xl font-bold mt-1" style={{ color: 'var(--urban-dark)' }}>כללי נקודות</h1>
        <p className="text-sm text-gray-400 mt-1">כמה Urban Coins מזכה כל פעולה</p>
      </div>

      <div className="space-y-2.5">
        {rules.map((r) => (
          <form key={r.id} action={updateRule} className="bg-white rounded-2xl border border-[#E7DBD1] px-4 py-3.5 flex items-center justify-between gap-3">
            <input type="hidden" name="id" value={r.id} />
            <div className="min-w-0">
              <p className="text-sm font-semibold" style={{ color: 'var(--urban-dark)' }}>{r.description}</p>
              <p className="text-xs text-gray-400 font-mono mt-0.5">{r.key}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <input
                type="number"
                name="points"
                defaultValue={r.points}
                className="w-20 px-2 py-1.5 rounded-lg border border-[#E7DBD1] text-sm text-center outline-none focus:border-[var(--urban-gold)]"
              />
              <button type="submit" className="px-4 py-1.5 rounded-lg text-xs font-bold text-white" style={{ background: 'var(--urban-dark)' }}>
                שמור
              </button>
            </div>
          </form>
        ))}
      </div>
    </main>
  )
}
