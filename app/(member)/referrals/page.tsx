'use client'

import { useState } from 'react'

const DEMO_REFERRAL_CODE = 'URBAN8X'
const DEMO_REFERRALS = [
  { name: 'שי כ.', status: 'trial',      coins: 50,  detail: 'הגיע לשיעור ניסיון' },
  { name: 'ליאת מ.', status: 'subscribed', coins: 100, detail: 'רכשה מנוי! שניכם קיבלתם 50' },
  { name: 'דן א.',  status: 'pending',    coins: 0,   detail: 'ממתין לשיעור ניסיון...' },
]

export default function ReferralsPage() {
  const [copied, setCopied] = useState(false)
  const link = `https://club.urbanstudio.co.il/join?ref=${DEMO_REFERRAL_CODE}`

  async function copy() {
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <main className="max-w-md mx-auto" style={{ minHeight: '100dvh' }}>

      <div className="urban-header px-5 pt-10 pb-6 relative overflow-hidden">
        <div className="absolute -top-4 -right-4 w-32 h-32 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(192,144,111,0.2) 0%, transparent 70%)' }} />
        <p className="text-xs tracking-[0.28em] uppercase mb-2"
          style={{ color: '#A66B43', fontFamily: 'Georgia, serif' }}>
          The Booster
        </p>
        <h1 className="text-4xl font-black" style={{ color: '#3B2E27', letterSpacing: '-0.03em' }}>
          הפניות
        </h1>
        <p className="text-sm mt-1" style={{ color: '#9C8B7F' }}>
          הפוך חברים לשגרירים של Urban
        </p>
      </div>

      {/* Invite banner — light card with the illustration */}
      <div className="px-5 pt-5">
        <div style={{
          background: 'linear-gradient(135deg,#FBF6F2,#F3EAE3)',
          borderRadius: 20, padding: '14px 18px',
          border: '1px solid rgba(192,144,111,0.25)',
          display: 'flex', alignItems: 'center', gap: 12, overflow: 'hidden',
        }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: 'var(--font-frank,serif)', fontSize: 18, fontWeight: 700, color: '#3B2E27', marginBottom: 4 }}>
              מזמינים חברה, מרוויחים יחד
            </p>
            <p style={{ fontSize: 12.5, lineHeight: 1.6, color: '#6F625A', fontFamily: 'var(--font-assistant,sans-serif)' }}>
              על כל חבר/ה שמצטרף/ת ומתאמן/ת — שניכם מקבלים <strong style={{ color: '#96613F' }}>50 UC</strong>
            </p>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/icons/girls.png" alt="" aria-hidden
            style={{ width: 96, height: 96, objectFit: 'contain', flexShrink: 0 }} />
        </div>
      </div>

      <div className="px-5 pt-5 space-y-4">

        <div className="rounded-2xl p-5 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #5A473C 0%, #3B2E27 100%)',
            boxShadow: '0 4px 20px rgba(59,46,39,0.25)',
          }}>
          <div className="h-px w-full mb-4"
            style={{ background: 'linear-gradient(90deg, transparent, #C0906F, transparent)' }} />
          <p className="text-xs mb-1" style={{ color: 'rgba(232,204,136,0.45)', letterSpacing: '0.1em' }}>
            הלינק האישי שלך
          </p>
          <p className="text-sm font-mono mb-4 truncate" dir="ltr" style={{ color: 'rgba(245,240,230,0.6)' }}>
            {link}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={copy}
              className="py-2.5 rounded-xl text-sm font-bold transition-all"
              style={{
                background: copied ? '#4a8a50' : 'linear-gradient(90deg,#C0906F,#DBB89C)',
                color: copied ? 'white' : '#3B2E27',
              }}>
              {copied ? 'הועתק!' : 'העתק'}
            </button>
            <button
              className="py-2.5 rounded-xl text-sm font-bold"
              style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(245,240,230,0.85)', border: '1px solid rgba(255,255,255,0.12)' }}
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: 'Urban Studio', text: 'הצטרף למועדון Urban!', url: link })
                }
              }}>
              שתף
            </button>
          </div>
        </div>

        <div className="urban-card p-5">
          <p className="text-xs font-bold mb-4 tracking-[0.1em] uppercase" style={{ color: 'var(--urban-muted)' }}>
            איך זה עובד?
          </p>
          <div className="space-y-3">
            {[
              { step: '1', text: 'שלח לחבר את הלינק האישי שלך' },
              { step: '2', text: 'חברך מגיע לשיעור ניסיון → שניכם מקבלים 50 UC מיידי' },
              { step: '3', text: 'חברך רוכש מנוי → שניכם מקבלים עוד 50 UC בונוס!' },
            ].map(({ step, text }) => (
              <div key={step} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                  style={{ background: 'linear-gradient(135deg,#5A473C,#3B2E27)', color: '#DBB89C' }}>
                  {step}
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--urban-dark)' }}>{text}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs tracking-[0.18em] uppercase font-bold mb-3" style={{ color: 'var(--urban-muted)' }}>
            ההפניות שלך ({DEMO_REFERRALS.length})
          </p>
          <div className="space-y-2.5">
            {DEMO_REFERRALS.map((r, i) => (
              <div key={i} className="urban-card px-4 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{ background: 'rgba(192,144,111,0.15)', color: '#96613F' }}>
                    {r.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--urban-dark)' }}>{r.name}</p>
                    <p className="text-xs" style={{ color: 'var(--urban-muted)' }}>{r.detail}</p>
                  </div>
                </div>
                {r.coins > 0 && (
                  <span className="text-sm font-black" style={{ color: 'var(--urban-gold)' }}>+{r.coins}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="urban-card p-5 mb-2"
          style={{ border: '1.5px dashed rgba(192,144,111,0.35)' }}>
          <p className="text-sm font-bold mb-1" style={{ color: 'var(--urban-dark)' }}>
            Social Buzz – הרוויח מטבעות
          </p>
          <p className="text-xs mb-4" style={{ color: 'var(--urban-muted)' }}>
            צלם סטורי מהסטודיו, תייג את{' '}
            <a href="https://www.instagram.com/urban_studio_official/" target="_blank" rel="noopener noreferrer"
              style={{ color: '#96613F', fontWeight: 700 }}>
              @urban_studio_official
            </a>
            {' '}ושתף כאן – קבל 7 UC (פעם בשבוע)
          </p>
          <a href="https://www.instagram.com/urban_studio_official/" target="_blank" rel="noopener noreferrer"
            className="w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
            style={{
              background: 'linear-gradient(135deg, #5A473C 0%, #3B2E27 100%)',
              color: '#DBB89C',
              border: '1px solid rgba(192,144,111,0.25)',
            }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DBB89C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
            עקוב ותייג – קבל 7 UC
          </a>
        </div>

      </div>
    </main>
  )
}
