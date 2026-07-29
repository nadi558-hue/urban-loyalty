import { createServiceClient } from '@/lib/supabase'
import { awardPoints, getRules } from '@/lib/points'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

type Row = {
  id: string
  member_id: string
  image_url: string
  status: 'pending' | 'approved' | 'rejected'
  coins_awarded: number | null
  created_at: string
  members: { name: string } | null
}

async function getQueue(): Promise<Row[]> {
  try {
    const db = createServiceClient()
    const { data } = await db
      .from('social_shares')
      .select('id, member_id, image_url, status, coins_awarded, created_at, members(name)')
      .order('status', { ascending: true })
      .order('created_at', { ascending: false })
      .limit(60)
    return (data as unknown as Row[]) ?? []
  } catch {
    return []
  }
}

async function approve(formData: FormData) {
  'use server'
  const id = String(formData.get('id'))
  const db = createServiceClient()

  // Claim the row only while it is still pending, so a double submit (or two
  // admins clicking at once) can't award the coins twice.
  const { data: claimed } = await db
    .from('social_shares')
    .update({ status: 'approved', reviewed_at: new Date().toISOString() })
    .eq('id', id)
    .eq('status', 'pending')
    .select('member_id') as { data: { member_id: string }[] | null }

  const row = claimed?.[0]
  if (!row) return

  const points = (await getRules())['social_share'] ?? 2
  await awardPoints(row.member_id, points, 'social_share', { share_id: id })
  await db.from('social_shares').update({ coins_awarded: points }).eq('id', id)

  revalidatePath('/admin/shares')
}

async function reject(formData: FormData) {
  'use server'
  const id = String(formData.get('id'))
  const note = String(formData.get('note') || '').trim() || null
  const db = createServiceClient()
  await db
    .from('social_shares')
    .update({ status: 'rejected', note, reviewed_at: new Date().toISOString() })
    .eq('id', id)
    .eq('status', 'pending')
  revalidatePath('/admin/shares')
}

export default async function AdminSharesPage() {
  const rows = await getQueue()
  const pending = rows.filter(r => r.status === 'pending')
  const reviewed = rows.filter(r => r.status !== 'pending')

  return (
    <main style={{ padding: 20, maxWidth: 760, margin: '0 auto' }}>
      <Link href="/admin" style={{ fontSize: 13, color: '#96613F' }}>‹ חזרה לניהול</Link>
      <h1 style={{ fontFamily: 'var(--font-frank,serif)', fontSize: 26, fontWeight: 900, margin: '10px 0 4px' }}>
        שיתופי סטורי
      </h1>
      <p style={{ fontSize: 13, color: '#8B7A6C', marginBottom: 20 }}>
        {pending.length} ממתינים לאישור
      </p>

      {rows.length === 0 && (
        <p style={{ fontSize: 14, color: '#9C8B7F' }}>
          אין שיתופים עדיין. אם הרצת את המיגרציה זה תקין — הטבלה פשוט ריקה.
        </p>
      )}

      {pending.map(r => (
        <div key={r.id} className="urban-card" style={{ padding: 14, marginBottom: 12, display: 'flex', gap: 14 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={r.image_url} alt="" style={{ width: 110, height: 150, objectFit: 'cover', borderRadius: 12, flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontWeight: 700, marginBottom: 2 }}>{r.members?.name ?? '—'}</p>
            <p style={{ fontSize: 12, color: '#9C8B7F', marginBottom: 12 }}>
              {new Date(r.created_at).toLocaleString('he-IL')}
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <form action={approve}>
                <input type="hidden" name="id" value={r.id} />
                <button style={{
                  border: 'none', borderRadius: 999, padding: '8px 18px', cursor: 'pointer',
                  background: 'linear-gradient(135deg,#8FbF9f,#3f8f5e)', color: '#fff', fontWeight: 700, fontSize: 13,
                }}>אישור וזיכוי</button>
              </form>
              <form action={reject} style={{ display: 'flex', gap: 6 }}>
                <input type="hidden" name="id" value={r.id} />
                <input name="note" placeholder="סיבה (לא חובה)" style={{
                  border: '1px solid rgba(192,144,111,0.35)', borderRadius: 999,
                  padding: '7px 12px', fontSize: 13, width: 150,
                }} />
                <button style={{
                  border: '1px solid rgba(176,64,64,0.4)', borderRadius: 999, padding: '8px 16px',
                  cursor: 'pointer', background: 'transparent', color: '#b04040', fontWeight: 700, fontSize: 13,
                }}>דחייה</button>
              </form>
            </div>
          </div>
        </div>
      ))}

      {reviewed.length > 0 && (
        <>
          <h2 style={{ fontSize: 15, fontWeight: 700, margin: '26px 0 10px', color: '#6F625A' }}>טופלו</h2>
          {reviewed.map(r => (
            <div key={r.id} className="urban-card" style={{ padding: '10px 14px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={r.image_url} alt="" style={{ width: 38, height: 38, objectFit: 'cover', borderRadius: 8 }} />
              <span style={{ flex: 1, fontSize: 14 }}>{r.members?.name ?? '—'}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: r.status === 'approved' ? '#3f8f5e' : '#b04040' }}>
                {r.status === 'approved' ? `אושר · +${r.coins_awarded ?? 0} UC` : 'נדחה'}
              </span>
            </div>
          ))}
        </>
      )}
    </main>
  )
}
