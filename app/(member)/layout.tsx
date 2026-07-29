import { redirect } from 'next/navigation'
import BottomNav from '@/components/BottomNav'
import { getMemberStatus } from '@/lib/member'

export const dynamic = 'force-dynamic'

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  // Passing the OTP only proves the phone is reachable, not that it belongs to
  // a member. Without this the screens below fall back to DEMO_MEMBER and show
  // a stranger a fabricated name and balance. Guarding in the layout rather
  // than in each page means a new screen can't forget to do it.
  if (await getMemberStatus() === 'not-a-member') redirect('/not-registered')

  return (
    <div className="pb-20">
      {children}
      <BottomNav />
    </div>
  )
}
