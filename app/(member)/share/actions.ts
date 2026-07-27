'use server'

import { revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { checkEligibility, SHARE_BUCKET } from '@/lib/social-shares'

const MAX_BYTES = 6 * 1024 * 1024
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']

export async function submitShare(form: FormData): Promise<{ ok: boolean; error?: string }> {
  const file = form.get('image')
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: 'לא נבחרה תמונה' }
  if (file.size > MAX_BYTES) return { ok: false, error: 'התמונה גדולה מדי (עד 6MB)' }
  if (!ALLOWED.includes(file.type)) return { ok: false, error: 'קובץ לא נתמך — העלו תמונה' }

  try {
    const auth = await createSupabaseServerClient()
    const { data: { user } } = await auth.auth.getUser()
    if (!user?.phone) return { ok: false, error: 'לא מחובר' }

    const db = createServiceClient()
    const { data: member } = await db
      .from('members').select('id').eq('phone', user.phone).single() as { data: { id: string } | null }
    if (!member) return { ok: false, error: 'החבר לא נמצא' }

    // Re-check server-side: the client's button state isn't a security boundary.
    const eligibility = await checkEligibility(member.id)
    if (!eligibility.canSubmit) {
      return {
        ok: false,
        error: eligibility.reason === 'pending'
          ? 'יש לך שיתוף שממתין לאישור'
          : 'אפשר לשתף שוב בעוד כמה ימים',
      }
    }

    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '')
    const path = `${member.id}/${Date.now()}.${ext}`

    const { error: upErr } = await db.storage
      .from(SHARE_BUCKET)
      .upload(path, file, { contentType: file.type, upsert: false })
    if (upErr) return { ok: false, error: 'העלאת התמונה נכשלה' }

    const { data: pub } = db.storage.from(SHARE_BUCKET).getPublicUrl(path)

    const { error: insErr } = await db.from('social_shares').insert({
      member_id: member.id,
      image_url: pub.publicUrl,
      status: 'pending',
    })
    if (insErr) return { ok: false, error: 'שמירת השיתוף נכשלה' }

    revalidatePath('/share')
    return { ok: true }
  } catch {
    return { ok: false, error: 'שגיאה — נסו שוב' }
  }
}
