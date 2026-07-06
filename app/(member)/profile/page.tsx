const DEMO = {
  name: 'מאיה לוי',
  phone: '050-1234567',
  branch: 'סוקולוב',
  tier: 'SILVER',
  memberSince: 'ינואר 2026',
}

const ROWS = [
  { label: 'טלפון', value: DEMO.phone },
  { label: 'סניף מועדף', value: DEMO.branch },
  { label: 'רמת מועדון', value: DEMO.tier },
  { label: 'חבר/ה מאז', value: DEMO.memberSince },
]

export default function ProfilePage() {
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
            {DEMO.name[0]}
          </span>
        </div>
        <p style={{ fontFamily: 'var(--font-frank,serif)', fontSize: 24, fontWeight: 700, color: '#f5f0e8' }}>{DEMO.name}</p>
      </div>

      {/* Details card */}
      <div style={{ padding: '20px 16px 0' }}>
        <div style={{ background: '#ffffff', borderRadius: 18, overflow: 'hidden', border: '1px solid rgba(196,160,90,0.2)' }}>
          {ROWS.map((r, i) => (
            <div key={r.label} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '14px 18px',
              borderBottom: i < ROWS.length - 1 ? '1px solid #f0ebe2' : undefined,
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

      <div style={{ height: 100 }} />
    </main>
  )
}
