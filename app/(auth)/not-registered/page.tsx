import Link from 'next/link'
import { getMemberStatus } from '@/lib/member'
import { redirect } from 'next/navigation'
import { InfoCircle, Whatsapp } from 'iconsax-reactjs'

export const dynamic = 'force-dynamic'

/**
 * Shown when the phone that just passed the OTP has no member record.
 *
 * Reachable in ordinary use: someone who joined the studio this week and
 * hasn't been imported from Arbox yet, a member whose phone in Arbox is
 * mistyped, or simply a wrong digit at login. Anyone who does have a record is
 * bounced back to the app, so a stale link can't strand a real member here.
 */
export default async function NotRegisteredPage() {
  const status = await getMemberStatus()
  if (status !== 'not-a-member') redirect('/home')

  const studioWhatsapp = (process.env.STUDIO_WHATSAPP ?? '').replace(/\D/g, '')

  return (
    <main className="max-w-md mx-auto" style={{
      minHeight: '100dvh', background: '#F1E9E3',
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
      padding: '32px 22px',
    }}>
      <div className="clay" style={{ padding: '30px 24px', textAlign: 'center' }}>
        <div style={{
          width: 62, height: 62, borderRadius: '50%', margin: '0 auto 18px',
          background: 'linear-gradient(150deg,#FBF1E8,#DBB89C)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 6px 16px rgba(192,144,111,0.3)',
        }}>
          <InfoCircle size={30} variant="Bulk" color="#96613F" />
        </div>

        <h1 style={{
          fontFamily: 'var(--font-frank,serif)', fontSize: 25, fontWeight: 800,
          color: '#3B2E27', marginBottom: 10, lineHeight: 1.25,
        }}>
          עדיין לא מצאנו אתכם במועדון
        </h1>

        <p style={{
          fontSize: 13.5, color: '#6F625A', lineHeight: 1.65, marginBottom: 8,
          fontFamily: 'var(--font-assistant,sans-serif)',
        }}>
          המספר שהזנתם לא מופיע ברשימת החברים הפעילים שלנו.
          זה קורה כשההצטרפות עוד לא נקלטה במערכת, או כשהמספר שמור אצלנו קצת אחרת.
        </p>

        <p style={{
          fontSize: 13.5, color: '#6F625A', lineHeight: 1.65, marginBottom: 22,
          fontFamily: 'var(--font-assistant,sans-serif)',
        }}>
          פנו לצוות בסטודיו ונסדר את זה תוך רגע.
        </p>

        {/* Set STUDIO_WHATSAPP to the studio's own line, e.g. 972500000000.
            Left unset the button is simply omitted — better no contact than
            publishing a staff member's personal number to every visitor. */}
        {studioWhatsapp && (
          <a
            href={`https://wa.me/${studioWhatsapp}`}
            className="clay-btn"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '14px 0', textDecoration: 'none', marginBottom: 12,
              fontFamily: 'var(--font-assistant,sans-serif)', fontSize: 15, fontWeight: 800,
              color: '#3B2E27',
            }}
          >
            <Whatsapp size={19} variant="Bulk" color="#3f8f5e" />
            כתבו לנו בוואטסאפ
          </a>
        )}

        <Link href="/login" style={{
          display: 'block', fontSize: 13.5, color: '#9C8B7F', textDecoration: 'none',
          fontFamily: 'var(--font-assistant,sans-serif)',
        }}>
          התחברות עם מספר אחר
        </Link>
      </div>
    </main>
  )
}
