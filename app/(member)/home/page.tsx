import { createServiceClient } from '@/lib/supabase'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import Link from 'next/link'

type Member = {
  name: string
  total_coins: number
  lifetime_coins: number
  tier: 'silver' | 'gold' | 'platinum'
}

async function getMember(): Promise<Member | null> {
  if (
    !process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY.includes('placeholder')
  ) return null
  try {
    const authClient = await createSupabaseServerClient()
    const { data: { user } } = await authClient.auth.getUser()
    if (!user?.phone) return null
    const db = createServiceClient()
    const { data } = await db.from('members')
      .select('name, total_coins, lifetime_coins, tier')
      .eq('phone', user.phone)
      .single()
    return data as Member | null
  } catch { return null }
}

const DEMO: Member = { name: 'מאיה לוי', total_coins: 47, lifetime_coins: 147, tier: 'silver' }

const CHALLENGES = [
  { icon: '/assets/icons/fire.png', title: 'רצף שיעורים', current: 7, goal: 10, reward: '+10 UC', note: 'עוד 3 ברצף' },
  { icon: '/assets/icons/calendar.png', title: 'חודש מלא', current: 8, goal: 12, reward: '+30 UC', note: 'עוד 4 החודש' },
]

const ACTIVITY = [
  { title: 'Reformer · סוקולוב', meta: 'היום · 09:00', delta: 1 },
  { title: 'Happy Hour', meta: 'היום · 07:30', delta: 2 },
  { title: 'בונוס רצף 10 שיעורים', meta: 'אמש', delta: 10 },
  { title: 'הפניית חברה', meta: 'לפני יומיים', delta: 50 },
]

function TierCoin({ tier, size = 22 }: { tier: string; size?: number }) {
  const src =
    tier === 'platinum' ? '/assets/icons/coin-platinum.png'
    : tier === 'gold'   ? '/assets/icons/coin-gold.png'
    :                     '/assets/icons/coin-silver.png'
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" aria-hidden
      style={{ height: size, width: 'auto', objectFit: 'contain', flexShrink: 0,
               filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.25))' }} />
  )
}

