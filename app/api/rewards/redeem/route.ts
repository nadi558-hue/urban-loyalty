import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createServiceClient } from '@/lib/supabase'
import { deductPoints } from '@/lib/points'

export async function POST(req: NextRequest) {
  // Verify authenticated session
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return req.cookies.getAll() },
        setAll() {},
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.phone) {
    return NextResponse.json({ error: 'לא מחובר' }, { status: 401 })
  }

  const { member_id, reward_id } = await req.json()
  if (!member_id || !reward_id) {
    return NextResponse.json({ error: 'חסרים פרמטרים' }, { status: 400 })
  }

  const db = createServiceClient()

  type MemberRow = { id: string; total_coins: number; name: string }
  type RewardRow = { id: string; name: string; cost_points: number; active: boolean }

  const [memberRes, rewardRes] = await Promise.all([
    db.from('members').select('id, total_coins, name').eq('id', member_id).eq('phone', user.phone).single(),
    db.from('rewards').select('id, name, cost_points, active').eq('id', reward_id).eq('active', true).single(),
  ])

  const member = memberRes.data as MemberRow | null
  const reward = rewardRes.data as RewardRow | null

  // member null means either not found OR phone doesn't match — either way: denied
  if (!member) return NextResponse.json({ error: 'גישה נדחתה' }, { status: 403 })
  if (!reward) return NextResponse.json({ error: 'הטבה לא נמצאה' }, { status: 404 })
  if (member.total_coins < reward.cost_points) {
    return NextResponse.json({ error: 'אין מספיק מטבעות' }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: redemption, error } = await (db.from('redemptions') as any)
    .insert({ member_id, reward_id, points_spent: reward.cost_points, status: 'pending' })
    .select()
    .single()

  if (error || !redemption) {
    return NextResponse.json({ error: 'שגיאה ביצירת המימוש' }, { status: 500 })
  }

  await deductPoints(member_id, reward.cost_points, `מימוש: ${reward.name}`)

  return NextResponse.json({
    ok: true,
    code: redemption.code,
    reward_name: reward.name,
    points_spent: reward.cost_points,
  })
}
