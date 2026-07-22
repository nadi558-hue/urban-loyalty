'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { label: 'בית', icon: '⌂', href: '/home' },
  { label: 'הטבות', icon: '✦', href: '/rewards' },
  { label: 'QR', icon: '▦', href: '/qr', center: true },
  { label: 'היסטוריה', icon: '◷', href: '/history' },
  { label: 'פרופיל', icon: '◎', href: '/profile' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: 448,
      background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)',
      borderTop: '1px solid rgba(192,144,111,0.2)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-around',
      padding: '8px 0 max(8px, env(safe-area-inset-bottom))',
      zIndex: 50,
    }}>
      {tabs.map(tab => {
        const active = pathname === tab.href
        if (tab.center) {
          return (
            <Link key={tab.href} href={tab.href} style={{ textDecoration: 'none' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, minWidth: 44 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: '50%',
                  background: 'linear-gradient(135deg,#DBB89C,#C0906F)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 10px 22px -6px rgba(192,144,111,.7)',
                  marginTop: -18,
                }}>
                  <span style={{ fontSize: 20, color: '#3B2E27' }}>{tab.icon}</span>
                </div>
                <span style={{ fontSize: 10, color: active ? '#C0906F' : '#9C8B7F', fontFamily: 'var(--font-assistant,sans-serif)', fontWeight: active ? 700 : 400 }}>{tab.label}</span>
              </div>
            </Link>
          )
        }
        return (
          <Link key={tab.href} href={tab.href} style={{ textDecoration: 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, minWidth: 44 }}>
              <span style={{ fontSize: 18, color: active ? '#C0906F' : '#9C8B7F' }}>{tab.icon}</span>
              <span style={{ fontSize: 10, color: active ? '#C0906F' : '#9C8B7F', fontFamily: 'var(--font-assistant,sans-serif)', fontWeight: active ? 700 : 400 }}>{tab.label}</span>
            </div>
          </Link>
        )
      })}
    </nav>
  )
}
