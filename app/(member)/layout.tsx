import { redirect } from 'next/navigation'
import BottomNav from '@/components/BottomNav'
import { getMemberStatus } from '@/lib/member'

export const dynamic = 'force-dynamic'

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  // Passing the OTP only proves the phone is reachable, not that it belongs to
  // a member. Without this the screens below fall back to DEMO_MEMBER and show
  // a stranger a fabricated name and balance. Guarding in the layout rather
  // than in each page means a new screen can't forget to do it.
  const status = await getMemberStatus()
  if (status === 'not-a-member') redirect('/not-registered')
  // Staff run the studio through Arbox but don't buy a plan through it, so
  // they have no member row — send them to their actual area instead of the
  // same wall a stranger's phone hits.
  if (status === 'admin-only') redirect('/admin')

  return (
    <div className="pb-20">
      {children}
      <BottomNav />
    </div>
  )
}
