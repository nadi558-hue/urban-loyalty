'use client'

import { TERMS_SECTIONS } from '@/lib/terms'

export default function TermsSheet({ onClose, onAgree }: { onClose: () => void; onAgree: () => void }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="max-w-md w-full"
        style={{
          background: '#2A211C', borderRadius: '24px 24px 0 0',
          maxHeight: '86dvh', display: 'flex', flexDirection: 'column',
          border: '1px solid rgba(192,144,111,0.2)', borderBottom: 'none',
        }}
      >
        <div style={{ padding: '14px 20px 10px', borderBottom: '1px solid rgba(192,144,111,0.15)' }}>
          <div style={{ width: 36, height: 4, borderRadius: 999, background: 'rgba(192,144,111,0.3)', margin: '0 auto 14px' }} />
          <p style={{ fontFamily: 'var(--font-frank,serif)', fontSize: 18, fontWeight: 700, color: '#F6EFEA', textAlign: 'center' }}>
            תקנון ותנאי שימוש
          </p>
          <p style={{ fontSize: 11, color: 'rgba(245,240,230,0.4)', textAlign: 'center', marginTop: 2 }}>
            מועדון לקוחות Urban Pilates
          </p>
        </div>

        <div style={{ overflowY: 'auto', padding: '16px 20px', flex: 1 }}>
          {TERMS_SECTIONS.map(sec => (
            <div key={sec.title} style={{ marginBottom: 18 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#DBB89C', marginBottom: 6, fontFamily: 'var(--font-assistant,sans-serif)' }}>
                {sec.title}
              </p>
              {sec.items.map((it, i) => (
                <p key={i} style={{ fontSize: 12.5, lineHeight: 1.7, color: 'rgba(245,240,230,0.65)', marginBottom: 6 }}>
                  {it}
                </p>
              ))}
            </div>
          ))}
        </div>

        <div style={{ padding: '14px 20px max(14px, env(safe-area-inset-bottom))', borderTop: '1px solid rgba(192,144,111,0.15)' }}>
          <button
            onClick={onAgree}
            className="w-full py-3.5 rounded-2xl font-bold text-sm"
            style={{ background: 'linear-gradient(135deg,#DBB89C,#C0906F)', color: '#3B2E27' }}
          >
            קראתי ואני מסכים/ה לתקנון
          </button>
          <button
            onClick={onClose}
            className="w-full text-xs py-2.5"
            style={{ color: 'rgba(245,240,230,0.35)' }}
          >
            סגור
          </button>
        </div>
      </div>
    </div>
  )
}
