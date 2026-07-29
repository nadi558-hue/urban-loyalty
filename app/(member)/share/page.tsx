import { getCurrentMember, DEMO_MEMBER } from '@/lib/member'
import { getRules } from '@/lib/points'
import { checkEligibility, getMemberShares } from '@/lib/social-shares'
import ShareClient from './ShareClient'

export const dynamic = 'force-dynamic'

export default async function SharePage() {
  const member = (await getCurrentMember()) ?? DEMO_MEMBER
  const [rules, eligibility, history] = await Promise.all([
    getRules(),
    checkEligibility(member.id),
    getMemberShares(member.id),
  ])
  return (
    <ShareClient
      bonus={rules['social_share'] ?? 2}
      eligibility={eligibility}
      history={history}
    />
  )
}
