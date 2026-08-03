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
    <main className="max-w-md mx-auto" style={{ minHeight: '100dvh', background: '#F1E9E3' }}>

      {/* ── Full-bleed hero ─────────────────────── */}
      <div style={{
        position: 'relative', height: 240, overflow: 'hidden',
        background: 'linear-gradient(120deg,#EFE2D8 0%,#E4D0C3 52%,#D8BCA9 100%)',
      }}>
        {/* Figure cutout, bottom-left, fading toward the title on the right */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/figure-reach.png" alt="" aria-hidden
          style={{
            position: 'absolute', bottom: 0, left: -8, height: 236, pointerEvents: 'none', zIndex: 1,
            filter: 'drop-shadow(0 12px 22px rgba(59,46,39,.20))',
            WebkitMaskImage: 'linear-gradient(90deg,#000 0%,#000 46%,transparent 76%)',
            maskImage: 'linear-gradient(90deg,#000 0%,#000 46%,transparent 76%)',
          }}
        />
        <div aria-hidden style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(130% 90% at 85% 18%, rgba(255,255,255,0.4), transparent 58%), linear-gradient(180deg, transparent 62%, rgba(241,233,227,0.5) 100%)',
        }} />
        <div style={{ position: 'relative', zIndex: 2, padding: '28px 22px', textAlign: 'right' }}>
          <p style={{ fontSize: 12.5, color: '#A66B43', letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 6, fontFamily: 'var(--font-assistant,sans-serif)' }}>
            צ׳ק-אין בסטודיו
          </p>
          <p style={{ fontFamily: 'var(--font-frank,serif)', fontSize: 30, fontWeight: 900, color: '#3B2E27', lineHeight: 1.12 }}>
            סרקו את המסך בכניסה
          </p>
          <p style={{ fontSize: 13, color: '#7A6B60', marginTop: 8, fontFamily: 'var(--font-assistant,sans-serif)' }}>
            {member.name} · {memberId} · {tier}
          </p>
        </div>
      </div>

      {/* Scan card pulled up to overlap the hero */}
      <div style={{ position: 'relative', zIndex: 3, marginTop: -30 }}>
        <Suspense>
          <ScanClient />
        </Suspense>
      </div>

      <div style={{ height: 100 }} />
    </main>
  )
}