export default async function HomePage() {
  const member = (await getMember()) ?? DEMO
  const { name, total_coins, lifetime_coins, tier } = member
  const firstName = name.split(' ')[0]

  const tierCap = tier === 'silver' ? 500 : tier === 'gold' ? 1500 : Infinity
  const tierFloor = tier === 'silver' ? 0 : tier === 'gold' ? 500 : 1500
  const nextTierName = tier === 'silver' ? 'Gold' : tier === 'gold' ? 'Platinum' : ''
  const toNext = tierCap === Infinity ? 0 : tierCap - lifetime_coins
  const progressPct = tierCap === Infinity ? 100 : Math.min(100, ((lifetime_coins - tierFloor) / (tierCap - tierFloor)) * 100)
  const tierLabel = tier === 'platinum' ? 'PLATINUM' : tier === 'gold' ? 'GOLD' : 'SILVER'

  // Arc gauge SVG (semicircle, 180°)
  const R = 68
  const cx = 80, cy = 80
  const arcFrac = progressPct / 100
  // We draw a half-circle arc from left to right (bottom half hidden)
  const halfCirc = Math.PI * R // 180° arc length
  const fillLen = arcFrac * halfCirc

  const arcColor = tier === 'platinum' ? '#c0c0d8' : tier === 'gold' ? '#C0906F' : '#C0906F'

  // Tier perk for next tier
  const nextPerk = tier === 'silver' ? '10% הנחה + כניסה חינם לסדנה מיוחדת כל 3 חודשים' : tier === 'gold' ? '15% הנחה + סדנה חודשית + כרטיסייה VIP' : ''
  const nextPerkTile1 = tier === 'silver' ? '10%' : '15%'
  const nextPerkTile2 = tier === 'silver' ? { value: 'סדנה', label: 'חינם כל 3 חוד׳' } : { value: 'VIP', label: 'כרטיסייה ייחודית' }

  return (
    <main className="max-w-md mx-auto" style={{ minHeight: '100dvh', background: '#F1E9E3' }}>

      {/* ── Dark header ─────────────────────────── */}
      <div style={{
        background: 'linear-gradient(180deg,#5A473C 0%,#3B2E27 100%)',
        overflow: 'hidden', position: 'relative', padding: '20px 20px 28px',
      }}>
        {/* Faded figure illustration on the left side of the header */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/header-figure.jpg" alt="" aria-hidden
          style={{
            position: 'absolute', top: 0, left: 0, height: '100%', width: 'auto',
            opacity: 0.16, pointerEvents: 'none',
            maskImage: 'linear-gradient(90deg, black 55%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(90deg, black 55%, transparent 100%)',
          }}
        />
        {/* Dark overlay to keep text readable */}
        <div aria-hidden style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(180deg, rgba(59,46,39,0.35) 0%, rgba(59,46,39,0.75) 100%)',
        }} />

        {/* Greeting + tier chip */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <p style={{ fontSize: 13, color: 'rgba(245,240,230,0.5)', marginBottom: 2, fontFamily: 'var(--font-assistant,sans-serif)' }}>ערב טוב,</p>
            <p style={{ fontFamily: 'var(--font-frank,serif)', fontSize: 24, fontWeight: 700, color: '#F6EFEA', lineHeight: 1.1 }}>{firstName} {name.split(' ')[1]}</p>
          </div>
          {/* Tier chip */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
            borderRadius: 999, border: '1px solid rgba(192,144,111,0.45)',
            background: 'rgba(255,255,255,0.05)',
          }}>
            <TierCoin tier={tier} size={30} />
            <span style={{ fontFamily: 'var(--font-frank,serif)', fontSize: 12, color: arcColor, letterSpacing: '0.12em' }}>{tierLabel}</span>
          </div>
        </div>

        {/* Arc gauge */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <svg width="160" height="90" viewBox="0 0 160 90" style={{ overflow: 'visible' }}>
            {/* Track: half circle, left→right, top */}
            <path
              d={`M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`}
              fill="none"
              stroke="rgba(255,255,255,0.10)"
              strokeWidth="11"
              strokeLinecap="round"
            />
            {/* Progress fill */}
            {fillLen > 0 && (() => {
              // Parametric end point on the semicircle (left→right sweep)
              const px = cx + R * Math.cos(Math.PI - arcFrac * Math.PI)
              const py = cy - R * Math.sin(arcFrac * Math.PI)
              const largeArc = arcFrac > 0.5 ? 1 : 0
              return (
                <path
                  d={`M ${cx - R} ${cy} A ${R} ${R} 0 ${largeArc} 1 ${px.toFixed(2)} ${py.toFixed(2)}`}
                  fill="none"
                  stroke={arcColor}
                  strokeWidth="11"
                  strokeLinecap="round"
                  style={{ filter: `drop-shadow(0 0 6px ${arcColor}99)` }}
                />
              )
            })()}
            {/* Center number */}
            <text x={cx} y={cy - 8} textAnchor="middle"
              fontFamily="var(--font-frank,serif)" fontSize="42" fontWeight="900" fill="#FBF6F2">
              {lifetime_coins}
            </text>
            <text x={cx} y={cy + 8} textAnchor="middle"
              fontSize="10" fill="rgba(192,144,111,0.7)" letterSpacing="2"
              fontFamily="var(--font-assistant,sans-serif)">
              UC · סטטוס
            </text>
            {/* Labels */}
            <text x={cx - R - 4} y={cy + 16} textAnchor="end"
              fontSize="9" fill="rgba(245,240,230,0.4)" fontFamily="var(--font-assistant,sans-serif)">
              SILVER
            </text>
            <text x={cx + R + 4} y={cy + 16} textAnchor="start"
              fontSize="9" fill="rgba(192,144,111,0.7)" fontFamily="var(--font-assistant,sans-serif)">
              {nextTierName.toUpperCase()}
            </text>
          </svg>

          {/* To next label */}
          {toNext > 0 && (
            <p style={{ fontSize: 12, color: 'rgba(245,240,230,0.55)', marginTop: 4, fontFamily: 'var(--font-assistant,sans-serif)' }}>
              עוד <strong style={{ color: arcColor }}>{toNext} UC</strong> ל‑{nextTierName} ✦
            </p>
          )}
        </div>

      </div>

      {/* ── Available UC card (gold) ─────────────── */}
      <div style={{ padding: '16px 16px 0' }}>
        <div style={{
          background: 'linear-gradient(135deg,#DBB89C 0%,#C0906F 100%)',
          borderRadius: 20, padding: '18px 20px',
          boxShadow: '0 14px 28px -12px rgba(192,144,111,.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <p style={{ fontSize: 11, color: 'rgba(40,30,10,0.6)', letterSpacing: '0.08em', marginBottom: 2, fontFamily: 'var(--font-assistant,sans-serif)' }}>זמין למימוש</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{ fontFamily: 'var(--font-frank,serif)', fontSize: 52, fontWeight: 900, color: '#3B2E27', lineHeight: 1 }}>{total_coins}</span>
              <span style={{ fontFamily: 'var(--font-frank,serif)', fontSize: 20, color: 'rgba(40,30,10,0.65)' }}>UC</span>
            </div>
          </div>
          <Link href="/rewards">
            <div style={{
              background: '#3B2E27', borderRadius: 999, padding: '10px 18px',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span style={{ fontFamily: 'var(--font-assistant,sans-serif)', fontSize: 13, fontWeight: 700, color: '#DBB89C' }}>מימוש ←</span>
            </div>
          </Link>
        </div>
      </div>

      {/* ── Tier progress card ───────────────────── */}
      {tierCap !== Infinity && (
        <div style={{ padding: '12px 16px 0' }}>
          <div style={{
            background: '#ffffff', borderRadius: 20, padding: '16px 18px',
            border: '1px solid rgba(192,144,111,0.2)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <p style={{ fontFamily: 'var(--font-frank,serif)', fontSize: 16, fontWeight: 700, color: '#3B2E27' }}>המסלול ל‑{nextTierName}</p>
              <p style={{ fontFamily: 'var(--font-frank,serif)', fontSize: 14, color: '#6F625A' }}>
                <span style={{ color: '#C0906F', fontWeight: 700 }}>{lifetime_coins}</span> / {tierCap}
              </p>
            </div>
            {/* Progress bar */}
            <div style={{ height: 6, borderRadius: 999, background: '#F3EAE3', marginBottom: 10 }}>
              <div style={{ height: '100%', borderRadius: 999, width: `${progressPct}%`, background: 'linear-gradient(90deg,#DBB89C,#C0906F)' }} />
            </div>
            {/* Labels */}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, color: '#9C8B7F', fontFamily: 'var(--font-assistant,sans-serif)' }}>SILVER · {tierFloor}</span>
              <span style={{ fontSize: 11, color: '#C0906F', fontFamily: 'var(--font-assistant,sans-serif)' }}>{nextTierName.toUpperCase()} · {tierCap}</span>
            </div>
            {/* Perk preview */}
            {nextPerk && (
              <div style={{ marginTop: 12, display: 'flex', gap: 16 }}>
                <div style={{ flex: 1, textAlign: 'center', background: '#FBF6F2', borderRadius: 12, padding: '8px 4px' }}>
                  <p style={{ fontFamily: 'var(--font-frank,serif)', fontSize: 16, fontWeight: 700, color: '#C0906F' }}>{nextPerkTile1}</p>
                  <p style={{ fontSize: 10, color: '#9C8B7F', fontFamily: 'var(--font-assistant,sans-serif)' }}>הנחה קבועה</p>
                </div>
                <div style={{ flex: 1, textAlign: 'center', background: '#FBF6F2', borderRadius: 12, padding: '8px 4px' }}>
                  <p style={{ fontFamily: 'var(--font-frank,serif)', fontSize: 16, fontWeight: 700, color: '#C0906F' }}>{nextPerkTile2.value}</p>
                  <p style={{ fontSize: 10, color: '#9C8B7F', fontFamily: 'var(--font-assistant,sans-serif)' }}>{nextPerkTile2.label}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Active challenges ────────────────────── */}
      <div style={{ padding: '20px 16px 0' }}>
        <p style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9C8B7F', marginBottom: 10, fontFamily: 'var(--font-assistant,sans-serif)' }}>אתגרים פעילים</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {CHALLENGES.map(ch => (
            <div key={ch.title} style={{
              background: '#ffffff', borderRadius: 18, padding: '14px 14px 12px',
              border: '1px solid rgba(192,144,111,0.15)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={ch.icon} alt="" aria-hidden style={{ height: 42, width: 'auto', objectFit: 'contain' }} />
                <span style={{
                  fontSize: 11, fontWeight: 700, color: '#96613F',
                  background: '#FBF1E8', borderRadius: 999, padding: '2px 8px',
                  fontFamily: 'var(--font-assistant,sans-serif)',
                }}>{ch.reward}</span>
              </div>
              <p style={{ fontFamily: 'var(--font-assistant,sans-serif)', fontSize: 13, fontWeight: 700, color: '#3B2E27', marginBottom: 8 }}>{ch.title}</p>
              <div style={{ height: 4, borderRadius: 999, background: '#F3EAE3', marginBottom: 6 }}>
                <div style={{ height: '100%', borderRadius: 999, background: 'linear-gradient(90deg,#DBB89C,#C0906F)', width: `${Math.round((ch.current / ch.goal) * 100)}%` }} />
              </div>
              <p style={{ fontSize: 11, color: '#9C8B7F', fontFamily: 'var(--font-assistant,sans-serif)' }}>{ch.current} / {ch.goal} · {ch.note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Recent activity ──────────────────────── */}
      <div style={{ padding: '20px 16px 100px' }}>
        <p style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9C8B7F', marginBottom: 10, fontFamily: 'var(--font-assistant,sans-serif)' }}>פעילות אחרונה</p>
        <div style={{ background: '#ffffff', borderRadius: 18, overflow: 'hidden', border: '1px solid rgba(192,144,111,0.15)' }}>
          {ACTIVITY.map((a, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 16px',
              borderBottom: i < ACTIVITY.length - 1 ? '1px solid #F3EAE3' : undefined,
            }}>
              <div>
                <p style={{ fontFamily: 'var(--font-assistant,sans-serif)', fontSize: 13, fontWeight: 600, color: '#3B2E27' }}>{a.title}</p>
                <p style={{ fontFamily: 'var(--font-assistant,sans-serif)', fontSize: 11, color: '#9C8B7F' }}>{a.meta}</p>
              </div>
              <span style={{ fontFamily: 'var(--font-frank,serif)', fontSize: 16, fontWeight: 700, color: '#3f8f5e' }}>+{a.delta}</span>
            </div>
          ))}
        </div>
      </div>

    </main>
  )
}
