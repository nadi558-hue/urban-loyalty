import { getCurrentMember, DEMO_MEMBER } from '@/lib/member'
import { getRules } from '@/lib/points'
import { getReferrals } from './referrals-data'
import ReferralsClient from './ReferralsClient'

export const dynamic = 'force-dynamic'

export default async function ReferralsPage() {
  const member = (await getCurrentMember()) ?? DEMO_MEMBER
  const [referrals, rules] = await Promise.all([getReferrals(member.id), getRules()])
  return (
    <ReferralsClient
      referralCode={member.referral_code}
      referrals={referrals}
      // Read from the same rule /share and /home pay out on. This screen used
      // to hardcode the number and was left at the old price of 7 when the
      // rule dropped to 2 — promising a member more than they'd be paid.
      shareBonus={rules['social_share'] ?? 2}
    />
  )
}
