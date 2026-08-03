import type { Metadata } from 'next'
import Link from 'next/link'
import { TERMS_SECTIONS, TERMS_UPDATED } from '@/lib/terms'

/**
 * Public, linkable terms.
 *
 * Deliberately outside the (member) group and absent from the proxy matcher:
 * a prospective member has to be able to read what they're agreeing to before
 * they have an account, and the studio needs a URL it can paste into WhatsApp.
 */
export const metadata: Metadata = {
  title: 'תקנון ותנאי שימוש · Urban Studio Club',
  description: 'תקנון ותנאי השימוש של מועדון הלקוחות של Urban Pilates Group',
}

export default function TermsPage() {
  return (
    <main className="max-w-md mx-auto" style={{ minHeight: '100dvh', background: '#F1E9E3' }}>
      <div style={{
        padding: '28px 22px 22px', textAlign: 'center',
        background: 'linear-gradient(160deg,#FBF4EE 0%,#F0E2D6 100%)',
        borderBottom: '1px solid rgba(192,144,111,0.18)',
      }}>
        <p style={{
          fontSize: 12.5, color: '#A66B43', letterSpacing: '0.22em',
          textTransform: 'uppercase', marginBottom: 8, fontFamily: 'var(--font-assistant,sans-serif)',
        }}>
          Urban Club
        </p>
        <h1 style={{
          fontFamily: 'var(--font-frank,serif)', fontSize: 27, fontWeight: 900,
          color: '#3B2E27', lineHeight: 1.2,
        }}>
          תקנון ותנאי שימוש
        </h1>
        <p style={{ fontSize: 13.5, color: '#7A6B60', marginTop: 6, fontFamily: 'var(--font-assistant,sans-serif)' }}>
          מועדון הלקוחות של אורבן פילאטיס גרופ בע״מ
        </p>
        <p style={{ fontSize: 13, color: '#9C8B7F', marginTop: 4, fontFamily: 'var(--font-assistant,sans-serif)' }}>
          עודכן: {TERMS_UPDATED}
        </p>
      </div>

      <div style={{ padding: '18px 16px 0' }}>
        <div className="clay-sm" style={{ padding: '18px 20px' }}>
          {TERMS_SECTIONS.map((sec, si) => (
            <section key={sec.title} style={{ marginBottom: si === TERMS_SECTIONS.length - 1 ? 0 : 22 }}>
              <h2 style={{
                fontFamily: 'var(--font-assistant,sans-serif)', fontSize: 14.5, fontWeight: 800,
                color: '#96613F', marginBottom: 8,
              }}>
                {sec.title}
              </h2>
              {sec.items.map((it, i) => (
                <p key={i} style={{
                  fontSize: 14, lineHeight: 1.75, color: '#4A3B32', marginBottom: 8,
                  fontFamily: 'var(--font-assistant,sans-serif)',
                }}>
                  {it}
                </p>
              ))}
            </section>
          ))}
        </div>
      </div>

      <div style={{ padding: '18px 16px 0', textAlign: 'center' }}>
        <Link href="/home" style={{
          fontSize: 14, color: '#96613F', textDecoration: 'none',
          fontFamily: 'var(--font-assistant,sans-serif)',
        }}>
          ‹ חזרה לאפליקציה
        </Link>
      </div>

      <p style={{
        textAlign: 'center', fontSize: 12.5, color: '#B3A597', margin: '22px 0 0',
        fontFamily: 'var(--font-assistant,sans-serif)',
      }}>
        © Urban Studio · כל הזכויות שמורות
      </p>

      <div style={{ height: 40 }} />
    </main>
  )
}
