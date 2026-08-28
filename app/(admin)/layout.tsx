import PendingAlert from '@/components/PendingAlert'

/**
 * Every admin screen carries the pending-work banner, the kiosk included —
 * that tablet is the one screen actually left open at reception, so it is
 * where a waiting member is most likely to be noticed.
 *
 * The route group's own gate still applies: the proxy redirects anyone whose
 * phone is not on the admin allow-list before this renders.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PendingAlert />
      {children}
    </>
  )
}
