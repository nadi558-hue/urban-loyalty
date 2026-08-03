'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Instagram } from 'iconsax-reactjs'
import type { ReferralRow } from './referrals-data'

export default function ReferralsClient({
  referralCode,
  referrals,
}: {
  referralCode: string
  referrals: ReferralRow[]
}) {
  const [copied, setCopied] = useState(false)
  const link = `https://club.urbanstudio.co.il/join?ref=${referralCode}`

  const refStats = [
    { label: 'הזמנות', value: referrals.length },
    { label: 'הצטרפו', value: referrals.filter(r => r.status !== 'pending').length },
    { label: 'UC הרווחת', value: referrals.reduce((s, r) => s + r.coins, 0) },
  ]

  async function copy() {
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <main className="max-w-md mx-auto" style={{ minHeight: '100dvh' }}>

      {/* ── Full-bleed hero ─────────────────────── */}
      <div style={{
        position: 'relative', height: 210, overflow: 'hidden',
        background: 'linear-gradient(120deg,#EFE2D8 0%,#E4D0C3 52%,#D8BCA9 100%)',
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/figure-reach.png" alt="" aria-hidden
          style={{
            position: 'absolute', bottom: 0, left: -10, height: 206, pointerEvents: 'none', zIndex: 1,
            filter: 'drop-shadow(0 12px 22px rgba(59,46,39,.20))',
            WebkitMaskImage: 'linear-gradient(90deg,#000 0%,#000 44%,transparent 74%)',
            maskImage: 'linear-gradient(90deg,#000 0%,#000 44%,transparent 74%)',
          }}
        />
        <div aria-hidden style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(130% 90% at 85% 18%, rgba(255,255,255,0.4), transparent 58%), linear-gradient(180deg, transparent 62%, rgba(241,233,227,0.5) 100%)',
        }} />
        <div style={{ position: 'relative', zIndex: 2, padding: '26px 22px', textAlign: 'right' }}>
          <p className="uppercase" style={{ fontSize: 12.5, letterSpacing: '0.28em', color: '#A66B43', marginBottom: 6, fontFamily: 'Georgia, serif' }}>
            The Booster
          </p>
          <h1 style={{ fontFamily: 'var(--font-frank,serif)', fontSize: 38, fontWeight: 900, color: '#3B2E27', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            הפניות
          </h1>
          <p style={{ fontSize: 14, marginTop: 4, color: '#7A6B60', fontFamily: 'var(--font-assistant,sans-serif)' }}>
            הפוך חברים לשגרירים של Urban
          </p>
        </div>
      </div>

      {/* ── Clay stat card (overlaps the hero) ── */}
      <div className="clay" style={{
        position: 'relative', zIndex: 3, margin: '-40px 16px 0',
        padding: '14px 10px', display: 'flex', alignItems: 'stretch',
      }}>
        {refStats.map((s, i) => (
          <div key={s.label} style={{
            flex: 1, textAlign: 'center',
            borderLeft: i < refStats.length - 1 ? '1px solid rgba(192,144,111,0.25)' : undefined,
          }}>
            <p style={{ fontFamily: 'var(--font-frank,serif)', fontSize: 22, fontWeight: 900, color: '#3B2E27', lineHeight: 1.1 }}>{s.value}</p>
            <p style={{ fontSize: 12, color: '#8B7A6C', marginTop: 3, fontFamily: 'var(--font-assistant,sans-serif)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Invite banner — light card with the illustration */}
      <div className="px-5 pt-5">
        <div className="clay-sm" style={{
          padding: '14px 18px',
          display: 'flex', alignItems: 'center', gap: 12, overflow: 'hidden',
        }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: 'var(--font-frank,serif)', fontSize: 18, fontWeight: 700, color: '#3B2E27', marginBottom: 4 }}>
              מזמינים חברה, מרוויחים יחד
            </p>
            <p style={{ fontSize: 13.5, lineHeight: 1.6, color: '#6F625A', fontFamily: 'var(--font-assistant,sans-serif)' }}>
              על כל חבר/ה שמצטרף/ת ורוכש/ת מנוי — שניכם מקבלים <strong style={{ color: '#96613F' }}>50 UC</strong>
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
              { step: '2', text: 'חברך מגיע לשיעור ניסיון → שניכם מקבלים 10 UC מיידי' },
              { step: '3', text: 'חברך רוכש מנוי → שניכם מקבלים עוד 40 UC בונוס!' },
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
            ההפניות שלך ({referrals.length})
          </p>
          {referrals.length === 0 && (
            <p className="text-sm py-3" style={{ color: 'var(--urban-muted)' }}>
              עוד לא הזמנת אף אחד — שתפו את הלינק והתחילו לצבור
            </p>
          )}
          <div className="space-y-2.5">
            {referrals.map((r, i) => (
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
            {' '}ושתף כאן – קבל 2 UC (פעם בחודש)
          </p>
          <Link href="/share"
            className="w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
            style={{
              background: 'linear-gradient(135deg, #5A473C 0%, #3B2E27 100%)',
              color: '#DBB89C',
              border: '1px solid rgba(192,144,111,0.25)',
            }}>
            <Instagram size={17} variant="Bulk" color="#DBB89C" />
            העלאת סטורי – קבלת 7 UC
          </Link>
        </div>

      </div>
    </main>
  )
}
