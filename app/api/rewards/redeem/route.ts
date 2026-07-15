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

  const { reward_id, reward_name } = await req.json()
  if (!reward_id && !reward_name) {
    return NextResponse.json({ error: 'חסרים פרמטרים' }, { status: 400 })
  }

  const db = createServiceClient()

  type MemberRow = { id: string; total_coins: number; name: string }
  type RewardRow = { id: string; name: string; cost_coins: number; active: boolean }

  // Resolve the member from the authenticated phone — never trust a
  // client-supplied member id.
  const rewardQuery = db.from('rewards').select('id, name, cost_coins, active').eq('active', true)
  const [memberRes, rewardRes] = await Promise.all([
    db.from('members').select('id, total_coins, name').eq('phone', user.phone).single(),
    (reward_id ? rewardQuery.eq('id', reward_id) : rewardQuery.eq('name', reward_name)).single(),
  ])

  const member = memberRes.data as MemberRow | null
  const reward = rewardRes.data as RewardRow | null

  if (!member) return NextResponse.json({ error: 'החבר לא נמצא' }, { status: 403 })
  if (!reward) return NextResponse.json({ error: 'הטבה לא נמצאה' }, { status: 404 })
  if (member.total_coins < reward.cost_coins) {
    return NextResponse.json({ error: 'אין מספיק מטבעות' }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: redemption, error } = await (db.from('redemptions') as any)
    .insert({ member_id: member.id, reward_id: reward.id, coins_spent: reward.cost_coins, status: 'pending' })
    .select()
    .single()

  if (error || !redemption) {
    return NextResponse.json({ error: 'שגיאה ביצירת המימוש' }, { status: 500 })
  }

  await deductPoints(member.id, reward.cost_coins, `מימוש: ${reward.name}`)

  return NextResponse.json({
    ok: true,
    code: redemption.code,
    reward_name: reward.name,
    coins_spent: reward.cost_coins,
  })
}
