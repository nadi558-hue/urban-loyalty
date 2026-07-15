import { getCurrentMember, DEMO_MEMBER, memberSinceLabel } from '@/lib/member'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { isAdminPhone } from '@/lib/admin'
import Link from 'next/link'

const TIER_LABELS: Record<string, string> = { silver: 'SILVER', gold: 'GOLD', platinum: 'PLATINUM' }

export default async function ProfilePage() {
  const member = (await getCurrentMember()) ?? DEMO_MEMBER

  let isAdmin = false
  try {
    const authClient = await createSupabaseServerClient()
    const { data: { user } } = await authClient.auth.getUser()
    isAdmin = isAdminPhone(user?.phone)
  } catch { /* not configured / not signed in */ }
  const rows = [
    { label: 'טלפון', value: member.phone },
    { label: 'סניף מועדף', value: member.preferred_branch ?? '—' },
    { label: 'רמת מועדון', value: TIER_LABELS[member.tier] ?? member.tier },
    { label: 'חבר/ה מאז', value: memberSinceLabel(member.created_at) },
  ]

  return (
    <main className="max-w-md mx-auto" style={{ minHeight: '100dvh', background: '#d9d3c7' }}>

      {/* Dark header */}
      <div style={{
        background: 'linear-gradient(180deg,#3a342d 0%,#1c1917 100%)',
        padding: '24px 20px 28px', textAlign: 'center',
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%', margin: '0 auto 10px',
          background: 'linear-gradient(135deg,#e8cc88,#c4a05a)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontFamily: 'var(--font-frank,serif)', fontSize: 28, fontWeight: 700, color: '#1c1917' }}>
            {member.name[0]}
          </span>
        </div>
        <p style={{ fontFamily: 'var(--font-frank,serif)', fontSize: 24, fontWeight: 700, color: '#f5f0e8' }}>{member.name}</p>
      </div>

      {/* Details card */}
      <div style={{ padding: '20px 16px 0' }}>
        <div style={{ background: '#ffffff', borderRadius: 18, overflow: 'hidden', border: '1px solid rgba(196,160,90,0.2)' }}>
          {rows.map((r, i) => (
            <div key={r.label} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '14px 18px',
              borderBottom: i < rows.length - 1 ? '1px solid #f0ebe2' : undefined,
            }}>
              <span style={{ fontSize: 13, color: '#94897e', fontFamily: 'var(--font-assistant,sans-serif)' }}>{r.label}</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#1c1917', fontFamily: 'var(--font-assistant,sans-serif)' }}>{r.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div style={{ padding: '16px 16px 0' }}>
        <div style={{ background: '#ffffff', borderRadius: 18, overflow: 'hidden', border: '1px solid rgba(196,160,90,0.2)' }}>
          {['התראות ותזכורות', 'תקנון ותנאי שימוש', 'יצירת קשר עם הסטודיו'].map((label, i) => (
            <div key={label} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '14px 18px',
              borderBottom: i < 2 ? '1px solid #f0ebe2' : undefined,
            }}>
              <span style={{ fontSize: 14, color: '#1c1917', fontFamily: 'var(--font-assistant,sans-serif)' }}>{label}</span>
              <span style={{ color: '#c4a05a' }}>‹</span>
            </div>
          ))}
        </div>
      </div>

      {/* Admin-only link */}
      {isAdmin && (
        <div style={{ padding: '16px 16px 0' }}>
          <Link href="/admin" style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '15px 18px', borderRadius: 18, textDecoration: 'none',
            background: 'linear-gradient(135deg,#3a342d,#1c1917)',
            border: '1px solid rgba(196,160,90,0.45)',
          }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#e8cc88', fontFamily: 'var(--font-assistant,sans-serif)' }}>
              🛠️ ניהול מועדון
            </span>
            <span style={{ color: '#c4a05a' }}>‹</span>
          </Link>
        </div>
      )}

      <div style={{ height: 100 }} />
    </main>
  )
}
