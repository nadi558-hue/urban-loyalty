import { createServiceClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

type Promoted = {
  id: string
  title: string
  branch: string | null
  schedule_label: string | null
  bonus_coins: number
  note: string | null
  active: boolean
}

async function getPromoted(): Promise<Promoted[]> {
  const db = createServiceClient()
  const { data } = await db
    .from('promoted_classes')
    .select('id, title, branch, schedule_label, bonus_coins, note, active')
    .order('active', { ascending: false })
    .order('created_at', { ascending: false })
  return (data as Promoted[]) ?? []
}

async function addPromoted(formData: FormData) {
  'use server'
  const title = String(formData.get('title')).trim()
  const branch = String(formData.get('branch')).trim() || null
  const schedule_label = String(formData.get('schedule_label')).trim() || null
  const bonus_coins = Number(formData.get('bonus_coins')) || 5
  const note = String(formData.get('note')).trim() || null
  if (!title) return
  const db = createServiceClient()
  await db.from('promoted_classes').insert({ title, branch, schedule_label, bonus_coins, note, active: true })
  revalidatePath('/admin/happy-hour')
}

async function toggleActive(formData: FormData) {
  'use server'
  const id = String(formData.get('id'))
  const active = formData.get('active') === 'true'
  const db = createServiceClient()
  await db.from('promoted_classes').update({ active: !active }).eq('id', id)
  revalidatePath('/admin/happy-hour')
}

async function deletePromoted(formData: FormData) {
  'use server'
  const id = String(formData.get('id'))
  const db = createServiceClient()
  await db.from('promoted_classes').delete().eq('id', id)
  revalidatePath('/admin/happy-hour')
}

const inputCls = 'w-full px-3 py-2 rounded-lg border border-[#E7DBD1] text-sm outline-none focus:border-[var(--urban-gold)]'

export default async function AdminHappyHourPage() {
  const items = await getPromoted()

  return (
    <main className="max-w-2xl mx-auto px-4 pt-8 pb-12" dir="rtl">
      <div className="mb-6">
        <Link href="/admin" className="text-sm text-gray-400 hover:underline">← חזרה לדשבורד</Link>
        <h1 className="text-2xl font-bold mt-1" style={{ color: 'var(--urban-dark)' }}>🔥 Happy Hour · שיעורים מקודמים</h1>
        <p className="text-sm text-gray-400 mt-1">בחר שיעורים לקידום — החברים יקבלו בונוס UC על נוכחות בהם</p>
      </div>

      {/* Existing promoted classes */}
      <div className="space-y-2.5 mb-8">
        {items.length === 0 ? (
          <p className="text-sm text-gray-400">אין שיעורים מקודמים כרגע — הוסף למטה 👇</p>
        ) : (
          items.map((it) => (
            <div
              key={it.id}
              className="bg-white rounded-2xl border border-[#E7DBD1] px-4 py-3.5"
              style={{ opacity: it.active ? 1 : 0.5 }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-bold" style={{ color: 'var(--urban-dark)' }}>
                    {it.title}
                    <span className="mr-2 text-xs font-bold px-2 py-0.5 rounded-full" style={{ color: '#A66B43', background: 'rgba(192,144,111,0.15)' }}>
                      +{it.bonus_coins} UC
                    </span>
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {[it.branch, it.schedule_label].filter(Boolean).join(' · ') || 'ללא פרטי זמן'}
                  </p>
                  {it.note && <p className="text-xs text-gray-400 mt-0.5">{it.note}</p>}
                </div>
                {it.active && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full shrink-0" style={{ color: '#3a8a3a', background: 'rgba(58,138,58,0.12)' }}>
                    פעיל
                  </span>
                )}
              </div>
              <div className="flex gap-2 mt-3">
                <form action={toggleActive} className="flex-1">
                  <input type="hidden" name="id" value={it.id} />
                  <input type="hidden" name="active" value={String(it.active)} />
                  <button type="submit" className="w-full py-2 rounded-xl text-xs font-bold" style={{ background: '#F3EAE3', color: 'var(--urban-dark)' }}>
                    {it.active ? 'השהה' : 'הפעל'}
                  </button>
                </form>
                <form action={deletePromoted} className="flex-1">
                  <input type="hidden" name="id" value={it.id} />
                  <button type="submit" className="w-full py-2 rounded-xl text-xs font-bold" style={{ background: '#F3EAE3', color: '#b04040' }}>
                    מחק
                  </button>
                </form>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add new promoted class */}
      <form action={addPromoted} className="bg-[#FBF6F2] rounded-2xl border border-[#E7DBD1] p-4">
        <h2 className="font-bold text-sm mb-3" style={{ color: 'var(--urban-dark)' }}>+ קדם שיעור חדש</h2>
        <div className="space-y-2.5">
          <input name="title" placeholder="שם השיעור (למשל Reformer)" required className={inputCls} />
          <div className="flex gap-2">
            <input name="branch" placeholder="סניף (סוקולוב / יעקב כהן / רמות)" className={inputCls} />
            <input name="schedule_label" placeholder="מתי (יום ג׳ 18:00)" className={inputCls} />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-500">
            בונוס UC
            <input name="bonus_coins" type="number" min={1} defaultValue={5} className="w-20 px-2 py-1.5 rounded-lg border border-[#E7DBD1] text-sm text-center outline-none" />
          </label>
          <input name="note" placeholder="הערה / סיבת הקידום (אופציונלי)" className={inputCls} />
          <button type="submit" className="w-full py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: 'var(--urban-gold)' }}>
            קדם שיעור
          </button>
        </div>
      </form>
    </main>
  )
}
