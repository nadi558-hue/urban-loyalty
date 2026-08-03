import { createServiceClient } from '@/lib/supabase'

export type LeaderRow = {
  rank: number
  name: string
  classes: number
  isMe: boolean
}

export type Leaderboard = {
  top: LeaderRow[]
  me: LeaderRow | null   // the member's own row when they fall outside `top`
  total: number          // how many members trained at all this month
  monthLabel: string
}

const HE_MONTHS = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר']

/**
 * Shown to other members, so it never carries a full name — "שרה כ." matches
 * how the referrals screen already presents someone else's identity. Members
 * did not sign up to have their attendance published under their full name.
 */
function initialise(fullName: string): string {
  const [first, ...rest] = (fullName ?? '').trim().split(/\s+/)
  if (!first) return 'חבר/ה'
  return rest.length ? `${first} ${rest[rest.length - 1][0]}.` : first
}

/**
 * Who trained the most this calendar month.
 *
 * Ranked on classes attended rather than coins deliberately: coin totals are
 * inflated by one-off bonuses (birthday, referrals) that say nothing about
 * showing up, and a lifetime total would freeze the same few names at the top
 * forever. A monthly count resets, so somebody who starts today can still win
 * this month — which is the whole point of putting it on screen.
 */
export async function getLeaderboard(memberId: string, topN = 5): Promise<Leaderboard> {
  const now = new Date()
  const monthLabel = `${HE_MONTHS[now.getMonth()]} ${now.getFullYear()}`
  const empty: Leaderboard = { top: [], me: null, total: 0, monthLabel }

  try {
    const db = createServiceClient()
    const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString()

    const { data: rows } = await db
      .from('point_ledger')
      .select('member_id')
      .eq('reason', 'class_attended')
      .gte('created_at', from)
      .limit(100000) as { data: { member_id: string }[] | null }

    if (!rows?.length) return empty

    const counts = new Map<string, number>()
    for (const r of rows) counts.set(r.member_id, (counts.get(r.member_id) ?? 0) + 1)

    // Ties share a rank, and the id is the tiebreaker for ordering only, so the
    // list is stable between renders rather than reshuffling on every load.
    const ordered = [...counts.entries()].sort(
      (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
    )

    const rankOf = new Map<string, number>()
    let lastCount = -1
    let lastRank = 0
    ordered.forEach(([id, c], i) => {
      if (c !== lastCount) { lastRank = i + 1; lastCount = c }
      rankOf.set(id, lastRank)
    })

    const myIndex = ordered.findIndex(([id]) => id === memberId)
    const needed = ordered.slice(0, topN).map(([id]) => id)
    if (myIndex >= topN) needed.push(memberId)

    const { data: people } = await db
      .from('members')
      .select('id, name')
      .in('id', needed) as { data: { id: string; name: string }[] | null }

    const nameOf = new Map((people ?? []).map(p => [p.id, p.name]))

    const top: LeaderRow[] = ordered.slice(0, topN).map(([id, classes]) => ({
      rank: rankOf.get(id) ?? 0,
      name: id === memberId ? 'את/ה' : initialise(nameOf.get(id) ?? ''),
      classes,
      isMe: id === memberId,
    }))

    const me: LeaderRow | null =
      myIndex >= topN
        ? { rank: rankOf.get(memberId) ?? 0, name: 'את/ה', classes: counts.get(memberId) ?? 0, isMe: true }
        : null

    return { top, me, total: ordered.length, monthLabel }
  } catch {
    return empty
  }
}
