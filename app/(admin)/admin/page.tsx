import { createServiceClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

type TopMember = { name: string; total_coins: number; tier: string }

async function getStats() {
  const db = createServiceClient()
  const [membersRes, redemptionsRes, topRes] = await Promise.all([
    db.from('members').select('*', { count: 'exact', head: true }),
    db.from('redemptions').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    db.from('members').select('name, total_coins, tier').order('total_coins', { ascending: false }).limit(5),
  ])
  const topMembers: TopMember[] = (topRes.data ?? []).map((m) => ({
    name: (m as TopMember).name,
    total_coins: (m as TopMember).total_coins,
    tier: (m as TopMember).tier,
  }))
  return { totalMembers: membersRes.count ?? 0, totalRedemptions: redemptionsRes.count ?? 0, topMembers }
}

const TIER_BADGE = { silver: '🥈', gold: '🥇', platinum: '💎' }

export default async function AdminPage() {
  const { totalMembers, totalRedemptions, topMembers } = await getStats()

  return (
    <main className="max-w-2xl mx-auto px-4 pt-8" dir="rtl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--urban-dark)' }}>דשבורד ניהול</h1>
          <p className="text-sm text-gray-400">Urban Studio – מועדון לקוחות</p>
        </div>
        <form action="/api/sync" method="POST">
          <button
            type="submit"
            className="px-4 py-2 rounded-xl text-sm font-bold"
            style={{ background: 'var(--urban-dark)', color: 'white' }}
          >
            סנכרן עם Arbox
          </button>
        </form>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {[
          { label: 'סה״כ חברי מועדון', value: totalMembers },
          { label: 'מימושים ממתינים', value: totalRedemptions },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-[#E7DBD1]">
            <p className="text-3xl font-bold" style={{ color: 'var(--urban-dark)' }}>{value}</p>
            <p className="text-sm text-gray-400 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Top members */}
      <div className="bg-white rounded-2xl p-5 border border-[#E7DBD1] mb-6">
        <h2 className="font-bold mb-4" style={{ color: 'var(--urban-dark)' }}>חברים מובילים</h2>
        {topMembers.length === 0 ? (
          <p className="text-sm text-gray-400">אין נתונים עדיין</p>
        ) : (
          <div className="space-y-3">
            {topMembers.map((m, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{TIER_BADGE[m.tier as keyof typeof TIER_BADGE]}</span>
                  <span className="text-sm font-medium" style={{ color: 'var(--urban-dark)' }}>{m.name}</span>
                </div>
                <span className="text-sm font-bold" style={{ color: 'var(--urban-gold)' }}>
                  {m.total_coins.toLocaleString('he-IL')} UC
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Happy Hour — featured */}
      <a
        href="/admin/happy-hour"
        className="block rounded-2xl p-4 mb-3 text-center font-bold transition hover:opacity-90"
        style={{ background: 'linear-gradient(135deg, #C0906F, #DBB89C)', color: '#3B2E27' }}
      >
        🔥 Happy Hour · שיעורים מקודמים
      </a>

      {/* Kiosk — tablet check-in screen */}
      <a
        href="/admin/kiosk"
        className="block rounded-2xl p-4 mb-3 text-center font-bold transition hover:opacity-90"
        style={{ background: 'linear-gradient(135deg,#5A473C,#3B2E27)', color: '#DBB89C' }}
      >
        📺 מסך צ׳ק-אין לטאבלט (QR מתחלף)
      </a>

      {/* Admin links */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: '⚙️ כללי נקודות', href: '/admin/rules' },
          { label: '🎁 ניהול הטבות', href: '/admin/rewards' },
          { label: '📋 כל המימושים', href: '/admin/redemptions' },
          { label: '👥 כל החברים', href: '/admin/members' },
        ].map(({ label, href }) => (
          <a
            key={href}
            href={href}
            className="bg-white rounded-xl p-4 text-sm font-medium border border-[#E7DBD1] text-center hover:border-[var(--urban-gold)] transition"
            style={{ color: 'var(--urban-dark)' }}
          >
            {label}
          </a>
        ))}
      </div>
    </main>
  )
}
