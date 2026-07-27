'use server'

import { createServiceClient } from '@/lib/supabase'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

/**
 * Save the member's birth date so the yearly birthday bonus can fire.
 * The Arbox import doesn't supply it, so members enter it themselves.
 */
export async function saveBirthDate(date: string): Promise<{ ok: boolean; error?: string }> {
  // Plain calendar date — no timezone, matching the DATE column.
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { ok: false, error: 'תאריך לא תקין' }

  const year = Number(date.slice(0, 4))
  const thisYear = new Date().getFullYear()
  if (year < 1920 || year > thisYear) return { ok: false, error: 'תאריך לא תקין' }

  try {
    const auth = await createSupabaseServerClient()
    const { data: { user } } = await auth.auth.getUser()
    if (!user?.phone) return { ok: false, error: 'לא מחובר' }

    const db = createServiceClient()
    const { error } = await db.from('members').update({ birth_date: date }).eq('phone', user.phone)
    if (error) return { ok: false, error: error.message }

    revalidatePath('/profile')
    return { ok: true }
  } catch {
    return { ok: false, error: 'שמירה נכשלה' }
  }
}
