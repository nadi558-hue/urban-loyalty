'use server'

import { createServiceClient } from '@/lib/supabase'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export type CoachId = 'maya' | 'sara' | 'idan'

/**
 * Persist the member's chosen coach to members.preferred_coach.
 * Gracefully no-ops if not signed in or the column isn't migrated yet
 * (run: ALTER TABLE members ADD COLUMN IF NOT EXISTS preferred_coach TEXT DEFAULT 'maya').
 */
export async function saveCoach(coach: CoachId): Promise<{ ok: boolean; error?: string }> {
  try {
    const auth = await createSupabaseServerClient()
    const { data: { user } } = await auth.auth.getUser()
    if (!user?.phone) return { ok: false, error: 'not-signed-in' }

    const db = createServiceClient()
    const { error } = await db.from('members').update({ preferred_coach: coach }).eq('phone', user.phone)
    if (error) return { ok: false, error: error.message }
    return { ok: true }
  } catch {
    return { ok: false, error: 'save-failed' }
  }
}
