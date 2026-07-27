import { getCurrentMember, DEMO_MEMBER } from '@/lib/member'
import { getRewards } from './rewards-data'
import RewardsClient from './RewardsClient'

export const dynamic = 'force-dynamic'

export default async function RewardsPage() {
  const [member, rewards] = await Promise.all([
    getCurrentMember(),
    getRewards(),
  ])
  const uc = (member ?? DEMO_MEMBER).total_coins
  return <RewardsClient uc={uc} rewards={rewards} />
}
