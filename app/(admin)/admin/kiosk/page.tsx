import KioskClient from './KioskClient'

export const dynamic = 'force-dynamic'

// Tablet kiosk screen — /admin route, so the proxy admin gate protects it.
// Log the tablet in with an admin phone and leave this page open at reception.
export default function KioskPage() {
  return <KioskClient />
}
