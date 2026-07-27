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

  const tierLabel = TIER_LABELS[member.tier] ?? member.tier
  const coinSrc =
    member.tier === 'platinum' ? '/assets/icons/coin-platinum.png'
    : member.tier === 'gold'   ? '/assets/icons/coin-gold.png'
    :                            '/assets/icons/coin-silver.png'
  const tierRing =
    member.tier === 'platinum' ? 'linear-gradient(135deg,#c0c0d8,#9a9ab8)'
    : member.tier === 'gold'   ? 'linear-gradient(135deg,#DBB89C,#C0906F)'
    :                            'linear-gradient(135deg,#D8CFC6,#B7A99C)'
  const stats = [
    { label: 'זמין למימוש', value: member.total_coins },
    { label: 'לכל החיים', value: member.lifetime_coins },
    { label: 'רמה', value: tierLabel },
  ]

  return (
    <main className="max-w-md mx-auto" style={{ minHeight: '100dvh', background: '#F1E9E3' }}>

      {/* ── Full-bleed hero ─────────────────────── */}
      <div style={{
        position: 'relative', overflow: 'hidden', padding: '32px 20px 58px', textAlign: 'center',
        background: 'linear-gradient(160deg,#EFE2D8 0%,#E4D0C3 55%,#D8BCA9 100%)',
      }}>
        <div aria-hidden style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(120% 80% at 50% 0%, rgba(255,255,255,0.42), transparent 60%), linear-gradient(180deg, transparent 60%, rgba(241,233,227,0.5) 100%)',
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Avatar with tier-colored ring */}
          <div style={{
            width: 94, height: 94, borderRadius: '50%', margin: '0 auto 12px', padding: 3,
            background: tierRing, boxShadow: '0 10px 24px -8px rgba(59,46,39,0.4)',
          }}>
            <div style={{
              width: '100%', height: '100%', borderRadius: '50%',
              background: 'linear-gradient(135deg,#DBB89C,#C0906F)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid rgba(255,255,255,0.7)',
            }}>
              <span style={{ fontFamily: 'var(--font-frank,serif)', fontSize: 36, fontWeight: 700, color: '#3B2E27' }}>
                {member.name[0]}
              </span>
            </div>
          </div>
          <p style={{ fontFamily: 'var(--font-frank,serif)', fontSize: 25, fontWeight: 700, color: '#3B2E27', marginBottom: 8 }}>{member.name}</p>
          {/* Tier chip */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px',
            borderRadius: 999, border: '1px solid rgba(255,255,255,0.5)',
            background: 'rgba(255,255,255,0.35)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={coinSrc} alt="" aria-hidden style={{ height: 22, width: 'auto', objectFit: 'contain' }} />
            <span style={{ fontFamily: 'var(--font-frank,serif)', fontSize: 12, color: '#A66B43', letterSpacing: '0.12em' }}>{tierLabel}</span>
          </div>
        </div>
      </div>

      {/* ── Clay stat card (overlaps the hero) ── */}
      <div className="clay" style={{
        position: 'relative', zIndex: 3, margin: '-42px 16px 0',
        padding: '14px 10px', display: 'flex', alignItems: 'stretch',
      }}>
        {stats.map((s, i) => (
          <div key={s.label} style={{
            flex: 1, textAlign: 'center',
            borderLeft: i < stats.length - 1 ? '1px solid rgba(192,144,111,0.25)' : undefined,
          }}>
            <p style={{ fontFamily: 'var(--font-frank,serif)', fontSize: 22, fontWeight: 900, color: '#3B2E27', lineHeight: 1.1 }}>{s.value}</p>
            <p style={{ fontSize: 10.5, color: '#8B7A6C', marginTop: 3, fontFamily: 'var(--font-assistant,sans-serif)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Details card */}
      <div style={{ padding: '20px 16px 0' }}>
        <div className="clay-sm" style={{ overflow: 'hidden' }}>
          {rows.map((r, i) => (
            <div key={r.label} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '14px 18px',
              borderBottom: i < rows.length - 1 ? '1px solid #F3EAE3' : undefined,
            }}>
              <span style={{ fontSize: 13, color: '#9C8B7F', fontFamily: 'var(--font-assistant,sans-serif)' }}>{r.label}</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#3B2E27', fontFamily: 'var(--font-assistant,sans-serif)' }}>{r.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div style={{ padding: '16px 16px 0' }}>
        <div className="clay-sm" style={{ overflow: 'hidden' }}>
          {['התראות ותזכורות', 'תקנון ותנאי שימוש', 'יצירת קשר עם הסטודיו'].map((label, i) => (
            <div key={label} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '14px 18px',
              borderBottom: i < 2 ? '1px solid #F3EAE3' : undefined,
            }}>
              <span style={{ fontSize: 14, color: '#3B2E27', fontFamily: 'var(--font-assistant,sans-serif)' }}>{label}</span>
              <span style={{ color: '#C0906F' }}>‹</span>
            </div>
          ))}
        </div>
      </div>

      {/* Admin-only link */}
      {isAdmin && (
        <div style={{ padding: '16px 16px 0' }}>
          <Link href="/admin" style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '15px 18px', borderRadius: 20, textDecoration: 'none',
            background: 'linear-gradient(135deg,#5A473C,#3B2E27)',
            boxShadow: [
              '0 12px 24px -14px rgba(59,46,39,0.7)',
              'inset 0 4px 8px -4px rgba(219,184,156,0.45)',
              'inset 0 -5px 10px -6px rgba(0,0,0,0.5)',
            ].join(','),
          }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#DBB89C', fontFamily: 'var(--font-assistant,sans-serif)' }}>
              🛠️ ניהול מועדון
            </span>
            <span style={{ color: '#C0906F' }}>‹</span>
          </Link>
        </div>
      )}

      <div style={{ height: 100 }} />
    </main>
  )
}
