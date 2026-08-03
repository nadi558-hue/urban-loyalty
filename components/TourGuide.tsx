'use client'

import { useCallback, useEffect, useLayoutEffect, useState } from 'react'

export const TOUR_KEY = 'urban-tour-v1'
/** Fired by the profile row to replay the tour on demand. */
export const TOUR_REPLAY_EVENT = 'urban:tour:replay'

type Step = {
  /** Matches data-tour="…". A step whose target is missing is skipped. */
  target: string
  title: string
  body: string
  /** Where the bubble sits relative to the target. */
  place?: 'above' | 'below'
}

const STEPS: Step[] = [
  {
    target: 'status',
    title: 'המטבעות והדרגה שלך',
    body: 'כל שיעור שאת/ה משלימ/ה מזכה במטבעות. ככל שנצברים יותר — עולים דרגה ונפתחות הטבות טובות יותר.',
    place: 'below',
  },
  {
    target: 'balance',
    title: 'מה זמין לך עכשיו',
    body: 'זו היתרה שאפשר לממש כבר עכשיו. מימוש הטבה מוריד מהיתרה — אבל לא מוריד את הדרגה.',
    place: 'below',
  },
  {
    target: 'qr',
    title: 'צ׳ק-אין לשיעור',
    body: 'בכניסה לסטודיו סורקים כאן את הקוד. בלי הסריקה השיעור לא מזכה במטבעות.',
    place: 'above',
  },
  {
    target: 'rewards',
    title: 'ההטבות',
    body: 'כאן ממירים מטבעות להטבות — שריון מקום מראש, הנחות ועוד.',
    place: 'above',
  },
  {
    target: 'profile',
    title: 'הפרופיל שלך',
    body: 'כאן מוסיפים את האפליקציה למסך הבית, בוחרים מאמן/ת, ומוצאים עזרה ותשובות.',
    place: 'above',
  },
]

type Box = { top: number; left: number; width: number; height: number }

export default function TourGuide() {
  const [active, setActive] = useState(false)
  const [i, setI] = useState(0)
  const [box, setBox] = useState<Box | null>(null)

  // First visit only. Reading localStorage in an effect (not during render)
  // keeps the server and first client render identical.
  useEffect(() => {
    try { if (!localStorage.getItem(TOUR_KEY)) setActive(true) } catch { /* storage blocked */ }
    const replay = () => { setI(0); setActive(true) }
    window.addEventListener(TOUR_REPLAY_EVENT, replay)
    return () => window.removeEventListener(TOUR_REPLAY_EVENT, replay)
  }, [])

  const step = STEPS[i]

  const measure = useCallback(() => {
    if (!step) return
    const el = document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`)
    if (!el) { setBox(null); return }
    const r = el.getBoundingClientRect()
    setBox({ top: r.top, left: r.left, width: r.width, height: r.height })
  }, [step])

  useLayoutEffect(() => {
    if (!active) return
    // Bring the target into view first, then measure once it has settled.
    const el = step && document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`)
    if (el) el.scrollIntoView({ block: 'center', behavior: 'smooth' })
    const t = setTimeout(measure, 380)
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, { passive: true })
    return () => {
      clearTimeout(t)
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure)
    }
  }, [active, i, measure, step])

  // Don't let the page scroll behind the overlay.
  useEffect(() => {
    if (!active) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [active])

  if (!active || !step) return null

  const finish = () => {
    try { localStorage.setItem(TOUR_KEY, '1') } catch { /* storage blocked */ }
    setActive(false)
    setI(0)
  }
  const next = () => (i === STEPS.length - 1 ? finish() : setI(i + 1))

  const pad = 8
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800
  // Fall back to a centred bubble when the target isn't on this screen.
  const below = box ? (step.place === 'above' ? false : true) : true
  const bubbleTop = box
    ? below
      ? Math.min(box.top + box.height + pad + 6, vh - 210)
      : Math.max(12, box.top - pad - 190)
    : vh / 2 - 100

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="הסבר על האפליקציה"
      style={{ position: 'fixed', inset: 0, zIndex: 200 }}
      onClick={next}
    >
      {/* Dim everything, then punch a hole over the target with a huge spread
          shadow — cheaper and sharper than four separate overlay rectangles. */}
      {box ? (
        <div style={{
          position: 'fixed',
          top: box.top - pad, left: box.left - pad,
          width: box.width + pad * 2, height: box.height + pad * 2,
          borderRadius: 18,
          boxShadow: '0 0 0 9999px rgba(32,24,19,0.76)',
          border: '2px solid #DBB89C',
          pointerEvents: 'none',
          transition: 'top 220ms ease, left 220ms ease, width 220ms ease, height 220ms ease',
        }} />
      ) : (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(32,24,19,0.76)' }} />
      )}

      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'fixed', top: bubbleTop, left: '50%', transform: 'translateX(-50%)',
          width: 'min(340px, calc(100vw - 32px))',
          background: '#FBF6F2', borderRadius: 20, padding: '16px 18px 14px',
          boxShadow: '0 18px 40px rgba(0,0,0,0.4)',
          fontFamily: 'var(--font-assistant,sans-serif)',
        }}
      >
        <div style={{ display: 'flex', gap: 5, marginBottom: 10 }}>
          {STEPS.map((_, n) => (
            <span key={n} style={{
              height: 3, flex: 1, borderRadius: 999,
              background: n <= i ? '#C0906F' : 'rgba(192,144,111,0.25)',
            }} />
          ))}
        </div>

        <p style={{ fontFamily: 'var(--font-frank,serif)', fontSize: 18, fontWeight: 700, color: '#3B2E27', marginBottom: 5 }}>
          {step.title}
        </p>
        <p style={{ fontSize: 13.5, lineHeight: 1.6, color: '#6F625A', marginBottom: 14 }}>
          {step.body}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={finish} style={{
            border: 'none', background: 'transparent', cursor: 'pointer',
            fontSize: 13, color: '#9C8B7F', padding: '6px 2px',
          }}>
            דלג
          </button>
          <span style={{ flex: 1 }} />
          <span style={{ fontSize: 12.5, color: '#B3A597' }}>{i + 1}/{STEPS.length}</span>
          <button onClick={next} className="clay-btn" style={{
            padding: '10px 22px', fontSize: 14, fontWeight: 800, cursor: 'pointer',
          }}>
            {i === STEPS.length - 1 ? 'סיימנו!' : 'הבא'}
          </button>
        </div>
      </div>
    </div>
  )
}
