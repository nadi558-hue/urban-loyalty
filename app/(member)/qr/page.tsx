import { getCurrentMember, DEMO_MEMBER, memberIdLabel } from '@/lib/member'

const TIER_LABELS: Record<string, string> = { silver: 'SILVER', gold: 'GOLD', platinum: 'PLATINUM' }

export default async function QrPage() {
  const member = (await getCurrentMember()) ?? DEMO_MEMBER
  const name = member.name
  const memberId = memberIdLabel(member)
  const tier = TIER_LABELS[member.tier] ?? member.tier

  return (
    <main className="max-w-md mx-auto" style={{ minHeight: '100dvh', background: '#d9d3c7' }}>

      {/* Dark header */}
      <div style={{
        background: 'linear-gradient(180deg,#3a342d 0%,#1c1917 100%)',
        padding: '24px 20px 28px', textAlign: 'center',
      }}>
        <p style={{ fontSize: 11, color: '#c4a05a', letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 6, fontFamily: 'var(--font-assistant,sans-serif)' }}>
          כרטיס חבר
        </p>
        <p style={{ fontFamily: 'var(--font-frank,serif)', fontSize: 26, fontWeight: 900, color: '#f5f0e8' }}>
          סרוק בכניסה
        </p>
      </div>

      {/* QR card */}
      <div style={{ padding: '24px 24px 0' }}>
        <div style={{
          background: '#ffffff', borderRadius: 24, padding: '28px 24px',
          border: '1px solid rgba(196,160,90,0.25)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          textAlign: 'center',
        }}>
          {/* QR placeholder — wired to real member QR after Supabase connect */}
          <div style={{
            width: 208, height: 208, margin: '0 auto 18px',
            borderRadius: 16, border: '2px dashed rgba(196,160,90,0.45)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
            background: '#faf7f0',
          }}>
            <span style={{ fontSize: 44, color: '#c4a05a' }}>▦</span>
            <p style={{ fontSize: 11, color: '#94897e', fontFamily: 'var(--font-assistant,sans-serif)', padding: '0 20px' }}>
              קוד ה-QR האישי יופעל עם חיבור המערכת
            </p>
          </div>
          <p style={{ fontFamily: 'var(--font-frank,serif)', fontSize: 20, fontWeight: 700, color: '#1c1917' }}>{name}</p>
          <p style={{ fontSize: 12, color: '#94897e', fontFamily: 'var(--font-assistant,sans-serif)', marginTop: 2 }}>
            {memberId} · {tier}
          </p>
        </div>
        <p style={{ textAlign: 'center', fontSize: 12, color: '#8a7c6a', marginTop: 16, fontFamily: 'var(--font-assistant,sans-serif)' }}>
          הצג את הקוד בדלפק הקבלה לצבירת UC על השיעור
        </p>
      </div>

      <div style={{ height: 100 }} />
    </main>
  )
}
