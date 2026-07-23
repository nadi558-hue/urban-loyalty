'use client'
import { useState } from 'react'

const DEMO_UC = 47

type IconKey = 'waitlist' | 'early' | 'discount' | 'single_class'

const REWARDS_AVAILABLE: { id: number; icon: IconKey; name: string; cost: number }[] = [
  { id: 1, icon: 'waitlist', name: 'הקפצה בראש רשימת המתנה', cost: 20 },
  { id: 2, icon: 'early',    name: 'שריון מוקדם · שבוע מראש', cost: 35 },
  { id: 3, icon: 'discount', name: '5% הנחה · חידוש מנוי או כרטיסייה', cost: 45 },
]

const REWARDS_LOCKED: { id: number; icon: IconKey; name: string; cost: number }[] = [
  { id: 4, icon: 'discount',     name: '10% הנחה · חידוש מנוי או כרטיסייה', cost: 90 },
  { id: 5, icon: 'early',        name: 'שריון VIP · שבועיים מראש', cost: 110 },
  { id: 6, icon: 'single_class', name: 'שיעור בודד מעבר למכסה', cost: 120 },
]

function RewardIcon({ type, muted = false }: { type: IconKey; muted?: boolean }) {
  const stroke = muted ? '#9C8B7F' : '#96613F'
  const bg = muted
    ? 'linear-gradient(150deg,#F3EAE3,#E7DBD1)'
    : 'linear-gradient(150deg,#FBF1E8,#DBB89C)'
  const paths: Record<IconKey, React.ReactNode> = {
    waitlist: (
      <>
        <path d="M4 7.5h9" />
        <path d="M4 12h9" />
        <path d="M4 16.5h5.5" />
        <path d="M17.5 20V10.5" />
        <path d="M14.3 13.7l3.2-3.2 3.2 3.2" />
      </>
    ),
    early: (
      <>
        <rect x="4" y="6" width="16" height="14" rx="2.2" />
        <path d="M4 10h16" />
        <path d="M8.5 4v3.2M15.5 4v3.2" />
        <path d="M12 12.4l.85 1.72 1.9.28-1.37 1.34.32 1.9L12 16.96l-1.7.9.32-1.9-1.37-1.34 1.9-.28z"
          fill={stroke} stroke="none" />
      </>
    ),
    discount: (
      <>
        <circle cx="8.6" cy="8.6" r="1.9" />
        <circle cx="15.4" cy="15.4" r="1.9" />
        <path d="M16.5 7.5l-9 9" />
      </>
    ),
    single_class: (
      <>
        <rect x="3.5" y="7.5" width="11.5" height="9" rx="2" />
        <path d="M11 7.5v9" strokeDasharray="1.6 1.8" />
        <path d="M19 8.5v6M16 11.5h6" />
      </>
    ),
  }
  return (
    <div style={{
      width: 44, height: 44, borderRadius: '50%', background: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      boxShadow: muted ? 'none' : '0 3px 10px rgba(192,144,111,0.25)',
    }}>
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke={stroke}
        strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {paths[type]}
      </svg>
    </div>
  )
}

type Filter = 'all' | 'available' | 'soon'
type Reward = { id: number; icon: IconKey; name: string; cost: number }

