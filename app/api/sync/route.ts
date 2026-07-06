/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { getCheckInsSince } from '@/lib/arbox'
import { awardPoints, getRules } from '@/lib/points'

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = createServiceClient() as any
  const rules = await getRules()

  const { data: lastSync } = await db
    .from('sync_log')
    .select('synced_at')
    .order('synced_at', { ascending: false })
    .limit(1)
    .single()

  const since = lastSync?.synced_at ?? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  let checkInsFound = 0
  let pointsAwarded = 0
  let errors: string | null = null

  try {
    const checkIns = await getCheckInsSince(since)
    checkInsFound = checkIns.length

    for (const checkIn of checkIns) {
      if (checkIn.status !== 'attended') continue

      const { data: existing } = await db
        .from('processed_checkins')
        .select('arbox_checkin_id')
        .eq('arbox_checkin_id', checkIn.id)
        .single()

      if (existing) continue

      const { data: member } = await db
        .from('members')
        .select('id, total_points, lifetime_points')
        .eq('arbox_id', checkIn.customer_id)
        .single()

      if (!member) continue

      const pts = rules['class_attended'] ?? 10
      await awardPoints(member.id, pts, 'class_attended', {
        class_name: checkIn.class_name,
        branch: checkIn.branch_name,
        class_id: checkIn.class_id,
      })
      pointsAwarded += pts

      await db.from('processed_checkins').insert({
        arbox_checkin_id: checkIn.id,
        member_id: member.id,
      })

      await checkStreakBonus(member.id, rules, db)
      await checkMonthBonus(member.id, rules, db)
    }
  } catch (e) {
    errors = e instanceof Error ? e.message : String(e)
  }

  await db.from('sync_log').insert({ check_ins_found: checkInsFound, points_awarded: pointsAwarded, errors })

  return NextResponse.json({ ok: true, checkInsFound, pointsAwarded, errors })
}

async function checkStreakBonus(memberId: string, rules: Record<string, number>, db: any) {
  // Count total classes attended (lifetime)
  const { count: totalClasses } = await db
    .from('point_ledger')
    .select('*', { count: 'exact', head: true })
    .eq('member_id', memberId)
    .eq('reason', 'class_attended') as { count: number | null }

  if (!totalClasses || totalClasses % 10 !== 0) return

  // Count streak bonuses already given — should be exactly totalClasses/10
  const { count: bonusesGiven } = await db
    .from('point_ledger')
    .select('*', { count: 'exact', head: true })
    .eq('member_id', memberId)
    .eq('reason', 'streak_10') as { count: number | null }

  const expectedBonuses = totalClasses / 10
  if ((bonusesGiven ?? 0) < expectedBonuses) {
    await awardPoints(memberId, rules['streak_10'] ?? 50, 'streak_10', { streak: totalClasses })
  }
}

async function checkMonthBonus(memberId: string, rules: Record<string, number>, db: any) {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()

  const { count: classCount } = await db
    .from('point_ledger')
    .select('*', { count: 'exact', head: true })
    .eq('member_id', memberId)
    .eq('reason', 'class_attended')
    .gte('created_at', monthStart)
    .lte('created_at', monthEnd)

  const { count: alreadyAwarded } = await db
    .from('point_ledger')
    .select('*', { count: 'exact', head: true })
    .eq('member_id', memberId)
    .eq('reason', 'full_month')
    .gte('created_at', monthStart)

  if ((classCount ?? 0) >= 12 && (alreadyAwarded ?? 0) === 0) {
    await awardPoints(memberId, rules['full_month'] ?? 100, 'full_month', {
      month: `${now.getFullYear()}-${now.getMonth() + 1}`,
    })
  }
}
