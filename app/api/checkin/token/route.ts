import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { isAdminPhone } from '@/lib/admin'
import { generateToken, secondsToRotation } from '@/lib/checkin'

export const dynamic = 'force-dynamic'

// Admin-only: the kiosk tablet polls this to display the rotating QR.
export async function GET() {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!isAdminPhone(user?.phone)) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 })
    }
    return NextResponse.json({ token: generateToken(), rotatesIn: secondsToRotation() })
  } catch {
    return NextResponse.json({ error: 'not configured' }, { status: 500 })
  }
}
