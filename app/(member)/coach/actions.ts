'use server'

import { createServiceClient } from '@/lib/supabase'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export type CoachId = 'maya' | 'sara' | 'idan'
export type Gender = 'female' | 'male' | 'unspecified'

const COACHES: CoachId[] = ['maya', 'sara', 'idan']
const GENDERS: Gender[] = ['female', 'male', 'unspecified']

/**
 * Persist the member's coach and how the coach should address them.
 *
 * Both are validated here rather than trusted from the client: the columns
 * carry CHECK constraints, and a bad value would reject the whole update and
 * lose the valid half of it too.
 *
 * Requires supabase/migration_gender.sql for the gender column.
 */
export async function savePreferences(
  coach: CoachId,
  gender: Gender,
): Promise<{ ok: boolean; error?: string }> {
  if (!COACHES.includes(coach) || !GENDERS.includes(gender)) {
    return { ok: false, error: 'invalid' }
  }
  try {
    const auth = await createSupabaseServerClient()
    const { data: { user } } = await auth.auth.getUser()
    if (!user?.phone) return { ok: false, error: 'not-signed-in' }

    const db = createServiceClient()
    const { error } = await db.from('members')
      .update({ preferred_coach: coach, gender })
      .eq('phone', user.phone)
    if (error) return { ok: false, error: error.message }
    return { ok: true }
  } catch {
    return { ok: false, error: 'save-failed' }
  }
}
