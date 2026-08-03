import Link from 'next/link'
import { getCurrentMember, DEMO_MEMBER, memberIdLabel } from '@/lib/member'
import { getRules, TIER_LABELS, TIER_NEXT, TIER_THRESHOLDS } from '@/lib/points'
import { getPendingScans, STALE_PENDING_MS } from '@/lib/reconcile'
import { getRewards } from '../rewards/rewards-data'
import { reasonLabel } from '@/lib/ledger'
import { ArrowLeft2, Whatsapp, Clock, Star1, Crown1, Gift } from 'iconsax-reactjs'

export const dynamic = 'force-dynamic'

/**
 * Self-service help, answered with the member's own data.
 *
 * Built to absorb the questions that would otherwise reach the front desk.
 * Every answer is computed, never a canned paragraph — "why didn't I get
 * coins" names the actual pending check-in and its date, and the earning rules
 * come from point_rules, so changing a rule in the admin changes this screen
 * too and it can't quietly go stale.
 */

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('he-IL', { day: 'numeric', month: 'long' })
}

/** Rules worth explaining, in the order a member meets them. */
const RULE_ORDER = [
  'class_attended', 'happy_hour', 'streak_10',
  'weekly_strong', 'weekly_superstar', 'half_month', 'full_month',
  'social_share', 'referral_trial', 'referral_subscribed',
  'welcome_bonus', 'birthday', 'anniversary',
]

const RULE_HINTS: Record<string, string> = {
  class_attended:      'על כל שיעור שנסרק ואומת',
  happy_hour:          'בשיעורים המסומנים כ-Happy Hour',
  streak_10:           'על כל 10 שיעורים רצופים, בלי ביטול מאוחר',
  weekly_strong:       '4 שיעורים ומעלה באותו שבוע',
  weekly_superstar:    '5 שיעורים ומעלה באותו שבוע — בנוסף לבונוס השבועי',
  half_month:          '8 שיעורים ומעלה בחודש קלנדרי',
  full_month:          '12 שיעורים ומעלה בחודש קלנדרי',
  social_share:        'תיוג הסטודיו בסטורי, פעם בחודש',
  referral_trial:      'חברה שהבאתם הגיעה לשיעור ניסיון',
  referral_subscribed: 'חברה שהבאתם רכשה מנוי',
  welcome_bonus:       'פעם אחת, בכניסה הראשונה לאפליקציה',
  birthday:            'מתנה ביום ההולדת',
  anniversary:         'על כל שנת חברות בסטודיו',
}

function Section({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <details className="clay-sm" style={{ padding: '14px 16px', marginBottom: 10 }}>
      <summary style={{
        cursor: 'pointer', listStyle: 'none',
        fontFamily: 'var(--font-assistant,sans-serif)', fontSize: 14.5, fontWeight: 700,
        color: '#3B2E27',
      }}>
        {q}
      </summary>
      <div style={{
        marginTop: 10, fontSize: 14, lineHeight: 1.65, color: '#6F625A',
        fontFamily: 'var(--font-assistant,sans-serif)',
      }}>
        {children}
      </div>
    </details>
  )
}

