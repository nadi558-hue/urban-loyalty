import { getCurrentMember, DEMO_MEMBER } from '@/lib/member'
import { getReferrals } from './referrals-data'
import ReferralsClient from './ReferralsClient'

export const dynamic = 'force-dynamic'

export default async function ReferralsPage() {
  const member = (await getCurrentMember()) ?? DEMO_MEMBER
  const referrals = await getReferrals(member.id)
  return <ReferralsClient referralCode={member.referral_code} referrals={referrals} />
}
