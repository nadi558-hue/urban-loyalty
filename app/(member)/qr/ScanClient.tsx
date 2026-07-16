'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import jsQR from 'jsqr'

type Status =
  | { kind: 'idle' }
  | { kind: 'scanning' }
  | { kind: 'submitting' }
  | { kind: 'success'; coins: number; already: boolean; message?: string }
  | { kind: 'error'; message: string }

// Extract the check-in token from raw QR content — supports both the raw
// token and the kiosk deep link (https://…/qr?t=<token>).
function extractToken(raw: string): string | null {
  if (raw.startsWith('uc1.')) return raw
  try {
    const t = new URL(raw).searchParams.get('t')
    if (t?.startsWith('uc1.')) return t
  } catch { /* not a URL */ }
  return null
}

export default function ScanClient() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number>(0)
  const busyRef = useRef(false)
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const params = useSearchParams()

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }, [])

  const submit = useCallback(async (token: string) => {
    if (busyRef.current) return
    busyRef.current = true
    stopCamera()
    setStatus({ kind: 'submitting' })
    try {
      const res = await fetch('/api/checkin/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      const data = await res.json()
      if (data.ok) {
        setStatus({
          kind: 'success',
          coins: data.coins ?? 0,
          already: Boolean(data.alreadyCheckedIn),
          message: data.message,
        })
      } else {
        setStatus({ kind: 'error', message: data.error ?? 'שגיאה — נסו שוב' })
        busyRef.current = false
      }
    } catch {
      setStatus({ kind: 'error', message: 'שגיאת תקשורת — נסו שוב' })
      busyRef.current = false
    }
  }, [stopCamera])

  const startCamera = useCallback(async () => {
    setStatus({ kind: 'scanning' })
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      })
      streamRef.current = stream
      const video = videoRef.current!
      video.srcObject = stream
      await video.play()

      const canvas = canvasRef.current!
      const ctx = canvas.getContext('2d', { willReadFrequently: true })!

      const tick = () => {
        if (!streamRef.current) return
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          ctx.drawImage(video, 0, 0)
          const img = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const code = jsQR(img.data, img.width, img.height, { inversionAttempts: 'dontInvert' })
          const token = code && extractToken(code.data.trim())
          if (token) { submit(token); return }
        }
        rafRef.current = requestAnimationFrame(tick)
      }
      rafRef.current = requestAnimationFrame(tick)
    } catch {
      setStatus({ kind: 'error', message: 'אין גישה למצלמה — אשרו הרשאת מצלמה בדפדפן ונסו שוב' })
    }
  }, [submit])

  // Deep-link flow: native camera scanned the kiosk QR → /qr?t=<token>
  useEffect(() => {
    const t = params.get('t')
    if (!t?.startsWith('uc1.')) return
    const id = setTimeout(() => submit(t), 0)
    return () => clearTimeout(id)
  }, [params, submit])

  useEffect(() => stopCamera, [stopCamera])

  const card: React.CSSProperties = {
    background: '#ffffff', borderRadius: 24, padding: '28px 24px',
    border: '1px solid rgba(196,160,90,0.25)',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)', textAlign: 'center',
  }

  return (
    <div style={{ padding: '24px 24px 0' }}>
      <div style={card}>
        {status.kind === 'scanning' ? (
          <div style={{ position: 'relative', width: '100%', borderRadius: 16, overflow: 'hidden', background: '#000' }}>
            <video ref={videoRef} playsInline muted style={{ width: '100%', display: 'block' }} />
            <div style={{
              position: 'absolute', inset: '12%', border: '3px solid rgba(196,160,90,0.9)',
              borderRadius: 18, pointerEvents: 'none',
            }} />
          </div>
        ) : status.kind === 'submitting' ? (
          <div style={{ padding: '48px 0' }}>
            <p style={{ fontSize: 40 }}>⏳</p>
            <p style={{ fontSize: 14, color: '#8a7c6a', marginTop: 8 }}>רושם צ׳ק-אין…</p>
          </div>
        ) : status.kind === 'success' ? (
          <div style={{ padding: '32px 0' }}>
            <p style={{ fontSize: 52 }}>{status.already ? '💪' : '🎉'}</p>
            <p style={{ fontFamily: 'var(--font-frank,serif)', fontSize: 22, fontWeight: 700, color: '#1c1917', marginTop: 10 }}>
              {status.already ? 'כבר בפנים!' : 'צ׳ק-אין הושלם!'}
            </p>
            <p style={{ fontSize: 14, color: '#8a7c6a', marginTop: 6 }}>
              {status.already
                ? (status.message ?? 'כבר נרשם צ׳ק-אין לשיעור הזה')
                : <>נוספו לך <b style={{ color: '#b8860b' }}>+{status.coins} UC</b> — אימון נעים 🤍</>}
            </p>
          </div>
        ) : (
          <div style={{ padding: '20px 0 8px' }}>
            <p style={{ fontSize: 48 }}>📷</p>
            <p style={{ fontSize: 14, color: '#8a7c6a', margin: '10px 0 20px', lineHeight: 1.6 }}>
              הגעתם לסטודיו? סרקו את הקוד שמוצג
              <br />על המסך בכניסה לצבירת UC
            </p>
            {status.kind === 'error' && (
              <p style={{ fontSize: 13, color: '#b04040', marginBottom: 14 }}>{status.message}</p>
            )}
            <button onClick={startCamera} style={{
              width: '100%', padding: '15px 0', borderRadius: 16, border: 'none',
              background: 'linear-gradient(135deg,#e8cc88,#c4a05a)', color: '#1c1917',
              fontSize: 16, fontWeight: 800, fontFamily: 'var(--font-assistant,sans-serif)', cursor: 'pointer',
            }}>
              {status.kind === 'error' ? 'נסו שוב' : 'סריקת צ׳ק-אין'}
            </button>
          </div>
        )}
      </div>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <p style={{ textAlign: 'center', fontSize: 12, color: '#8a7c6a', marginTop: 16 }}>
        הקוד במסך הסטודיו מתחלף כל כמה שניות — הסריקה מאשרת נוכחות
      </p>
    </div>
  )
}
