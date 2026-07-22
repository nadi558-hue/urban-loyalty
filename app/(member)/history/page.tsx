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
  return (
    <main className="max-w-md mx-auto" style={{ minHeight: '100dvh' }}>

      {/* Light sand header */}
      <div className="urban-header px-5 pt-10 pb-6 relative overflow-hidden">
        <div className="absolute -top-4 -left-4 w-28 h-28 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(192,144,111,0.2) 0%, transparent 70%)' }} />
        <p className="text-xs tracking-[0.28em] uppercase mb-2"
          style={{ color: '#A66B43', fontFamily: 'Georgia, serif' }}>
          Urban Coins
        </p>
        <h1 className="text-4xl font-black" style={{ color: '#3B2E27', letterSpacing: '-0.03em' }}>
          היסטוריה
        </h1>
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
