'use client'

import { useEffect, useRef, useState } from 'react'

type Pending = { id: string; code: string; coins: number; member: string; reward: string; at: string }

const POLL_MS = 20_000

/**
 * Tells reception that someone is waiting, without anyone having to check.
 *
 * There is no push infrastructure in this project — the OneSignal app id is
 * empty, its REST key is a rejected v1 token, and the service worker has no
 * push handler — so this is not a phone notification. It is the kiosk screen,
 * already open on the desk and already polling, noticing on its own.
 *
 * Three signals, loudest first: a chime when a redemption id appears that
 * wasn't there before, a banner naming the member and the code, and a count on
 * the installed app's icon for staff who have it on a home screen.
 */
export default function PendingAlert() {
  const [rows, setRows] = useState<Pending[]>([])
  const [muted, setMuted] = useState(false)
  const seen = useRef<Set<string> | null>(null)

  useEffect(() => {
    let alive = true

    async function tick() {
      try {
        const res = await fetch('/api/admin/pending', { cache: 'no-store' })
        if (!res.ok || !alive) return
        const data = await res.json()
        const list: Pending[] = data.redemptions ?? []

        // The first poll establishes the baseline. Without this, opening the
        // kiosk on a backlog of old redemptions would chime for each of them.
        if (seen.current === null) {
          seen.current = new Set(list.map(r => r.id))
        } else {
          const fresh = list.filter(r => !seen.current!.has(r.id))
          if (fresh.length > 0) {
            fresh.forEach(r => seen.current!.add(r.id))
            chime()
          }
        }

        setRows(list)

        // Badging is unsupported on most desktop browsers and on iOS before
        // 16.4; where it is missing this simply does nothing.
        try {
          const n = list.length + (data.shares ?? 0)
          if ('setAppBadge' in navigator) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            n > 0 ? (navigator as any).setAppBadge(n) : (navigator as any).clearAppBadge()
          }
        } catch { /* badge is a nicety, never a failure */ }
      } catch { /* a dropped poll is not worth surfacing — the next one is 20s away */ }
    }

    tick()
    const t = setInterval(tick, POLL_MS)
    return () => { alive = false; clearInterval(t) }
  }, [])

  function chime() {
    if (muted) return
    try {
      // Synthesised rather than an audio file: no asset to ship, and nothing
      // to break if the file is missing. Two short rising notes.
      const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      const ctx = new Ctx()
      ;[0, 0.18].forEach((delay, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.value = i === 0 ? 660 : 880
        gain.gain.setValueAtTime(0.0001, ctx.currentTime + delay)
        gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + delay + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + 0.35)
        osc.connect(gain); gain.connect(ctx.destination)
        osc.start(ctx.currentTime + delay)
        osc.stop(ctx.currentTime + delay + 0.4)
      })
      setTimeout(() => ctx.close(), 1200)
    } catch { /* autoplay policy, or no audio device */ }
  }

  if (rows.length === 0) return null

  return (
    <div style={{
      // Sticky, not fixed: in the flow it reserves its own space instead of
      // covering the page heading, and still follows the desk staff down a
      // long list.
      position: 'sticky', top: 0, zIndex: 50,
      background: '#C0906F', color: '#2A211C',
      boxShadow: '0 6px 24px rgba(0,0,0,0.35)',
    }}>
      <div style={{
        maxWidth: 900, margin: '0 auto', padding: '12px 16px',
        display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
      }}>
        <span style={{
          background: '#2A211C', color: '#F6EFEA', borderRadius: 999,
          minWidth: 30, height: 30, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontWeight: 800, fontSize: 15, padding: '0 9px',
        }}>{rows.length}</span>

        <div style={{ flex: 1, minWidth: 200 }}>
          <p style={{ fontWeight: 800, fontSize: 15.5, lineHeight: 1.3 }}>
            {rows.length === 1 ? 'מימוש ממתין בדלפק' : `${rows.length} מימושים ממתינים`}
          </p>
          <p style={{ fontSize: 13.5, lineHeight: 1.4 }}>
            {rows[0].member} · {rows[0].reward} · קוד{' '}
            <span style={{ fontFamily: 'monospace', fontWeight: 700, letterSpacing: '.08em' }}>{rows[0].code}</span>
            {rows.length > 1 && ` ועוד ${rows.length - 1}`}
          </p>
        </div>

        <a href="/admin/redemptions" style={{
          background: '#2A211C', color: '#F6EFEA', textDecoration: 'none',
          borderRadius: 999, padding: '8px 16px', fontSize: 13.5, fontWeight: 700,
        }}>לטיפול</a>

        <button
          onClick={() => setMuted(m => !m)}
          aria-label={muted ? 'הפעלת צליל התראה' : 'השתקת צליל התראה'}
          style={{
            background: 'transparent', border: '1px solid rgba(42,33,28,0.35)',
            color: '#2A211C', borderRadius: 999, padding: '7px 12px',
            fontSize: 13, fontWeight: 700, cursor: 'pointer',
          }}
        >{muted ? 'צליל כבוי' : 'צליל פועל'}</button>
      </div>
    </div>
  )
}
