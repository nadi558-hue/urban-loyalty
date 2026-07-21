'use client'

import { useEffect, useState } from 'react'

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }

const DISMISS_KEY = 'urban-a2hs-dismissed'

export default function PwaInstall() {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null)
  const [showIosHint, setShowIosHint] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Register the service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }

    // Already installed → never show
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as { standalone?: boolean }).standalone === true
    if (standalone) return
    if (localStorage.getItem(DISMISS_KEY)) return

    // Android / Chrome: capture the native prompt
    const onBIP = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BIPEvent)
      setVisible(true)
    }
    window.addEventListener('beforeinstallprompt', onBIP)

    // iOS Safari has no beforeinstallprompt → show manual instructions
    const ua = window.navigator.userAgent
    const isIos = /iphone|ipad|ipod/i.test(ua)
    const isSafari = /safari/i.test(ua) && !/crios|fxios|edgios/i.test(ua)
    const iosTimer = isIos && isSafari
      ? setTimeout(() => { setShowIosHint(true); setVisible(true) }, 0)
      : undefined

    return () => {
      window.removeEventListener('beforeinstallprompt', onBIP)
      if (iosTimer) clearTimeout(iosTimer)
    }
  }, [])

  if (!visible) return null

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1')
    setVisible(false)
  }

  const install = async () => {
    if (!deferred) return
    await deferred.prompt()
    await deferred.userChoice
    setDeferred(null)
    setVisible(false)
  }

  return (
    <div
      dir="rtl"
      style={{
        position: 'fixed', left: 12, right: 12, bottom: 12, zIndex: 60,
        maxWidth: 420, margin: '0 auto',
        background: 'linear-gradient(135deg,#3a342d,#1c1917)',
        border: '1px solid rgba(196,160,90,0.45)', borderRadius: 18,
        boxShadow: '0 12px 40px rgba(0,0,0,0.4)', padding: '14px 16px',
        display: 'flex', alignItems: 'center', gap: 12,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/icons/icon-192.png" alt="" width={44} height={44}
        style={{ borderRadius: 10, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: '#f5f0e8', fontFamily: 'var(--font-assistant,sans-serif)' }}>
          התקינו את אפליקציית Urban Club
        </p>
        <p style={{ fontSize: 12, color: '#b5a893', marginTop: 2, fontFamily: 'var(--font-assistant,sans-serif)' }}>
          {showIosHint
            ? 'הקישו על ⬆️ שיתוף ואז "הוסף למסך הבית"'
            : 'גישה מהירה מהמסך הבית — כמו אפליקציה'}
        </p>
      </div>
      {!showIosHint && (
        <button onClick={install} style={{
          flexShrink: 0, border: 'none', borderRadius: 12, padding: '9px 16px',
          background: 'linear-gradient(135deg,#e8cc88,#c4a05a)', color: '#1c1917',
          fontSize: 14, fontWeight: 800, fontFamily: 'var(--font-assistant,sans-serif)', cursor: 'pointer',
        }}>
          התקן
        </button>
      )}
      <button onClick={dismiss} aria-label="סגור" style={{
        flexShrink: 0, border: 'none', background: 'transparent', color: '#8a7c6a',
        fontSize: 20, lineHeight: 1, cursor: 'pointer', padding: '0 2px',
      }}>
        ×
      </button>
    </div>
  )
}
