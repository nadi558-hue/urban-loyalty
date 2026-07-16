'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'

// Full-screen rotating QR for the studio tablet.
// The QR encodes a deep link (/qr?t=<token>) so both the in-app scanner
// and the phone's native camera work.
export default function KioskClient() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [clock, setClock] = useState('')

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/checkin/token', { cache: 'no-store' })
      if (!res.ok) throw new Error()
      const { token } = await res.json()
      const url = `${window.location.origin}/qr?t=${encodeURIComponent(token)}`
      if (canvasRef.current) {
        await QRCode.toCanvas(canvasRef.current, url, {
          width: 420, margin: 1,
          color: { dark: '#1c1917', light: '#ffffff' },
        })
      }
      setError(null)
    } catch {
      setError('שגיאה בטעינת הקוד — בודק שוב…')
    }
  }, [])

  useEffect(() => {
    const first = setTimeout(refresh, 0)
    const t = setInterval(refresh, 15_000) // refresh well within the 30s rotation
    const c = setInterval(() => {
      setClock(new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }))
    }, 1000)
    return () => { clearTimeout(first); clearInterval(t); clearInterval(c) }
  }, [refresh])

  return (
    <main dir="rtl" style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 28,
      background: 'linear-gradient(180deg,#3a342d 0%,#1c1917 100%)', padding: 24,
    }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 13, color: '#c4a05a', letterSpacing: '0.25em', textTransform: 'uppercase' }}>
          URBAN STUDIO CLUB
        </p>
        <h1 style={{ fontFamily: 'var(--font-frank,serif)', fontSize: 40, fontWeight: 900, color: '#f5f0e8', marginTop: 6 }}>
          צ׳ק-אין לשיעור
        </h1>
        <p style={{ fontSize: 16, color: '#b5a893', marginTop: 6 }}>
          סרקו את הקוד מהאפליקציה לצבירת Urban Coins
        </p>
      </div>

      <div style={{
        background: '#ffffff', borderRadius: 32, padding: 24,
        boxShadow: '0 20px 60px rgba(0,0,0,0.45)', border: '1px solid rgba(196,160,90,0.4)',
      }}>
        <canvas ref={canvasRef} style={{ display: 'block', borderRadius: 12 }} />
      </div>

      {error
        ? <p style={{ color: '#e08c8c', fontSize: 15 }}>{error}</p>
        : <p style={{ color: '#8a7c6a', fontSize: 14 }}>הקוד מתחלף אוטומטית · {clock}</p>}
    </main>
  )
}
