'use client'

import Link from 'next/link'
import { useLinkStatus } from 'next/link'
import { usePathname } from 'next/navigation'
import { Home2, Gift, ScanBarcode, Clock, User, type Icon } from 'iconsax-reactjs'

const tabs: { label: string; Icon: Icon; href: string; center?: boolean }[] = [
  { label: 'בית', Icon: Home2, href: '/home' },
  { label: 'הטבות', Icon: Gift, href: '/rewards' },
  { label: 'QR', Icon: ScanBarcode, href: '/qr', center: true },
  { label: 'היסטוריה', Icon: Clock, href: '/history' },
  { label: 'פרופיל', Icon: User, href: '/profile' },
]

/**
 * Marks the tab being navigated to.
 *
 * Member screens are force-dynamic, so the tap-to-paint gap is a server
 * round-trip. The pressed state fades the moment the finger lifts, which left
 * that gap with no feedback at all — this holds a visible signal on the tab
 * for as long as the navigation is actually in flight.
 *
 * Must be rendered inside the <Link> it reports on; that is what useLinkStatus
 * reads from.
 */
function TabBody({
  tab, active,
}: {
  tab: (typeof tabs)[number]
  active: boolean
}) {
  const { pending } = useLinkStatus()
  const lit = active || pending

  if (tab.center) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, minWidth: 44 }}>
        <div style={{
          width: 52, height: 52, borderRadius: '50%',
          background: 'linear-gradient(135deg,#DBB89C,#C0906F)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: [
            '0 12px 22px -8px rgba(139,100,74,0.65)',
            'inset 0 4px 8px -3px rgba(255,255,255,0.7)',
            'inset 0 -6px 12px -6px rgba(120,85,62,0.45)',
          ].join(','),
          marginTop: -18,
          opacity: pending ? 0.65 : 1,
          transition: 'opacity 140ms ease',
        }}>
          <tab.Icon size={24} variant="Bulk" color="#3B2E27" />
        </div>
        <Label tab={tab} lit={lit} pending={pending} />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, minWidth: 44 }}>
      <tab.Icon
        size={23}
        variant={lit ? 'Bulk' : 'Linear'}
        color={lit ? '#C0906F' : '#9C8B7F'}
      />
      <Label tab={tab} lit={lit} pending={pending} />
    </div>
  )
}

function Label({
  tab, lit, pending,
}: {
  tab: (typeof tabs)[number]
  lit: boolean
  pending: boolean
}) {
  return (
    <span style={{
      fontSize: 12,
      color: lit ? '#C0906F' : '#9C8B7F',
      fontFamily: 'var(--font-assistant,sans-serif)',
      fontWeight: lit ? 700 : 400,
      // A quiet pulse while the next screen is on its way.
      animation: pending ? 'urban-pulse 900ms ease-in-out infinite' : undefined,
    }}>
      {tab.label}
    </span>
  )
}

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: 448,
      background: 'rgba(252,247,243,0.94)', backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderRadius: '26px 26px 0 0',
      boxShadow: [
        '0 -10px 30px -14px rgba(139,100,74,0.4)',
        'inset 0 3px 8px -4px rgba(255,255,255,0.95)',
      ].join(','),
      display: 'flex', alignItems: 'center', justifyContent: 'space-around',
      padding: '8px 0 max(8px, env(safe-area-inset-bottom))',
      zIndex: 50,
    }}>
      {tabs.map(tab => (
        <Link key={tab.href} href={tab.href} style={{ textDecoration: 'none' }}>
          <TabBody tab={tab} active={pathname === tab.href} />
        </Link>
      ))}
    </nav>
  )
}
