'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Instagram, TickCircle, Timer1, CloseCircle, Gallery } from 'iconsax-reactjs'
import { submitShare } from './actions'
import type { Share, ShareEligibility } from '@/lib/social-shares'

const STUDIO_IG = 'https://www.instagram.com/urban_studio_official/'

function statusLabel(s: Share) {
  if (s.status === 'approved') return { text: `אושר · +${s.coins_awarded ?? 0} UC`, color: '#3f8f5e' }
  if (s.status === 'rejected') return { text: s.note || 'לא אושר', color: '#b04040' }
  return { text: 'ממתין לאישור', color: '#A66B43' }
}

function daysUntil(iso: string) {
  return Math.max(1, Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000))
}

export default function ShareClient({
  bonus,
  eligibility,
  history,
}: {
  bonus: number
  eligibility: ShareEligibility
  history: Share[]
}) {
  const [preview, setPreview] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  function pick(file: File | undefined) {
    if (!file) return
    setError('')
    setPreview(URL.createObjectURL(file))
  }

  async function send() {
    const file = inputRef.current?.files?.[0]
    if (!file) return setError('בחרו תמונה תחילה')
    setBusy(true); setError('')
    const form = new FormData()
    form.append('image', file)
    const res = await submitShare(form)
    setBusy(false)
    if (res.ok) {
      setDone(true)
      setPreview(null)
      router.refresh()
    } else {
      setError(res.error ?? 'שגיאה')
    }
  }

  const blocked = !eligibility.canSubmit

  return (
    <main className="max-w-md mx-auto" style={{ minHeight: '100dvh', background: '#F1E9E3', paddingBottom: 110 }}>

      <div style={{
        position: 'relative', overflow: 'hidden', padding: '30px 22px 26px', textAlign: 'right',
        background: 'linear-gradient(160deg,#FBF4EE 0%,#F0E2D6 100%)',
        borderBottom: '1px solid rgba(192,144,111,0.18)',
      }}>
        <p style={{ fontSize: 11, color: '#A66B43', letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 6, fontFamily: 'var(--font-assistant,sans-serif)' }}>
          Social Buzz
        </p>
        <h1 style={{ fontFamily: 'var(--font-frank,serif)', fontSize: 30, fontWeight: 900, color: '#3B2E27', lineHeight: 1.15, marginBottom: 6 }}>
          שתפו וקבלו {bonus} UC
        </h1>
        <p style={{ fontSize: 13, color: '#7A6B60', fontFamily: 'var(--font-assistant,sans-serif)' }}>
          העלו צילום מסך של סטורי שבו תייגתם אותנו — נאשר ונזכה אתכם. פעם בשבוע.
        </p>
      </div>

      {/* Tag us */}
      <div style={{ padding: '16px 16px 0' }}>
        <a href={STUDIO_IG} target="_blank" rel="noopener noreferrer" className="clay-sm"
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 16px', textDecoration: 'none' }}>
          <Instagram size={22} variant="Bulk" color="#96613F" />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#3B2E27', fontFamily: 'var(--font-assistant,sans-serif)' }}>@urban_studio_official</p>
            <p style={{ fontSize: 11, color: '#9C8B7F', fontFamily: 'var(--font-assistant,sans-serif)' }}>תייגו אותנו בסטורי</p>
          </div>
        </a>
      </div>

      {/* Upload */}
      <div style={{ padding: '14px 16px 0' }}>
        <div className="clay" style={{ padding: '18px 18px 16px' }}>
          {done ? (
            <div style={{ textAlign: 'center', padding: '14px 0' }}>
              <TickCircle size={48} variant="Bulk" color="#3f8f5e" />
              <p style={{ fontFamily: 'var(--font-frank,serif)', fontSize: 19, fontWeight: 700, color: '#3B2E27', marginTop: 10 }}>נשלח לאישור!</p>
              <p style={{ fontSize: 13, color: '#8B7A6C', marginTop: 4, fontFamily: 'var(--font-assistant,sans-serif)' }}>
                נבדוק ונזכה אתכם ב-{bonus} UC
              </p>
            </div>
          ) : blocked ? (
            <div style={{ textAlign: 'center', padding: '14px 0' }}>
              {eligibility.reason === 'pending'
                ? <Timer1 size={44} variant="Bulk" color="#C0906F" />
                : <CloseCircle size={44} variant="Bulk" color="#9C8B7F" />}
              <p style={{ fontSize: 14, color: '#6F625A', marginTop: 10, fontFamily: 'var(--font-assistant,sans-serif)' }}>
                {eligibility.reason === 'pending'
                  ? 'יש לכם שיתוף שממתין לאישור'
                  : `אפשר לשתף שוב בעוד ${eligibility.nextAt ? daysUntil(eligibility.nextAt) : 7} ימים`}
              </p>
            </div>
          ) : (
            <>
              <input
                ref={inputRef} type="file" accept="image/*" hidden
                onChange={e => pick(e.target.files?.[0])}
              />
              <button
                onClick={() => inputRef.current?.click()}
                className="clay-inset"
                style={{
                  width: '100%', padding: preview ? 8 : '34px 0', border: 'none', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginBottom: 12,
                }}
              >
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={preview} alt="תצוגה מקדימה" style={{ width: '100%', borderRadius: 14, maxHeight: 300, objectFit: 'contain' }} />
                ) : (
                  <>
                    <Gallery size={34} variant="Bulk" color="#C0906F" />
                    <span style={{ fontSize: 13, color: '#8B7A6C', fontFamily: 'var(--font-assistant,sans-serif)' }}>בחרו צילום מסך</span>
                  </>
                )}
              </button>

              {error && (
                <p style={{ textAlign: 'center', fontSize: 13, color: '#b04040', marginBottom: 10, fontFamily: 'var(--font-assistant,sans-serif)' }}>{error}</p>
              )}

              <button
                onClick={send}
                disabled={busy || !preview}
                className="clay-btn"
                style={{
                  width: '100%', padding: '14px 0', fontSize: 15, fontWeight: 800,
                  fontFamily: 'var(--font-assistant,sans-serif)',
                  opacity: busy || !preview ? 0.55 : 1,
                  cursor: busy || !preview ? 'default' : 'pointer',
                }}
              >
                {busy ? 'שולח…' : 'שליחה לאישור'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div style={{ padding: '20px 16px 0' }}>
          <p style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9C8B7F', marginBottom: 10, fontFamily: 'var(--font-assistant,sans-serif)' }}>
            השיתופים שלך
          </p>
          <div className="clay-sm" style={{ overflow: 'hidden' }}>
            {history.map((s, i) => {
              const label = statusLabel(s)
              return (
                <div key={s.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                  borderBottom: i < history.length - 1 ? '1px solid #F3EAE3' : undefined,
                }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.image_url} alt="" style={{ width: 42, height: 42, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, color: label.color, fontWeight: 600, fontFamily: 'var(--font-assistant,sans-serif)' }}>{label.text}</p>
                    <p style={{ fontSize: 11, color: '#9C8B7F', fontFamily: 'var(--font-assistant,sans-serif)' }}>
                      {new Date(s.created_at).toLocaleDateString('he-IL')}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </main>
  )
}