export default async function HelpPage() {
  const member = (await getCurrentMember()) ?? DEMO_MEMBER

  const [rules, pending, rewards] = await Promise.all([
    getRules(),
    getPendingScans(member.id),
    getRewards(),
  ])

  const stale = pending.filter(p => Date.now() - new Date(p.created_at).getTime() > STALE_PENDING_MS)
  const affordable = rewards.filter(r => r.cost <= member.total_coins)
  const cheapestLocked = rewards
    .filter(r => r.cost > member.total_coins)
    .sort((a, b) => a.cost - b.cost)[0]

  const qualifying = member.qualifying_coins ?? member.lifetime_coins
  const tierCap = TIER_NEXT[member.tier]
  const toNext = tierCap === Infinity ? 0 : Math.max(0, tierCap - qualifying)
  const tierFloor = member.tier === 'gold' ? TIER_THRESHOLDS.gold : member.tier === 'platinum' ? TIER_THRESHOLDS.platinum : 0
  const belowFloor = Math.max(0, tierFloor - qualifying)
  const nextTier = member.tier === 'silver' ? 'Gold' : member.tier === 'gold' ? 'Platinum' : ''

  const wa = (process.env.STUDIO_WHATSAPP ?? '').replace(/\D/g, '')
  // Hand the desk a message they can act on instead of "it doesn't work".
  const waText = encodeURIComponent(
    `היי, אני ${member.name} (${memberIdLabel(member)}).\n` +
    (pending.length > 0
      ? `יש לי ${pending.length} צ׳ק-אין שממתין לאישור מ-${fmt(pending[pending.length - 1].created_at)}.\n`
      : '') +
    'אשמח לעזרה עם: ',
  )

  return (
    <main className="max-w-md mx-auto" style={{ minHeight: '100dvh', background: '#F1E9E3', paddingBottom: 40 }}>

      <div style={{ padding: '26px 20px 18px' }}>
        <Link href="/profile" style={{
          display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 12,
          fontSize: 14, color: '#A66B43', textDecoration: 'none',
          fontFamily: 'var(--font-assistant,sans-serif)',
        }}>
          <ArrowLeft2 size={15} variant="Linear" color="#A66B43" />
          חזרה
        </Link>
        <h1 style={{ fontFamily: 'var(--font-frank,serif)', fontSize: 30, fontWeight: 900, color: '#3B2E27', lineHeight: 1.15 }}>
          שאלות ותשובות
        </h1>
        <p style={{ fontSize: 14, color: '#7A6B60', marginTop: 5, fontFamily: 'var(--font-assistant,sans-serif)' }}>
          התשובות כאן מותאמות לחשבון שלכם.
        </p>
      </div>

      <div style={{ padding: '0 16px' }}>

        {/* ── Why no coins ─────────────────────────── */}
        <Section q="סרקתי בשיעור — למה לא קיבלתי מטבעות?">
          {pending.length === 0 ? (
            <p>
              אין כרגע צ׳ק-אין שממתין לאישור. אם סרקתם היום, המטבעות כבר אמורים להיות ביתרה —
              בדקו ב<Link href="/history" style={{ color: '#A66B43' }}>היסטוריה</Link>.
              אם סרקתם ולא רואים כלום, ייתכן שהסריקה לא נקלטה — שווה לפנות לצוות.
            </p>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
                <Clock size={16} variant="Bulk" color="#96613F" />
                <strong style={{ color: '#3B2E27' }}>
                  {pending.length === 1 ? 'צ׳ק-אין אחד ממתין' : `${pending.length} צ׳ק-אין ממתינים`}
                </strong>
              </div>
              <p style={{ marginBottom: 8 }}>
                סריקה מאשרת שהייתם בסטודיו, אבל המטבעות נכנסים רק אחרי שהנוכחות מסומנת
                במערכת השיעורים. זה קורה בדרך כלל תוך דקות.
              </p>
              <ul style={{ paddingInlineStart: 18, marginBottom: 8 }}>
                {pending.map(p => (
                  <li key={p.id} style={{ listStyle: 'disc' }}>
                    סריקה מ־{fmt(p.created_at)}
                    {Date.now() - new Date(p.created_at).getTime() > STALE_PENDING_MS && (
                      <span style={{ color: '#B43C3C' }}> · עדיין לא אושרה</span>
                    )}
                  </li>
                ))}
              </ul>
              {stale.length > 0 && (
                <p style={{ color: '#B43C3C' }}>
                  סריקה שלא אושרה תוך יממה בדרך כלל אומרת שהנוכחות לא סומנה בשיעור.
                  זה לא ייפתר מעצמו — פנו לצוות ונסדר.
                </p>
              )}
            </>
          )}
        </Section>

        {/* ── How to earn ──────────────────────────── */}
        <Section q="איך צוברים Urban Coins?">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {RULE_ORDER.filter(k => rules[k] !== undefined).map(k => (
              <div key={k} style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{
                  fontFamily: 'var(--font-frank,serif)', fontSize: 14, fontWeight: 700,
                  color: '#96613F', background: '#FBF1E8', borderRadius: 999,
                  padding: '1px 8px', flexShrink: 0, minWidth: 46, textAlign: 'center',
                }}>
                  +{rules[k]}
                </span>
                <span>
                  <strong style={{ color: '#3B2E27' }}>{reasonLabel(k)}</strong>
                  {RULE_HINTS[k] ? ` — ${RULE_HINTS[k]}` : ''}
                </span>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Tier progress ────────────────────────── */}
        <Section q={`מתי אעלה לדרגה הבאה?`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
            <Crown1 size={16} variant="Bulk" color="#C0906F" />
            <strong style={{ color: '#3B2E27' }}>
              הדרגה שלכם: {TIER_LABELS[member.tier] ?? member.tier}
            </strong>
          </div>
          <p style={{ marginBottom: 8 }}>
            הדרגה נקבעת לפי המטבעות שצברתם ב־<strong>12 החודשים האחרונים</strong> — כרגע{' '}
            <strong style={{ color: '#A66B43' }}>{qualifying}</strong>.
            <br />
            מימוש הטבה <strong>לא</strong> מוריד אתכם: היתרה יורדת, הספירה לדרגה נשארת.
          </p>
          {toNext > 0 ? (
            <p style={{ marginBottom: 8 }}>
              נשארו <strong style={{ color: '#A66B43' }}>{toNext}</strong> מטבעות כדי להגיע ל־{nextTier}.
            </p>
          ) : (
            <p style={{ marginBottom: 8 }}>אתם בדרגה הגבוהה ביותר. כל הכבוד!</p>
          )}
          {member.tier !== 'silver' && (
            belowFloor > 0 ? (
              <p style={{ color: '#B43C3C' }}>
                שימו לב: הספירה שלכם ירדה מתחת לסף הדרגה. חסרים {belowFloor} מטבעות.
                יש לכם 30 יום להשלים אותם לפני שהדרגה תתעדכן.
              </p>
            ) : (
              <p>
                כדי לשמור על הדרגה צריך להישאר מעל {tierFloor} מטבעות ב־12 החודשים האחרונים.
                אם יורדים מתחת, יש 30 יום להשלים לפני שהדרגה משתנה.
              </p>
            )
          )}
        </Section>

        {/* ── What can I redeem ────────────────────── */}
        <Section q="מה אני יכולה לממש עכשיו?">
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
            <Star1 size={16} variant="Bulk" color="#C0906F" />
            <strong style={{ color: '#3B2E27' }}>יתרה זמינה: {member.total_coins} מטבעות</strong>
          </div>
          {affordable.length > 0 ? (
            <>
              <p style={{ marginBottom: 6 }}>
                {affordable.length === 1 ? 'הטבה אחת זמינה לכם:' : `${affordable.length} הטבות זמינות לכם:`}
              </p>
              <ul style={{ paddingInlineStart: 18, marginBottom: 8 }}>
                {affordable.map(r => (
                  <li key={r.id} style={{ listStyle: 'disc' }}>{r.name} · {r.cost} מטבעות</li>
                ))}
              </ul>
            </>
          ) : (
            <p style={{ marginBottom: 8 }}>
              עדיין אין הטבה בטווח היתרה.
              {cheapestLocked && ` הקרובה ביותר היא "${cheapestLocked.name}" — עוד ${cheapestLocked.cost - member.total_coins} מטבעות.`}
            </p>
          )}
          <Link href="/rewards" style={{ color: '#A66B43', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Gift size={14} variant="Linear" color="#A66B43" />
            למסך ההטבות
          </Link>
        </Section>

        {/* ── Login trouble ────────────────────────── */}
        <Section q="החברה שלי לא מצליחה להיכנס לאפליקציה">
          <p>
            האפליקציה מזהה לפי מספר הטלפון כפי שהוא רשום אצלנו במערכת. אם המספר שמור אחרת,
            או שההצטרפות עוד לא נקלטה, ההתחברות לא תמצא אותה.
            <br />
            הצוות בסטודיו מתקן את זה תוך רגע.
          </p>
        </Section>

        {/* ── Still stuck ──────────────────────────── */}
        <div className="clay-sm" style={{ padding: '16px', marginTop: 16, textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: '#6F625A', marginBottom: 12, fontFamily: 'var(--font-assistant,sans-serif)' }}>
            לא מצאתם תשובה?
          </p>
          {wa ? (
            <a href={`https://wa.me/${wa}?text=${waText}`} className="clay-btn" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '13px 0', textDecoration: 'none',
              fontFamily: 'var(--font-assistant,sans-serif)', fontSize: 14.5, fontWeight: 800,
              color: '#3B2E27',
            }}>
              <Whatsapp size={18} variant="Bulk" color="#3f8f5e" />
              כתבו לצוות בוואטסאפ
            </a>
          ) : (
            <p style={{ fontSize: 13.5, color: '#9C8B7F', fontFamily: 'var(--font-assistant,sans-serif)' }}>
              פנו לצוות בסטודיו ונשמח לעזור.
            </p>
          )}
        </div>
      </div>
    </main>
  )
}
