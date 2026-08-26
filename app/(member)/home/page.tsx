import Link from 'next/link'
import { ArrowLeft2, Star1, Flash, CalendarTick, Instagram, Profile2User } from 'iconsax-reactjs'
import { getCurrentMember, DEMO_MEMBER } from '@/lib/member'
import { getLedger, countClassesThisMonth, reasonLabel } from '@/lib/ledger'
import { getRules, TIER_THRESHOLDS } from '@/lib/points'
import { getCoachView } from '@/lib/coach'
import { withAnimatedPose } from '@/lib/coach-assets'
import CoachCard from '@/components/CoachCard'
import CountUp from '@/components/CountUp'
import { reconcileMember, getPendingScans, STALE_PENDING_MS } from '@/lib/reconcile'
import { getLeaderboard } from '@/lib/leaderboard'
import Leaderboard from '@/components/Leaderboard'
import TourGuide from '@/components/TourGuide'
import { Clock, InfoCircle } from 'iconsax-reactjs'

export const dynamic = 'force-dynamic'

const STREAK_GOAL = 10
const MONTH_GOAL = 12

// The two earning routes that have no other way in — /share was only reachable
// from /referrals, and nothing linked to /referrals at all.
const EARN = [
  { Icon: Instagram, title: 'שיתוף סטורי', href: '/share', reward: '+2 UC', note: 'תייגו אותנו בסטורי ושלחו צילום מסך' },
  { Icon: Profile2User, title: 'חבר מביא חבר', href: '/referrals', reward: '+50 UC', note: 'שתפו את הקוד האישי שלכם' },
]

