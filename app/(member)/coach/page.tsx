import { getCurrentMember, DEMO_MEMBER } from '@/lib/member'
import CoachSelectClient from './CoachSelectClient'
import type { CoachId } from './actions'

export const dynamic = 'force-dynamic'

export default async function CoachPage() {
  const member = (await getCurrentMember()) ?? DEMO_MEMBER
  const current = ((member as { preferred_coach?: CoachId }).preferred_coach ?? 'maya') as CoachId
  return <CoachSelectClient current={current} />
}
