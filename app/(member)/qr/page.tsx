import { Suspense } from 'react'
import { getCurrentMember, DEMO_MEMBER, memberIdLabel } from '@/lib/member'
import ScanClient from './ScanClient'

export const dynamic = 'force-dynamic'

const TIER_LABELS: Record<string, string> = { silver: 'SILVER', gold: 'GOLD', platinum: 'PLATINUM' }

export default async function QrPage() {
  const member = (await getCurrentMember()) ?? DEMO_MEMBER
  const memberId = memberIdLabel(member)
  const tier = TIER_LABELS[member.tier] ?? member.tier

  return (
    <main className="max-w-md mx-auto" style={{ minHeight: '100dvh', background: '#d9d3c7' }}>

      {/* Dark header */}
      <div style={{
        background: 'linear-gradient(180deg,#3a342d 0%,#1c1917 100%)',
        padding: '24px 20px 28px', textAlign: 'center',
      }}>
        <p style={{ fontSize: 11, color: '#c4a05a', letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 6, fontFamily: 'var(--font-assistant,sans-serif)' }}>
          צ׳ק-אין בסטודיו
        </p>
        <p style={{ fontFamily: 'var(--font-frank,serif)', fontSize: 26, fontWeight: 900, color: '#f5f0e8' }}>
          סרקו את המסך בכניסה
        </p>
        <p style={{ fontSize: 12, color: '#b5a893', marginTop: 6, fontFamily: 'var(--font-assistant,sans-serif)' }}>
          {member.name} · {memberId} · {tier}
        </p>
      </div>

      <Suspense>
        <ScanClient />
      </Suspense>

      <div style={{ height: 100 }} />
    </main>
  )
}
