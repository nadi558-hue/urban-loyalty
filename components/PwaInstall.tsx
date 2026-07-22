'use client'

import { useEffect, useState } from 'react'

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }

const DISMISS_KEY = 'urban-a2hs-dismissed'

type Mode =
  | { kind: 'native'; ev: BIPEvent }   // Android/Chrome real install prompt available
  | { kind: 'ios' }                    // iOS Safari — manual Add to Home Screen
  | { kind: 'android-manual' }         // Android but no prompt fired — menu → Install app
  | { kind: 'inapp' }                  // in-app webview (WhatsApp/IG/FB) — can't install

export default function PwaInstall() {
  const [mode, setMode] = useState<Mode | null>(null)

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }

    // Already installed → never show
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as { standalone?: boolean }).standalone === true
    if (standalone) return
    if (localStorage.getItem(DISMISS_KEY)) return

    const ua = window.navigator.userAgent

    // In-app browsers (WhatsApp / Instagram / Facebook / Messenger / TikTok) cannot
    // install PWAs at all — the only fix is opening in the real browser.
    const isInApp = /FBAN|FBAV|Instagram|Line\/|Twitter|WhatsApp|; wv\)|GSA\//i.test(ua)

    const isIos = /iphone|ipad|ipod/i.test(ua)
    const isSafari = /safari/i.test(ua) && !/crios|fxios|edgios/i.test(ua)

    let bipFired = false
    const onBIP = (e: Event) => {
      e.preventDefault()
      bipFired = true
      setMode({ kind: 'native', ev: e as BIPEvent })
    }
    window.addEventListener('beforeinstallprompt', onBIP)

    // Decide the fallback after a short delay (gives beforeinstallprompt a chance to fire)
    const timer = setTimeout(() => {
      if (bipFired) return
      if (isInApp) { setMode({ kind: 'inapp' }); return }
      if (isIos && isSafari) { setMode({ kind: 'ios' }); return }
      // Android/desktop Chrome that didn't fire the event yet → show manual path
      if (/android/i.test(ua)) setMode({ kind: 'android-manual' })
    }, 2500)

    window.addEventListener('appinstalled', () => setMode(null))

    return () => {
      window.removeEventListener('beforeinstallprompt', onBIP)
      clearTimeout(timer)
    }
  }, [])

  if (!mode) return null

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1')
    setMode(null)
  }

  const install = async () => {
    if (mode.kind !== 'native') return
    await mode.ev.prompt()
    await mode.ev.userChoice
    setMode(null)
  }

  const title =
    mode.kind === 'inapp' ? 'פתחו בדפדפן להתקנה'
    : 'התקינו את אפליקציית Urban Club'

  const subtitle =
    mode.kind === 'native'        ? 'גישה מהירה מהמסך הבית — כמו אפליקציה'
    : mode.kind === 'ios'          ? 'הקישו על ⬆️ שיתוף ואז "הוסף למסך הבית"'
    : mode.kind === 'android-manual' ? 'תפריט ⋮ בכרום → "התקנת אפליקציה"'
    : /* inapp */                    'הקישו על ⋮ ואז "פתח בדפדפן" (Chrome), ושם התקינו'

  return (
    <div
      dir="rtl"
      style={{
        position: 'fixed', left: 12, right: 12, bottom: 12, zIndex: 60,
        maxWidth: 420, margin: '0 auto',
        background: 'linear-gradient(135deg,#5A473C,#3B2E27)',
        border: '1px solid rgba(192,144,111,0.45)', borderRadius: 18,
        boxShadow: '0 12px 40px rgba(0,0,0,0.4)', padding: '14px 16px',
        display: 'flex', alignItems: 'center', gap: 12,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/icons/icon-192.png" alt="" width={44} height={44}
        style={{ borderRadius: 10, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: '#F6EFEA', fontFamily: 'var(--font-assistant,sans-serif)' }}>
          {title}
        </p>
        <p style={{ fontSize: 12, color: '#B8A99B', marginTop: 2, fontFamily: 'var(--font-assistant,sans-serif)' }}>
          {subtitle}
        </p>
      </div>
      {mode.kind === 'native' && (
        <button onClick={install} style={{
          flexShrink: 0, border: 'none', borderRadius: 12, padding: '9px 16px',
          background: 'linear-gradient(135deg,#DBB89C,#C0906F)', color: '#3B2E27',
          fontSize: 14, fontWeight: 800, fontFamily: 'var(--font-assistant,sans-serif)', cursor: 'pointer',
        }}>
          התקן
        </button>
      )}
      <button onClick={dismiss} aria-label="סגור" style={{
        flexShrink: 0, border: 'none', background: 'transparent', color: '#8B7A6C',
        fontSize: 20, lineHeight: 1, cursor: 'pointer', padding: '0 2px',
      }}>
        ×
      </button>
    </div>
  )
}
