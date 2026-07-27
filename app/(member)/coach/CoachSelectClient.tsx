'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveCoach, type CoachId } from './actions'
import { ArrowLeft2, TickCircle } from 'iconsax-reactjs'

type Coach = { id: CoachId; name: string; tagline: string }

const COACHES: Coach[] = [
  { id: 'maya', name: 'מאיה', tagline: 'רגועה ותומכת — נוכחות מרגיעה שמלווה אותך בעדינות' },
  { id: 'sara', name: 'שרה', tagline: 'אנרגיה ים-תיכונית — נלהבת, ישירה ומדבקת' },
  { id: 'idan', name: 'עידן', tagline: 'הדוחף שלך — נחוש, ממוקד ומעודד' },
]

export default function CoachSelectClient({ current }: { current: CoachId }) {
  const [selected, setSelected] = useState<CoachId>(current)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const router = useRouter()

  async function confirm() {
    setSaving(true)
    try { localStorage.setItem('urban-coach', selected) } catch { /* ignore */ }
    await saveCoach(selected)  // best-effort DB persist
    setSaving(false)
    setSaved(true)
    setTimeout(() => router.push('/home'), 900)
  }

  return (
    <main className="max-w-md mx-auto" style={{ minHeight: '100dvh', background: '#F1E9E3', paddingBottom: 110 }}>

      {/* ── Hero ─────────────────────────────────── */}
      <div style={{
        position: 'relative', overflow: 'hidden', padding: '30px 22px 24px', textAlign: 'right',
        background: 'linear-gradient(160deg,#FBF4EE 0%,#F0E2D6 100%)',
        borderBottom: '1px solid rgba(192,144,111,0.18)',
      }}>
        <p style={{ fontSize: 11, color: '#A66B43', letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 6, fontFamily: 'var(--font-assistant,sans-serif)' }}>
          מאמן/ת אישי/ת
        </p>
        <h1 style={{ fontFamily: 'var(--font-frank,serif)', fontSize: 30, fontWeight: 900, color: '#3B2E27', lineHeight: 1.15, marginBottom: 6 }}>
          בחרו את המלווה שלכם
        </h1>
        <p style={{ fontSize: 13, color: '#7A6B60', fontFamily: 'var(--font-assistant,sans-serif)' }}>
          הדמות שתלווה אתכם במסע — תעודד ברצף, תחגוג הישגים ותהיה שם גם בימים פחות קלים.
        </p>
      </div>

      {/* ── Coach cards ──────────────────────────── */}
      <div style={{ padding: '18px 16px 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {COACHES.map(c => {
          const active = selected === c.id
          return (
            <button
              key={c.id}
              onClick={() => setSelected(c.id)}
              aria-pressed={active}
              className="clay-sm"
              style={{
                display: 'flex', alignItems: 'stretch', gap: 14, textAlign: 'right',
                padding: 10, cursor: 'pointer', width: '100%',
                background: active ? 'rgba(226,196,172,0.55)' : undefined,
                border: active ? '2px solid #C0906F' : undefined,
                transition: 'all .18s ease',
              }}
            >
              {/* Portrait */}
              <div style={{
                position: 'relative', width: 104, flexShrink: 0, borderRadius: 16, overflow: 'hidden',
                background: 'linear-gradient(160deg,#3B2E27,#241C17)',
              }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/coaches/${c.id}.jpg`} alt={c.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
                {active && (
                  <div style={{
                    position: 'absolute', top: 6, insetInlineEnd: 6,
                    width: 24, height: 24, borderRadius: 999,
                    background: 'linear-gradient(135deg,#DBB89C,#C0906F)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 6px rgba(59,46,39,0.35)',
                  }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#3B2E27" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>
                )}
              </div>
              {/* Text */}
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingInline: '2px 6px' }}>
                <p style={{ fontFamily: 'var(--font-frank,serif)', fontSize: 22, fontWeight: 700, color: '#3B2E27', marginBottom: 4 }}>{c.name}</p>
                <p style={{ fontSize: 13, lineHeight: 1.55, color: '#6F625A', fontFamily: 'var(--font-assistant,sans-serif)' }}>{c.tagline}</p>
              </div>
            </button>
          )
        })}
      </div>

      {/* ── Sticky confirm ───────────────────────── */}
      <div style={{
        position: 'fixed', left: 12, right: 12, bottom: 16, zIndex: 40,
        maxWidth: 420, margin: '0 auto',
      }}>
        <button
          onClick={confirm}
          disabled={saving || saved}
          className="clay-btn"
          style={{
            width: '100%', padding: '16px 0',
            fontFamily: 'var(--font-assistant,sans-serif)', fontSize: 16, fontWeight: 800,
            cursor: saving ? 'default' : 'pointer',
            background: saved ? 'linear-gradient(135deg,#8FbF9f,#3f8f5e)' : undefined,
            opacity: saving ? 0.7 : 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          {saved ? (
            <><TickCircle size={19} variant="Bulk" color="#3B2E27" />המאמן/ת נבחר/ה!</>
          ) : saving ? '...' : (
            <>בחרתי ב{COACHES.find(c => c.id === selected)?.name}<ArrowLeft2 size={17} variant="Linear" color="#3B2E27" /></>
          )}
        </button>
      </div>
    </main>
  )
}
