import { createServiceClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

type Reward = {
  id: string
  name: string
  description: string
  cost_coins: number
  emoji: string
  active: boolean
}

async function getRewards(): Promise<Reward[]> {
  const db = createServiceClient()
  const { data } = await db
    .from('rewards')
    .select('id, name, description, cost_coins, emoji, active')
    .order('cost_coins', { ascending: true })
  return (data as Reward[]) ?? []
}

async function updateReward(formData: FormData) {
  'use server'
  const id = String(formData.get('id'))
  const cost = Number(formData.get('cost_coins'))
  const active = formData.get('active') === 'on'
  const db = createServiceClient()
  await db.from('rewards').update({ cost_coins: cost, active }).eq('id', id)
  revalidatePath('/admin/rewards')
}

async function addReward(formData: FormData) {
  'use server'
  const name = String(formData.get('name')).trim()
  const description = String(formData.get('description')).trim()
  const cost = Number(formData.get('cost_coins'))
  const emoji = String(formData.get('emoji')).trim() || '✨'
  if (!name || !cost) return
  const db = createServiceClient()
  await db.from('rewards').insert({ name, description, cost_coins: cost, emoji, reward_type: 'discount', active: true })
  revalidatePath('/admin/rewards')
}

const inputCls = 'w-full px-3 py-2 rounded-lg border border-[#E7DBD1] text-sm outline-none focus:border-[var(--urban-gold)]'

export default async function AdminRewardsPage() {
  const rewards = await getRewards()

  return (
    <main className="max-w-2xl mx-auto px-4 pt-8 pb-12" dir="rtl">
      <div className="mb-6">
        <Link href="/admin" className="text-sm text-gray-400 hover:underline">← חזרה למסך הבית</Link>
        <h1 className="text-2xl font-bold mt-1" style={{ color: 'var(--urban-dark)' }}>ניהול הטבות</h1>
      </div>

      {/* Existing rewards */}
      <div className="space-y-2.5 mb-8">
        {rewards.map((r) => (
          <form
            key={r.id}
            action={updateReward}
            className="bg-white rounded-2xl border border-[#E7DBD1] px-4 py-3.5"
            style={{ opacity: r.active ? 1 : 0.55 }}
          >
            <input type="hidden" name="id" value={r.id} />
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold" style={{ color: 'var(--urban-dark)' }}>
                  {r.emoji} {r.name}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{r.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-3">
              <label className="flex items-center gap-1.5 text-xs text-gray-500">
                מחיר (UC)
                <input
                  type="number"
                  name="cost_coins"
                  defaultValue={r.cost_coins}
                  min={1}
                  className="w-20 px-2 py-1 rounded-lg border border-[#E7DBD1] text-sm text-center outline-none"
                />
              </label>
              <label className="flex items-center gap-1.5 text-xs text-gray-500">
                <input type="checkbox" name="active" defaultChecked={r.active} className="w-4 h-4" />
                פעיל
              </label>
              <button type="submit" className="mr-auto px-4 py-1.5 rounded-lg text-xs font-bold text-white" style={{ background: 'var(--urban-dark)' }}>
                שמור
              </button>
            </div>
          </form>
        ))}
      </div>

      {/* Add new reward */}
      <form action={addReward} className="bg-[#FBF6F2] rounded-2xl border border-[#E7DBD1] p-4">
        <h2 className="font-bold text-sm mb-3" style={{ color: 'var(--urban-dark)' }}>+ הוסף הטבה חדשה</h2>
        <div className="space-y-2.5">
          <div className="flex gap-2">
            <input name="emoji" placeholder="✨" maxLength={2} className="w-14 text-center px-2 py-2 rounded-lg border border-[#E7DBD1] text-sm outline-none" />
            <input name="name" placeholder="שם ההטבה" required className={inputCls} />
          </div>
          <input name="description" placeholder="תיאור קצר" className={inputCls} />
          <input name="cost_coins" type="number" min={1} placeholder="מחיר ב-UC" required className={inputCls} />
          <button type="submit" className="w-full py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: 'var(--urban-gold)' }}>
            הוסף
          </button>
        </div>
      </form>
    </main>
  )
}
