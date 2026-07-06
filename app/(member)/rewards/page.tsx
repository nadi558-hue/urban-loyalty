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
  const stroke = muted ? '#a89a86' : '#8a6a20'
  const bg = muted
    ? 'linear-gradient(150deg,#efeae2,#e4ddd0)'
    : 'linear-gradient(150deg,#f7ecce,#e8cc88)'
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
      boxShadow: muted ? 'none' : '0 3px 10px rgba(196,160,90,0.25)',
    }}>
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke={stroke}
        strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {paths[type]}
      </svg>
    </div>
  )
}

type Filter = 'all' | 'available' | 'soon'

export default function RewardsPage() {
  const [filter, setFilter] = useState<Filter>('all')
  const uc = DEMO_UC
  const showAvailable = filter !== 'soon'
  const showLocked = filter !== 'available'
  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: 'הכל' },
    { key: 'available', label: 'זמין עכשיו' },
    { key: 'soon', label: 'בקרוב' },
  ]

  return (
    <main className="max-w-md mx-auto" style={{ minHeight: '100dvh', background: '#d9d3c7' }}>

      <div style={{
        background: 'linear-gradient(160deg,#f4eee2 0%,#e7dcc6 100%)',
        minHeight: 200, overflow: 'hidden', position: 'relative',
        padding: '24px 20px 28px',
      }}>
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
          <p style={{ fontSize: 11, color: '#c4a05a', letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 6, fontFamily: 'var(--font-assistant,sans-serif)' }}>
            מועדון URBAN
          </p>
          <p style={{ fontFamily: 'var(--font-frank,serif)', fontSize: 28, fontWeight: 900, color: '#1c1917', lineHeight: 1.15, marginBottom: 8 }}>
            חנות ההטבות
          </p>
          <p style={{ fontSize: 12, color: '#8a7c6a', marginBottom: 14, fontFamily: 'var(--font-assistant,sans-serif)' }}>
            ממטבעות Urban להטבות אמיתיות
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#1c1917', borderRadius: 999, padding: '7px 14px' }}>
            <span style={{ fontFamily: 'var(--font-frank,serif)', fontSize: 16, fontWeight: 700, color: '#e8cc88' }}>{uc}</span>
            <span style={{ fontSize: 12, color: 'rgba(232,204,136,0.7)', fontFamily: 'var(--font-assistant,sans-serif)' }}>UC זמין</span>
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/figure-stretch.png" alt="" aria-hidden
          style={{ position: 'absolute', bottom: 0, left: -30, height: 170, opacity: 0.5, pointerEvents: 'none', zIndex: 1, filter: 'drop-shadow(0 12px 20px rgba(28,25,23,.16))', WebkitMaskImage: 'linear-gradient(90deg,#000 40%,transparent 85%)', maskImage: 'linear-gradient(90deg,#000 40%,transparent 85%)' }}
        />
      </div>

      <div style={{ padding: '14px 16px 0' }}>
        <div style={{ background: 'linear-gradient(135deg,#3a342d 0%,#1c1917 100%)', borderRadius: 20, padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/wash.png" alt="" aria-hidden
            style={{ position: 'absolute', top: -20, left: -20, width: 180, opacity: 0.35, pointerEvents: 'none' }}
          />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <p style={{ fontSize: 11, color: '#c4a05a', letterSpacing: '0.15em', marginBottom: 4, fontFamily: 'var(--font-assistant,sans-serif)' }}>מומלץ החודש</p>
            <p style={{ fontFamily: 'var(--font-frank,serif)', fontSize: 20, fontWeight: 700, color: '#f5f0e8', marginBottom: 4 }}>שריון מוקדם · לפני כולם</p>
            <p style={{ fontSize: 12, color: 'rgba(245,240,230,0.5)', marginBottom: 12, fontFamily: 'var(--font-assistant,sans-serif)' }}>פתח את מערכת השעות שבועיים מראש ותפוס מקום בשיעורים המבוקשים</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-frank,serif)', fontSize: 22, fontWeight: 700, color: '#e8cc88' }}>110 UC</span>
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
            background: f.key === filter ? '#1c1917' : 'rgba(255,255,255,0.6)',
            color: f.key === filter ? '#e8cc88' : '#6f665c',
            border: 'none', cursor: 'pointer',
          }}>{f.label}</button>
        ))}
      </div>

      {showAvailable && (
        <div style={{ padding: '14px 16px 0' }}>
          <p style={{ fontSize: 11, color: '#94897e', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10, fontFamily: 'var(--font-assistant,sans-serif)' }}>זמין עכשיו</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {REWARDS_AVAILABLE.map(r => (
              <div key={r.id} style={{ background: '#ffffff', borderRadius: 18, padding: '14px 14px 12px', border: '1px solid rgba(196,160,90,0.2)', boxShadow: '0 4px 14px rgba(0,0,0,0.06)' }}>
                <div style={{ marginBottom: 10 }}><RewardIcon type={r.icon} /></div>
                <p style={{ fontFamily: 'var(--font-assistant,sans-serif)', fontSize: 13, fontWeight: 700, color: '#1c1917', marginBottom: 4 }}>{r.name}</p>
                <p style={{ fontFamily: 'var(--font-frank,serif)', fontSize: 14, color: '#94897e', marginBottom: 10 }}>{r.cost} UC</p>
                <button style={{ width: '100%', background: 'linear-gradient(135deg,#e8cc88,#c4a05a)', border: 'none', borderRadius: 999, padding: '7px 0', fontFamily: 'var(--font-assistant,sans-serif)', fontSize: 13, fontWeight: 700, color: '#1c1917', cursor: 'pointer' }}>מימוש</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {showLocked && (
        <div style={{ padding: '14px 16px 0' }}>
          <p style={{ fontSize: 11, color: '#94897e', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10, fontFamily: 'var(--font-assistant,sans-serif)' }}>בהישג יד</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {REWARDS_LOCKED.map(r => {
              const need = r.cost - uc
              return (
                <div key={r.id} style={{ background: '#ffffff', borderRadius: 18, padding: '14px 14px 12px', border: '1px solid rgba(196,160,90,0.1)', opacity: 0.85 }}>
                  <div style={{ marginBottom: 10 }}><RewardIcon type={r.icon} muted /></div>
                  <p style={{ fontFamily: 'var(--font-assistant,sans-serif)', fontSize: 13, fontWeight: 700, color: '#6f665c', marginBottom: 4 }}>{r.name}</p>
                  <p style={{ fontFamily: 'var(--font-frank,serif)', fontSize: 14, color: '#94897e', marginBottom: 10 }}>{r.cost} UC</p>
                  <div style={{ width: '100%', background: '#f0ebe2', borderRadius: 999, padding: '7px 0', textAlign: 'center', fontFamily: 'var(--font-assistant,sans-serif)', fontSize: 11, color: '#94897e' }}>
                    חסרים {need} UC
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div style={{ height: 24 }} />
    </main>
  )
}
