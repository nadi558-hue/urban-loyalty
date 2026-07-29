import { getCurrentMember, DEMO_MEMBER } from '@/lib/member'
import CoachSelectClient from './CoachSelectClient'
import type { CoachId, Gender } from './actions'

export const dynamic = 'force-dynamic'

export default async function CoachPage() {
  const member = (await getCurrentMember()) ?? DEMO_MEMBER
  return (
    <CoachSelectClient
      current={(member.preferred_coach ?? 'maya') as CoachId}
      currentGender={(member.gender ?? 'unspecified') as Gender}
    />
  )
}