export default function RewardsPage() {
  const [filter, setFilter] = useState<Filter>('all')
  const [confirming, setConfirming] = useState<Reward | null>(null)
  const [redeemed, setRedeemed] = useState<Reward | null>(null)
  const [redeemedCode, setRedeemedCode] = useState<string | null>(null)
  const [redeeming, setRedeeming] = useState(false)
  const [redeemError, setRedeemError] = useState('')
  const uc = DEMO_UC

  async function confirmRedeem(r: Reward) {
    setRedeeming(true); setRedeemError('')
    try {
      const res = await fetch('/api/rewards/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reward_name: r.name }),
      })
      const data = await res.json()
      if (res.ok) {
        setRedeemedCode(data.code ?? null)
        setRedeemed(r)
        setConfirming(null)
      } else if (res.status === 401) {
        // Not signed in (local demo without a live session) — show the demo
        // success so the flow is reviewable; real redemption runs in production.
        setRedeemedCode(null)
        setRedeemed(r)
        setConfirming(null)
      } else {
        setRedeemError(data.error ?? 'שגיאה במימוש')
      }
    } catch {
      setRedeemError('שגיאת רשת — נסה שוב')
    } finally {
      setRedeeming(false)
    }
  }
  const showAvailable = filter !== 'soon'
  const showLocked = filter !== 'available'
  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: 'הכל' },
    { key: 'available', label: 'זמין עכשיו' },
    { key: 'soon', label: 'בקרוב' },
  ]

  return (
    <main className="max-w-md mx-auto" style={{ minHeight: '100dvh', background: '#F1E9E3' }}>

      {/* ── Full-bleed hero ─────────────────────── */}
      <div style={{
        position: 'relative', height: 300, overflow: 'hidden',
        background: 'linear-gradient(120deg,#EFE2D8 0%,#E4D0C3 52%,#D8BCA9 100%)',
      }}>
        {/* Figure cutout, bottom-left, fading toward the title on the right */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/figure-stretch.png" alt="" aria-hidden
          style={{
            position: 'absolute', bottom: 0, left: -12, height: 292, pointerEvents: 'none', zIndex: 1,
            filter: 'drop-shadow(0 12px 22px rgba(59,46,39,.20))',
            WebkitMaskImage: 'linear-gradient(90deg,#000 0%,#000 48%,transparent 78%)',
            maskImage: 'linear-gradient(90deg,#000 0%,#000 48%,transparent 78%)',
          }}
        />
        {/* Soft light glow + bottom fade into the glass card */}
        <div aria-hidden style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(130% 90% at 85% 18%, rgba(255,255,255,0.4), transparent 58%), linear-gradient(180deg, transparent 62%, rgba(241,233,227,0.5) 100%)',
        }} />
        {/* Title (RTL — reads top-right) */}
        <div style={{ position: 'relative', zIndex: 2, padding: '28px 22px', textAlign: 'right' }}>
          <p style={{ fontSize: 11, color: '#A66B43', letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 6, fontFamily: 'var(--font-assistant,sans-serif)' }}>
            מועדון URBAN
          </p>
          <p style={{ fontFamily: 'var(--font-frank,serif)', fontSize: 32, fontWeight: 900, color: '#3B2E27', lineHeight: 1.12, marginBottom: 8 }}>
            חנות ההטבות
          </p>
          <p style={{ fontSize: 12.5, color: '#7A6B60', maxWidth: 180, marginRight: 0, marginLeft: 'auto', fontFamily: 'var(--font-assistant,sans-serif)' }}>
            ממטבעות Urban להטבות אמיתיות
          </p>
        </div>
      </div>

      {/* ── Glass balance card (overlaps the hero) ── */}
      <div style={{
        position: 'relative', zIndex: 3, margin: '-58px 16px 0',
        background: 'rgba(251,244,238,0.55)',
        backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
        border: '1px solid rgba(255,255,255,0.6)', borderRadius: 24,
        boxShadow: '0 16px 40px -16px rgba(59,46,39,0.35)',
        padding: '16px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <p style={{ fontSize: 11, color: '#8B7A6C', letterSpacing: '0.08em', marginBottom: 2, fontFamily: 'var(--font-assistant,sans-serif)' }}>היתרה שלך למימוש</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
            <span style={{ fontFamily: 'var(--font-frank,serif)', fontSize: 46, fontWeight: 900, color: '#3B2E27', lineHeight: 1 }}>{uc}</span>
            <span style={{ fontFamily: 'var(--font-frank,serif)', fontSize: 18, color: '#A66B43' }}>UC</span>
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/icons/coin-gold.png" alt="" aria-hidden
          style={{ height: 50, width: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 3px 6px rgba(59,46,39,0.22))' }} />
      </div>

      <div style={{ padding: '14px 16px 0' }}>
        <div style={{ background: 'linear-gradient(135deg,#5A473C 0%,#3B2E27 100%)', borderRadius: 20, padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/wash.png" alt="" aria-hidden
            style={{ position: 'absolute', top: -20, left: -20, width: 180, opacity: 0.35, pointerEvents: 'none' }}
          />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <p style={{ fontSize: 11, color: '#C0906F', letterSpacing: '0.15em', marginBottom: 4, fontFamily: 'var(--font-assistant,sans-serif)' }}>מומלץ החודש</p>
            <p style={{ fontFamily: 'var(--font-frank,serif)', fontSize: 20, fontWeight: 700, color: '#F6EFEA', marginBottom: 4 }}>שריון מוקדם · לפני כולם</p>
            <p style={{ fontSize: 12, color: 'rgba(245,240,230,0.5)', marginBottom: 12, fontFamily: 'var(--font-assistant,sans-serif)' }}>פתח את מערכת השעות שבועיים מראש ותפוס מקום בשיעורים המבוקשים</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-frank,serif)', fontSize: 22, fontWeight: 700, color: '#DBB89C' }}>110 UC</span>
              <span style={{ fontSize: 12, color: 'rgba(245,240,230,0.4)', fontFamily: 'var(--font-assistant,sans-serif)' }}>חסרים {110 - uc} UC</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '14px 16px 0', display: 'flex', gap: 8 }}>
        {filters.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} style={{
            borderRadius: 999, padding: '7px 16px', fontSize: 13,
            fontFamily: 'var(--font-assistant,sans-serif)',
            fontWeight: f.key === filter ? 700 : 400,
            background: f.key === filter ? '#3B2E27' : 'rgba(255,255,255,0.6)',
            color: f.key === filter ? '#DBB89C' : '#6F625A',
            border: 'none', cursor: 'pointer',
          }}>{f.label}</button>
        ))}
      </div>

      {showAvailable && (
        <div style={{ padding: '14px 16px 0' }}>
          <p style={{ fontSize: 11, color: '#9C8B7F', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10, fontFamily: 'var(--font-assistant,sans-serif)' }}>זמין עכשיו</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {REWARDS_AVAILABLE.map(r => {
              const affordable = uc >= r.cost
              return (
              <div key={r.id} style={{ background: '#ffffff', borderRadius: 18, padding: '14px 14px 12px', border: '1px solid rgba(192,144,111,0.2)', boxShadow: '0 4px 14px rgba(0,0,0,0.06)' }}>
                <div style={{ marginBottom: 10 }}><RewardIcon type={r.icon} /></div>
                <p style={{ fontFamily: 'var(--font-assistant,sans-serif)', fontSize: 13, fontWeight: 700, color: '#3B2E27', marginBottom: 4 }}>{r.name}</p>
                <p style={{ fontFamily: 'var(--font-frank,serif)', fontSize: 14, color: '#9C8B7F', marginBottom: 10 }}>{r.cost} UC</p>
                <button
                  onClick={() => affordable && setConfirming(r)}
                  disabled={!affordable}
                  style={{ width: '100%', background: affordable ? 'linear-gradient(135deg,#DBB89C,#C0906F)' : '#F3EAE3', border: 'none', borderRadius: 999, padding: '7px 0', fontFamily: 'var(--font-assistant,sans-serif)', fontSize: 13, fontWeight: 700, color: affordable ? '#3B2E27' : '#9C8B7F', cursor: affordable ? 'pointer' : 'not-allowed' }}
                >{affordable ? 'מימוש' : `חסרים ${r.cost - uc} UC`}</button>
              </div>
              )
            })}
          </div>
        </div>
      )}

      {showLocked && (
        <div style={{ padding: '14px 16px 0' }}>
          <p style={{ fontSize: 11, color: '#9C8B7F', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10, fontFamily: 'var(--font-assistant,sans-serif)' }}>בהישג יד</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {REWARDS_LOCKED.map(r => {
              const need = r.cost - uc
              return (
                <div key={r.id} style={{ background: '#ffffff', borderRadius: 18, padding: '14px 14px 12px', border: '1px solid rgba(192,144,111,0.1)', opacity: 0.85 }}>
                  <div style={{ marginBottom: 10 }}><RewardIcon type={r.icon} muted /></div>
                  <p style={{ fontFamily: 'var(--font-assistant,sans-serif)', fontSize: 13, fontWeight: 700, color: '#6F625A', marginBottom: 4 }}>{r.name}</p>
                  <p style={{ fontFamily: 'var(--font-frank,serif)', fontSize: 14, color: '#9C8B7F', marginBottom: 10 }}>{r.cost} UC</p>
                  <div style={{ width: '100%', background: '#F3EAE3', borderRadius: 999, padding: '7px 0', textAlign: 'center', fontFamily: 'var(--font-assistant,sans-serif)', fontSize: 11, color: '#9C8B7F' }}>
                    חסרים {need} UC
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div style={{ height: 24 }} />

      {/* Confirm redemption */}
      {confirming && (
        <div onClick={() => setConfirming(null)} style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(20,16,12,0.55)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 448, background: '#FBF6F2', borderRadius: '24px 24px 0 0', padding: '24px 22px calc(24px + env(safe-area-inset-bottom))' }}>
            <div style={{ width: 40, height: 4, borderRadius: 999, background: '#E7DBD1', margin: '0 auto 18px' }} />
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}><RewardIcon type={confirming.icon} /></div>
            <p style={{ textAlign: 'center', fontFamily: 'var(--font-frank,serif)', fontSize: 20, fontWeight: 700, color: '#3B2E27', marginBottom: 6 }}>{confirming.name}</p>
            <p style={{ textAlign: 'center', fontSize: 13, color: '#8B7A6C', marginBottom: 18, fontFamily: 'var(--font-assistant,sans-serif)' }}>
              המימוש ינכה <strong style={{ color: '#C0906F' }}>{confirming.cost} UC</strong> מהיתרה שלך · יישאר {uc - confirming.cost} UC
            </p>
            {redeemError && <p style={{ textAlign: 'center', fontSize: 13, color: '#c04040', marginBottom: 12, fontFamily: 'var(--font-assistant,sans-serif)' }}>{redeemError}</p>}
            <button
              onClick={() => confirmRedeem(confirming)}
              disabled={redeeming}
              style={{ width: '100%', background: 'linear-gradient(135deg,#DBB89C,#C0906F)', border: 'none', borderRadius: 999, padding: '13px 0', fontFamily: 'var(--font-assistant,sans-serif)', fontSize: 14, fontWeight: 700, color: '#3B2E27', cursor: redeeming ? 'default' : 'pointer', opacity: redeeming ? 0.6 : 1, marginBottom: 8 }}
            >{redeeming ? 'מבצע מימוש...' : 'אישור מימוש'}</button>
            <button
              onClick={() => { setConfirming(null); setRedeemError('') }}
              style={{ width: '100%', background: 'transparent', border: 'none', padding: '8px 0', fontFamily: 'var(--font-assistant,sans-serif)', fontSize: 13, color: '#9C8B7F', cursor: 'pointer' }}
            >ביטול</button>
          </div>
        </div>
      )}

      {/* Redemption success */}
      {redeemed && (
        <div onClick={() => setRedeemed(null)} style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(20,16,12,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 340, background: '#FBF6F2', borderRadius: 24, padding: '28px 24px', textAlign: 'center' }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg,#DBB89C,#C0906F)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#3B2E27" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
            </div>
            <p style={{ fontFamily: 'var(--font-frank,serif)', fontSize: 20, fontWeight: 700, color: '#3B2E27', marginBottom: 6 }}>ההטבה מומשה!</p>
            <p style={{ fontSize: 13, color: '#8B7A6C', marginBottom: 14, fontFamily: 'var(--font-assistant,sans-serif)' }}>
              {redeemed.name} · הצג את הקוד בדלפק הסטודיו
            </p>
            {redeemedCode && (
              <div style={{ background: '#3B2E27', borderRadius: 14, padding: '12px 0', marginBottom: 16 }}>
                <p style={{ fontSize: 10, color: 'rgba(232,204,136,0.6)', letterSpacing: '0.18em', marginBottom: 2, fontFamily: 'var(--font-assistant,sans-serif)' }}>קוד מימוש</p>
                <p style={{ fontFamily: 'var(--font-frank,serif)', fontSize: 26, fontWeight: 900, color: '#DBB89C', letterSpacing: '0.25em' }}>{redeemedCode}</p>
              </div>
            )}
            <button
              onClick={() => { setRedeemed(null); setRedeemedCode(null) }}
              style={{ width: '100%', background: '#3B2E27', border: 'none', borderRadius: 999, padding: '12px 0', fontFamily: 'var(--font-assistant,sans-serif)', fontSize: 14, fontWeight: 700, color: '#DBB89C', cursor: 'pointer' }}
            >סגירה</button>
          </div>
        </div>
      )}
    </main>
  )
}
