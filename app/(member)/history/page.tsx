const REASON_LABELS: Record<string, string> = {
  class_attended:       'שיעור הושלם',
  streak_10:            'בונוס רצף 10 שיעורים',
  full_month:           'בונוס נוכחות מלאה',
  referral_subscribed:  'הפניית חבר',
  birthday:             'מתנת יום הולדת',
  anniversary:          'מתנת שנה',
  manual:               'הוספה ידנית',
  redemption:           'מימוש הטבה',
  late_cancel:          'ביטול מאוחר · רצף אופס',
}

const DEMO_LEDGER = [
  { id: '1', reason: 'full_month',     points: 100, created_at: new Date(Date.now() - 2 * 86400000).toISOString(), metadata: null },
  { id: '2', reason: 'class_attended', points: 10,  created_at: new Date(Date.now() - 1 * 86400000).toISOString(), metadata: { class_name: 'Reformer – סוקולוב' } },
  { id: '3', reason: 'class_attended', points: 10,  created_at: new Date().toISOString(), metadata: { class_name: 'Mat Pilates – יעקב כהן' } },
  { id: '4', reason: 'streak_10',      points: 50,  created_at: new Date(Date.now() - 5 * 86400000).toISOString(), metadata: null },
  { id: '5', reason: 'redemption',     points: -300, created_at: new Date(Date.now() - 10 * 86400000).toISOString(), metadata: { note: 'מימוש: כרטיסייה לחברי מועדון' } },
]

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('he-IL', { day: 'numeric', month: 'long' })
}

export default async function HistoryPage() {
  const earned = DEMO_LEDGER.filter(e => e.points > 0).reduce((s, e) => s + e.points, 0)
  const redeemed = DEMO_LEDGER.filter(e => e.points < 0).reduce((s, e) => s - e.points, 0)

  return (
    <main className="max-w-md mx-auto" style={{ minHeight: '100dvh' }}>

      {/* ── Full-bleed hero ─────────────────────── */}
      <div style={{
        position: 'relative', height: 230, overflow: 'hidden',
        background: 'linear-gradient(120deg,#EFE2D8 0%,#E4D0C3 52%,#D8BCA9 100%)',
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/figure-stretch.png" alt="" aria-hidden
          style={{
            position: 'absolute', bottom: 0, left: -12, height: 226, pointerEvents: 'none', zIndex: 1,
            filter: 'drop-shadow(0 12px 22px rgba(59,46,39,.20))',
            WebkitMaskImage: 'linear-gradient(90deg,#000 0%,#000 46%,transparent 76%)',
            maskImage: 'linear-gradient(90deg,#000 0%,#000 46%,transparent 76%)',
          }}
        />
        <div aria-hidden style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(130% 90% at 85% 18%, rgba(255,255,255,0.4), transparent 58%), linear-gradient(180deg, transparent 62%, rgba(241,233,227,0.5) 100%)',
        }} />
        <div style={{ position: 'relative', zIndex: 2, padding: '28px 22px', textAlign: 'right' }}>
          <p style={{ fontSize: 11, color: '#A66B43', letterSpacing: '0.28em', textTransform: 'uppercase', marginBottom: 6, fontFamily: 'Georgia, serif' }}>
            Urban Coins
          </p>
          <h1 style={{ fontFamily: 'var(--font-frank,serif)', fontSize: 38, fontWeight: 900, color: '#3B2E27', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            היסטוריה
          </h1>
        </div>
      </div>

      {/* ── Glass summary card (overlaps the hero) ── */}
      <div style={{
        position: 'relative', zIndex: 3, margin: '-42px 16px 0',
        background: 'rgba(251,244,238,0.55)',
        backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
        border: '1px solid rgba(255,255,255,0.6)', borderRadius: 24,
        boxShadow: '0 16px 40px -16px rgba(59,46,39,0.35)',
        padding: '14px 10px', display: 'flex', alignItems: 'stretch',
      }}>
        <div style={{ flex: 1, textAlign: 'center', borderLeft: '1px solid rgba(192,144,111,0.25)' }}>
          <p style={{ fontFamily: 'var(--font-frank,serif)', fontSize: 22, fontWeight: 900, color: '#3f8f5e', lineHeight: 1.1 }}>+{earned}</p>
          <p style={{ fontSize: 10.5, color: '#8B7A6C', marginTop: 3, fontFamily: 'var(--font-assistant,sans-serif)' }}>סה״כ צברת</p>
        </div>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-frank,serif)', fontSize: 22, fontWeight: 900, color: '#A66B43', lineHeight: 1.1 }}>{redeemed}</p>
          <p style={{ fontSize: 10.5, color: '#8B7A6C', marginTop: 3, fontFamily: 'var(--font-assistant,sans-serif)' }}>מימשת</p>
        </div>
      </div>

      {/* Ledger entries — newest first */}
      <div className="px-5 pt-5 pb-6 space-y-2.5">
        {[...DEMO_LEDGER]
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .map((entry) => {
          const positive = entry.points > 0
          return (
            <div key={entry.id} className="urban-card px-4 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-base shrink-0"
                  style={{
                    background: positive
                      ? 'rgba(192,144,111,0.15)'
                      : 'rgba(180,60,60,0.1)',
                  }}>
                  {positive ? '⭐' : '🔓'}
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--urban-dark)' }}>
                    {REASON_LABELS[entry.reason] ?? entry.reason}
                  </p>
                  {entry.metadata?.class_name && (
                    <p className="text-xs" style={{ color: 'var(--urban-muted)' }}>
                      {entry.metadata.class_name as string}
                    </p>
                  )}
                  {entry.metadata?.note && (
                    <p className="text-xs" style={{ color: 'var(--urban-muted)' }}>
                      {entry.metadata.note as string}
                    </p>
                  )}
                  <p className="text-xs" style={{ color: 'rgba(154,142,132,0.6)' }}>
                    {formatDate(entry.created_at)}
                  </p>
                </div>
              </div>
              <span className="text-sm font-black"
                style={{ color: positive ? 'var(--urban-gold)' : '#c04040' }}>
                {positive ? '+' : ''}{entry.points}
              </span>
            </div>
          )
        })}
      </div>
    </main>
  )
}
