import { Star1, ReceiptDiscount } from 'iconsax-reactjs'
import { getCurrentMember, DEMO_MEMBER } from '@/lib/member'
import { getLedger, reasonLabel } from '@/lib/ledger'

export const dynamic = 'force-dynamic'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('he-IL', { day: 'numeric', month: 'long' })
}

export default async function HistoryPage() {
  const member = (await getCurrentMember()) ?? DEMO_MEMBER
  const ledger = await getLedger(member.id)

  const earned = ledger.filter(e => e.points > 0).reduce((s, e) => s + e.points, 0)
  const redeemed = ledger.filter(e => e.points < 0).reduce((s, e) => s - e.points, 0)

  return (
    <main className="max-w-md mx-auto" style={{ minHeight: '100dvh' }}>

      {/* ── Full-bleed photo hero ───────────────── */}
      <div style={{ position: 'relative', height: 250, overflow: 'hidden' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/history-handstand.jpg" alt="" aria-hidden
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center 30%', pointerEvents: 'none',
          }}
        />
        {/* Warm scrim: darker at top for the title, fades into the glass card */}
        <div aria-hidden style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(180deg, rgba(59,46,39,0.38) 0%, rgba(59,46,39,0.06) 32%, rgba(59,46,39,0) 52%, rgba(241,233,227,0.55) 84%, #F1E9E3 100%)',
        }} />
        <div style={{ position: 'relative', zIndex: 2, padding: '28px 22px', textAlign: 'right', textShadow: '0 1px 10px rgba(30,20,14,0.45)' }}>
          <p style={{ fontSize: 11, color: 'rgba(219,184,156,0.95)', letterSpacing: '0.28em', textTransform: 'uppercase', marginBottom: 6, fontFamily: 'Georgia, serif' }}>
            Urban Coins
          </p>
          <h1 style={{ fontFamily: 'var(--font-frank,serif)', fontSize: 38, fontWeight: 900, color: '#FBF6F2', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            היסטוריה
          </h1>
        </div>
      </div>

      {/* ── Clay summary card (overlaps the hero) ── */}
      <div className="clay" style={{
        position: 'relative', zIndex: 3, margin: '-42px 16px 0',
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

      {/* Ledger entries — already newest first from the query */}
      <div className="px-5 pt-5 pb-6 space-y-2.5">
        {ledger.length === 0 && (
          <div className="clay-sm" style={{ padding: '28px 20px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-frank,serif)', fontSize: 16, fontWeight: 700, color: '#3B2E27', marginBottom: 6 }}>
              עדיין אין תנועות
            </p>
            <p style={{ fontSize: 12.5, color: '#9C8B7F', lineHeight: 1.5, fontFamily: 'var(--font-assistant,sans-serif)' }}>
              כל שיעור, בונוס ומימוש יופיעו כאן ברגע שייקלטו.
            </p>
          </div>
        )}
        {ledger.map((entry) => {
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
                  {positive
                    ? <Star1 size={20} variant="Bulk" color="#C0906F" />
                    : <ReceiptDiscount size={20} variant="Bulk" color="#B43C3C" />}
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--urban-dark)' }}>
                    {reasonLabel(entry.reason)}
                  </p>
                  {typeof entry.metadata?.class_name === 'string' && (
                    <p className="text-xs" style={{ color: 'var(--urban-muted)' }}>
                      {entry.metadata.class_name}
                    </p>
                  )}
                  {typeof entry.metadata?.note === 'string' && (
                    <p className="text-xs" style={{ color: 'var(--urban-muted)' }}>
                      {entry.metadata.note}
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
