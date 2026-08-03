'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import TermsSheet from './TermsSheet'

type Step = 'phone' | 'otp'

export default function LoginPage() {
  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [showTerms, setShowTerms] = useState(false)

  function formatPhone(raw: string) {
    const digits = raw.replace(/\D/g, '')
    if (digits.startsWith('972')) return '+' + digits
    if (digits.startsWith('0')) return '+972' + digits.slice(1)
    return '+972' + digits
  }

  async function sendOtp() {
    if (!agreed) { setError('יש לאשר את תקנון ותנאי השימוש כדי להמשיך'); return }
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithOtp({ phone: formatPhone(phone) })
    if (error) { setError(error.message); setLoading(false); return }
    setStep('otp')
    setLoading(false)
  }

  async function verifyOtp() {
    setLoading(true); setError('')
    const { error } = await supabase.auth.verifyOtp({
      phone: formatPhone(phone),
      token: otp,
      type: 'sms',
    })
    if (error) { setError(error.message); setLoading(false); return }

    // The session lives in a cookie so the server can read it. When the browser
    // refuses to store it — Safari Private Browsing, or "Block All Cookies" —
    // verifyOtp still resolves successfully, but /home finds no session and
    // bounces straight back here. That looked like the code was silently
    // rejected. Confirm the session actually persisted before redirecting, and
    // name the real cause when it didn't.
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setError('הדפדפן חוסם שמירת התחברות. אם את/ה בגלישה פרטית — צאו ממנה, או אפשרו קובצי Cookie ונסו שוב.')
      setLoading(false)
      return
    }

    window.location.href = '/home'
  }

  return (
    <div className="min-h-dvh flex justify-center" style={{ background: '#2A211C' }}>
     <div className="w-full flex flex-col" style={{ maxWidth: 448, minHeight: '100dvh' }}>

      {/* Hero photo */}
      <div className="relative flex-1" style={{ maxHeight: '52dvh', minHeight: 240 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/splash.jpg"
          alt="Urban Studio"
          className="w-full h-full"
          style={{ objectFit: 'cover', objectPosition: 'center top', filter: 'brightness(0.78)' }}
        />
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, transparent 50%, #2A211C 100%)' }} />
        <div className="absolute bottom-6 inset-x-0 flex flex-col items-center">
          <div className="text-5xl font-black uppercase" dir="ltr"
            style={{ display: 'flex', alignItems: 'flex-end', gap: '0.07em', lineHeight: 1 }}>
            {['U', 'R', 'B', 'A', 'N'].map((ch) => (
              <span key={ch} style={{ position: 'relative', display: 'inline-block', color: 'white' }}>
                {ch}
                {ch === 'B' && (
                  <span style={{
                    position: 'absolute', left: '50%', bottom: '-0.18em',
                    transform: 'translateX(-50%)',
                    width: '0.62em', height: '0.10em',
                    background: 'white', borderRadius: 1,
                  }} />
                )}
              </span>
            ))}
          </div>
          <p className="text-3xl font-black uppercase" dir="ltr"
            style={{ color: 'rgba(255,255,255,0.75)', letterSpacing: '0.16em', textIndent: '0.16em', marginTop: '1.1rem' }}>
            CLUB
          </p>
        </div>
      </div>

      {/* Login form */}
      <div className="px-6 pt-6 pb-10" style={{ background: '#2A211C' }}>
        <p className="text-center text-sm mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
          מועדון לקוחות · התחבר עם מספר הטלפון
        </p>

        {step === 'phone' ? (
          <>
            <label className="block text-xs mb-1.5 px-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
              מספר טלפון
            </label>
            <div className="relative mb-4">
              <input
                type="tel"
                dir="ltr"
                placeholder="050-000-0000"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendOtp()}
                className="w-full py-4 px-5 rounded-2xl text-center text-lg tracking-widest outline-none"
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.25)',
                }}
              />
            </div>
            <button
              type="button"
              onClick={() => setAgreed(a => !a)}
              aria-pressed={agreed}
              className="flex items-start gap-2.5 mb-4 w-full text-right rounded-xl p-3"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}
            >
              <span
                style={{
                  width: 20, height: 20, borderRadius: 6, flexShrink: 0, marginTop: 1,
                  border: `1.5px solid ${agreed ? '#DBB89C' : 'rgba(255,255,255,0.4)'}`,
                  background: agreed ? 'linear-gradient(135deg,#C0906F,#DBB89C)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {agreed && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3B2E27" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                )}
              </span>
              <span className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
                קראתי ואני מסכים/ה ל
                <span onClick={(e) => { e.stopPropagation(); setShowTerms(true) }}
                  className="underline font-bold"
                  style={{ color: '#DBB89C' }}>
                  תקנון ותנאי השימוש
                </span>
                {' '}של מועדון Urban
              </span>
            </button>

            {error && <p className="text-red-400 text-sm text-center mb-3">{error}</p>}
            <button
              onClick={sendOtp}
              disabled={loading || phone.length < 9}
              className="w-full py-4 rounded-2xl font-bold text-sm transition disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #C0906F, #DBB89C)', color: '#3B2E27' }}
            >
              {loading ? '...' : 'שלח קוד אימות'}
            </button>
          </>
        ) : (
          <>
            <p className="text-center text-xs mb-4" style={{ color: 'rgba(255,255,255,0.4)' }}>
              הזן את הקוד שנשלח ל-{phone}
            </p>
            <input
              type="text"
              dir="ltr"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
              onKeyDown={e => e.key === 'Enter' && verifyOtp()}
              className="w-full py-4 px-5 rounded-2xl text-center text-3xl tracking-[0.4em] outline-none mb-4"
              style={{
                background: 'rgba(255,255,255,0.07)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.12)',
              }}
            />
            {error && <p className="text-red-400 text-sm text-center mb-3">{error}</p>}
            <button
              onClick={verifyOtp}
              disabled={loading || otp.length !== 6}
              className="w-full py-4 rounded-2xl font-bold text-sm disabled:opacity-40 mb-3"
              style={{ background: 'linear-gradient(135deg, #C0906F, #DBB89C)', color: '#3B2E27' }}
            >
              {loading ? 'מאמת...' : 'כניסה'}
            </button>
            <button
              onClick={() => { setStep('phone'); setOtp(''); setError('') }}
              className="w-full text-sm py-1"
              style={{ color: 'rgba(255,255,255,0.35)' }}
            >
              חזור
            </button>
          </>
        )}
      </div>

     </div>

      {showTerms && (
        <TermsSheet
          onClose={() => setShowTerms(false)}
          onAgree={() => { setAgreed(true); setShowTerms(false); setError('') }}
        />
      )}
    </div>
  )
}