/** "היום · 09:00", "אמש · 19:30", otherwise "12 ביולי · 09:00". */
function activityMeta(iso: string): string {
  const d = new Date(iso)
  const time = d.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)
  const daysAgo = Math.floor((startOfToday.getTime() - d.getTime()) / 86400000) + 1
  const day =
    daysAgo <= 0 ? 'היום'
    : daysAgo === 1 ? 'אמש'
    : d.toLocaleDateString('he-IL', { day: 'numeric', month: 'long' })
  return `${day} · ${time}`
}

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
  let member = (await getCurrentMember()) ?? DEMO_MEMBER

  // A scan waits for Arbox to confirm the class. Try to close that out now
  // rather than leaving it to tonight's cron, and re-read the member if it
  // paid, so the balance on screen already includes it.
  const reconciled = await reconcileMember(member.id)
  if (reconciled.awarded > 0) member = (await getCurrentMember()) ?? member

  const pending = await getPendingScans(member.id)
  const stalePending = pending.filter(
    (p) => Date.now() - new Date(p.created_at).getTime() > STALE_PENDING_MS,
  ).length

  const { name, total_coins, lifetime_coins, tier } = member
  const firstName = name.split(' ')[0]

  // Both forms of the pose: the animated one plays, the static one holds the
  // layout until the figure scrolls into view. See components/CoachFigure.
  const coachView = getCoachView(member)

  const [rules, ledger, classesThisMonth, leaderboard] = await Promise.all([
    getRules(),
    getLedger(member.id, 4),
    countClassesThisMonth(member.id),
    getLeaderboard(member.id),
  ])

  const streak = member.current_streak ?? 0
  const CHALLENGES = [
    {
      Icon: Flash, title: 'רצף שיעורים',
      current: Math.min(streak, STREAK_GOAL), goal: STREAK_GOAL,
      reward: `+${rules['streak_10'] ?? 10} UC`,
      note: streak >= STREAK_GOAL ? 'הושלם!' : `עוד ${STREAK_GOAL - streak} ברצף`,
    },
    {
      Icon: CalendarTick, title: 'חודש מלא',
      current: Math.min(classesThisMonth, MONTH_GOAL), goal: MONTH_GOAL,
      reward: `+${rules['full_month'] ?? 30} UC`,
      note: classesThisMonth >= MONTH_GOAL ? 'הושלם!' : `עוד ${MONTH_GOAL - classesThisMonth} החודש`,
    },
  ]

  // Tier tracks the rolling 12-month total, not the all-time one — coins age
  // out of it, which is what allows a tier to fall.
  const qualifying = member.qualifying_coins ?? lifetime_coins
  const tierCap = tier === 'silver' ? TIER_THRESHOLDS.gold : tier === 'gold' ? TIER_THRESHOLDS.platinum : Infinity
  const tierFloor = tier === 'silver' ? 0 : tier === 'gold' ? TIER_THRESHOLDS.gold : TIER_THRESHOLDS.platinum
  const nextTierName = tier === 'silver' ? 'Gold' : tier === 'gold' ? 'Platinum' : ''
  const toNext = tierCap === Infinity ? 0 : Math.max(0, tierCap - qualifying)
  const progressPct = tierCap === Infinity ? 100 : Math.min(100, Math.max(0, ((qualifying - tierFloor) / (tierCap - tierFloor)) * 100))
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
  // What the next tier actually unlocks — the gold-gated rewards, not display
  // promises. Anything shown here must exist in the rewards catalog.
  const nextPerk = tier === 'silver'
  const nextPerkTile1 = { value: '10%', label: 'הנחה על החידוש הבא' }
  const nextPerkTile2 = { value: 'VIP', label: 'שריון שבועיים מראש' }

  return (
    <main className="max-w-md mx-auto" style={{ minHeight: '100dvh', background: '#F1E9E3' }}>

      {/* ── Full-bleed hero ─────────────────────── */}
      <div style={{ position: 'relative', height: 360, overflow: 'hidden' }}>
        {/* Hero photo (placeholder — swap for upgraded portrait) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/header-figure.jpg" alt="" aria-hidden
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center 22%', pointerEvents: 'none',
          }}
        />
        {/* Warm scrim: darker at top for legible greeting, fades to page bg at the bottom */}
        <div aria-hidden style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(180deg, rgba(59,46,39,0.42) 0%, rgba(59,46,39,0.08) 26%, rgba(59,46,39,0) 46%, rgba(241,233,227,0.55) 82%, #F1E9E3 100%)',
        }} />

        {/* Greeting + tier chip (overlaid on the photo) */}
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '22px 20px' }}>
          <div style={{ textShadow: '0 1px 10px rgba(30,20,14,0.45)' }}>
            <p style={{ fontSize: 14, color: 'rgba(246,239,234,0.8)', marginBottom: 2, fontFamily: 'var(--font-assistant,sans-serif)' }}>ערב טוב,</p>
            <p style={{ fontFamily: 'var(--font-frank,serif)', fontSize: 26, fontWeight: 700, color: '#FBF6F2', lineHeight: 1.1 }}>{firstName} {name.split(' ')[1]}</p>
          </div>
          {/* Glass tier chip */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
            borderRadius: 999, border: '1px solid rgba(255,255,255,0.4)',
            background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          }}>
            <TierCoin tier={tier} size={30} />
            <span style={{ fontFamily: 'var(--font-frank,serif)', fontSize: 13, color: '#FBF6F2', letterSpacing: '0.12em' }}>{tierLabel}</span>
          </div>
        </div>
      </div>

      {/* ── Clay stats card (overlaps the hero) ── */}
      <div className="clay" data-tour="status" style={{
        position: 'relative', zIndex: 3, margin: '-78px 16px 0',
        padding: '14px 18px 18px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>
        {/* Height covers the SILVER/GOLD labels at cy+16 (=96) plus descender
            room — the box previously stopped at 90 and relied on overflow to
            show them, which let them bleed into the "toNext" line below. */}
        <svg width="160" height="104" viewBox="0 0 160 104" style={{ overflow: 'visible' }}>
          {/* Track: half circle, left→right, top */}
          <path
            d={`M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`}
            fill="none"
            stroke="rgba(59,46,39,0.12)"
            strokeWidth="11"
            strokeLinecap="round"
          />
          {/* Progress fill.
              Drawn as the FULL half-circle and clipped with stroke-dasharray,
              so the sweep-in can be pure CSS (see .gauge-fill in globals.css):
              the dash animates from 0 to its final length on load. An earlier
              version computed the partial arc endpoint instead — same pixels
              at rest, but a path's shape can't be transitioned. */}
          {fillLen > 0 && (
            <path
              className="gauge-fill"
              d={`M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`}
              fill="none"
              stroke={arcColor}
              strokeWidth="11"
              strokeLinecap="round"
              style={{
                filter: `drop-shadow(0 0 6px ${arcColor}99)`,
                strokeDasharray: `${fillLen.toFixed(1)} ${halfCirc.toFixed(1)}`,
              }}
            />
          )}
          {/* Center number — counts up in step with the arc sweeping in */}
          <text x={cx} y={cy - 8} textAnchor="middle"
            fontFamily="var(--font-frank,serif)" fontSize="42" fontWeight="900" fill="#3B2E27">
            <CountUp value={qualifying} />
          </text>
          <text x={cx} y={cy + 8} textAnchor="middle"
            fontSize="11.5" fill="#A66B43" letterSpacing="2"
            fontFamily="var(--font-assistant,sans-serif)">
            UC · סטטוס
          </text>
          {/* Labels */}
          <text x={cx - R - 4} y={cy + 16} textAnchor="end"
            fontSize="11" fill="#9C8B7F" fontFamily="var(--font-assistant,sans-serif)">
            SILVER
          </text>
          <text x={cx + R + 4} y={cy + 16} textAnchor="start"
            fontSize="11" fill="#A66B43" fontFamily="var(--font-assistant,sans-serif)">
            {nextTierName.toUpperCase()}
          </text>
        </svg>

        {/* To next label */}
        {toNext > 0 && (
          <p style={{
            display: 'flex', alignItems: 'center', gap: 5, direction: 'rtl',
            fontSize: 13, color: '#7A6B60', marginTop: 2, fontFamily: 'var(--font-assistant,sans-serif)',
          }}>
            <Star1 size={13} variant="Bulk" color="#C0906F" />
            עוד <strong style={{ color: '#A66B43' }}>{toNext} UC</strong> ל‑{nextTierName}
          </p>
        )}
      </div>

      {/* ── Available UC card (gold) ─────────────── */}
      <div style={{ padding: '16px 16px 0' }}>
        <div data-tour="balance" style={{
          background: 'linear-gradient(135deg,#DBB89C 0%,#C0906F 100%)',
          borderRadius: 26, padding: '18px 20px',
          boxShadow: [
            '0 16px 30px -12px rgba(139,100,74,0.55)',
            'inset 0 5px 10px -3px rgba(255,255,255,0.6)',
            'inset 0 -7px 14px -6px rgba(120,85,62,0.4)',
          ].join(','),
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <p style={{ fontSize: 12.5, color: 'rgba(40,30,10,0.6)', letterSpacing: '0.08em', marginBottom: 2, fontFamily: 'var(--font-assistant,sans-serif)' }}>זמין למימוש</p>
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
              <span style={{ fontFamily: 'var(--font-assistant,sans-serif)', fontSize: 14, fontWeight: 700, color: '#DBB89C' }}>מימוש</span>
              <ArrowLeft2 size={15} variant="Linear" color="#DBB89C" />
            </div>
          </Link>
        </div>
      </div>

      {/* ── Pending check-ins ────────────────────── */}
      {pending.length > 0 && (
        <div style={{ padding: '12px 16px 0' }}>
          <div className="clay-sm" style={{ padding: '12px 14px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', flexShrink: 0, marginTop: 1,
              background: stalePending > 0 ? 'rgba(180,60,60,0.10)' : 'linear-gradient(150deg,#FBF1E8,#DBB89C)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {stalePending > 0
                ? <InfoCircle size={17} variant="Bulk" color="#B43C3C" />
                : <Clock size={17} variant="Bulk" color="#96613F" />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontFamily: 'var(--font-assistant,sans-serif)', fontSize: 14, fontWeight: 700, color: '#3B2E27', marginBottom: 2 }}>
                {pending.length === 1 ? 'צ׳ק-אין אחד ממתין לאישור' : `${pending.length} צ׳ק-אין ממתינים לאישור`}
              </p>
              <p style={{ fontFamily: 'var(--font-assistant,sans-serif)', fontSize: 13, color: '#9C8B7F', lineHeight: 1.45 }}>
                {stalePending > 0
                  ? 'הנוכחות עדיין לא סומנה במערכת השיעורים. שווה לפנות לצוות הסטודיו.'
                  : 'המטבעות ייכנסו ברגע שהנוכחות תסומן במערכת השיעורים.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Coach ────────────────────────────────── */}
      <div style={{ paddingTop: 18 }}>
        <CoachCard view={withAnimatedPose(coachView)} poster={coachView.image} />
      </div>

      {/* ── Ways to earn ─────────────────────────── */}
      <div style={{ padding: '20px 16px 0' }}>
        <p style={{ fontSize: 12.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9C8B7F', marginBottom: 10, fontFamily: 'var(--font-assistant,sans-serif)' }}>איך צוברים עוד</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {EARN.map(e => (
            <Link key={e.href} href={e.href} className="clay-sm" style={{
              padding: '14px 14px 12px', display: 'block', textDecoration: 'none',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(150deg,#FBF1E8,#DBB89C)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 3px 10px rgba(192,144,111,0.25)',
                }}>
                  <e.Icon size={20} variant="Bulk" color="#96613F" />
                </div>
                <span style={{
                  fontSize: 12.5, fontWeight: 700, color: '#96613F',
                  background: '#FBF1E8', borderRadius: 999, padding: '2px 8px',
                  fontFamily: 'var(--font-assistant,sans-serif)',
                }}>{e.reward}</span>
              </div>
              <p style={{ fontFamily: 'var(--font-assistant,sans-serif)', fontSize: 14, fontWeight: 700, color: '#3B2E27', marginBottom: 3 }}>{e.title}</p>
              <p style={{ fontSize: 12.5, color: '#9C8B7F', fontFamily: 'var(--font-assistant,sans-serif)', lineHeight: 1.35 }}>{e.note}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Tier progress card ───────────────────── */}
      {tierCap !== Infinity && (
        <div style={{ padding: '12px 16px 0' }}>
          <div className="clay-sm" style={{ padding: '16px 18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <p style={{ fontFamily: 'var(--font-frank,serif)', fontSize: 16, fontWeight: 700, color: '#3B2E27' }}>המסלול ל‑{nextTierName}</p>
              <p style={{ fontFamily: 'var(--font-frank,serif)', fontSize: 14.5, color: '#6F625A' }}>
                <span style={{ color: '#C0906F', fontWeight: 700 }}>{qualifying}</span> / {tierCap}
              </p>
            </div>
            {/* Progress bar */}
            <div className="clay-track" style={{ height: 6, marginBottom: 10 }}>
              <div style={{ height: '100%', borderRadius: 999, width: `${progressPct}%`, background: 'linear-gradient(90deg,#DBB89C,#C0906F)' }} />
            </div>
            {/* Labels */}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12.5, color: '#9C8B7F', fontFamily: 'var(--font-assistant,sans-serif)' }}>SILVER · {tierFloor}</span>
              <span style={{ fontSize: 12.5, color: '#C0906F', fontFamily: 'var(--font-assistant,sans-serif)' }}>{nextTierName.toUpperCase()} · {tierCap}</span>
            </div>
            {/* Perk preview */}
            {nextPerk && (
              <div style={{ marginTop: 12, display: 'flex', gap: 16 }}>
                <div className="clay-inset" style={{ flex: 1, textAlign: 'center', padding: '8px 4px' }}>
                  <p style={{ fontFamily: 'var(--font-frank,serif)', fontSize: 16, fontWeight: 700, color: '#C0906F' }}>{nextPerkTile1.value}</p>
                  <p style={{ fontSize: 12, color: '#9C8B7F', fontFamily: 'var(--font-assistant,sans-serif)' }}>{nextPerkTile1.label}</p>
                </div>
                <div className="clay-inset" style={{ flex: 1, textAlign: 'center', padding: '8px 4px' }}>
                  <p style={{ fontFamily: 'var(--font-frank,serif)', fontSize: 16, fontWeight: 700, color: '#C0906F' }}>{nextPerkTile2.value}</p>
                  <p style={{ fontSize: 12, color: '#9C8B7F', fontFamily: 'var(--font-assistant,sans-serif)' }}>{nextPerkTile2.label}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Monthly leaderboard ──────────────────── */}
      <Leaderboard data={leaderboard} />

      {/* ── Active challenges ────────────────────── */}
      <div style={{ padding: '20px 16px 0' }}>
        <p style={{ fontSize: 12.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9C8B7F', marginBottom: 10, fontFamily: 'var(--font-assistant,sans-serif)' }}>אתגרים פעילים</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {CHALLENGES.map(ch => (
            <div key={ch.title} className="clay-sm" style={{ padding: '14px 14px 12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(150deg,#FBF1E8,#DBB89C)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 3px 10px rgba(192,144,111,0.25)',
                }}>
                  <ch.Icon size={20} variant="Bulk" color="#96613F" />
                </div>
                <span style={{
                  fontSize: 12.5, fontWeight: 700, color: '#96613F',
                  background: '#FBF1E8', borderRadius: 999, padding: '2px 8px',
                  fontFamily: 'var(--font-assistant,sans-serif)',
                }}>{ch.reward}</span>
              </div>
              <p style={{ fontFamily: 'var(--font-assistant,sans-serif)', fontSize: 14, fontWeight: 700, color: '#3B2E27', marginBottom: 8 }}>{ch.title}</p>
              <div className="clay-track" style={{ height: 4, marginBottom: 6 }}>
                <div style={{ height: '100%', borderRadius: 999, background: 'linear-gradient(90deg,#DBB89C,#C0906F)', width: `${Math.round((ch.current / ch.goal) * 100)}%` }} />
              </div>
              <p style={{ fontSize: 12.5, color: '#9C8B7F', fontFamily: 'var(--font-assistant,sans-serif)' }}>{ch.current} / {ch.goal} · {ch.note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Recent activity ──────────────────────── */}
      <div style={{ padding: '20px 16px 100px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
          <p style={{ fontSize: 12.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9C8B7F', fontFamily: 'var(--font-assistant,sans-serif)' }}>פעילות אחרונה</p>
          {ledger.length > 0 && (
            <Link href="/history" style={{ fontSize: 13, color: '#A66B43', textDecoration: 'none', fontFamily: 'var(--font-assistant,sans-serif)' }}>הכל</Link>
          )}
        </div>
        <div className="clay-sm" style={{ overflow: 'hidden' }}>
          {ledger.length === 0 && (
            <p style={{ padding: '22px 16px', textAlign: 'center', fontSize: 13.5, color: '#9C8B7F', lineHeight: 1.5, fontFamily: 'var(--font-assistant,sans-serif)' }}>
              עדיין אין תנועות. השיעור הבא שלכם יופיע כאן.
            </p>
          )}
          {ledger.map((a, i) => {
            const className = typeof a.metadata?.class_name === 'string' ? a.metadata.class_name : null
            const note = typeof a.metadata?.note === 'string' ? a.metadata.note : null
            return (
              <div key={a.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 16px',
                borderBottom: i < ledger.length - 1 ? '1px solid #F3EAE3' : undefined,
              }}>
                <div>
                  <p style={{ fontFamily: 'var(--font-assistant,sans-serif)', fontSize: 14, fontWeight: 600, color: '#3B2E27' }}>
                    {className ?? note ?? reasonLabel(a.reason)}
                  </p>
                  <p style={{ fontFamily: 'var(--font-assistant,sans-serif)', fontSize: 12.5, color: '#9C8B7F' }}>{activityMeta(a.created_at)}</p>
                </div>
                <span style={{ fontFamily: 'var(--font-frank,serif)', fontSize: 16, fontWeight: 700, color: a.points > 0 ? '#3f8f5e' : '#c04040' }}>
                  {a.points > 0 ? '+' : ''}{a.points}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <TourGuide />
    </main>
  )
}
