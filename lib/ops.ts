import { createServiceClient } from '@/lib/supabase'
import { STALE_PENDING_MS } from '@/lib/reconcile'

export type PendingScan = {
  id: string
  name: string
  createdAt: string
  ageMs: number
  stale: boolean
}

export type RecentAward = { name: string; className: string | null; createdAt: string; points: number }

export type Ops = {
  lastSyncAt: string | null
  lastSyncAgeMs: number | null
  lastSyncErrors: string | null
  /** The cron runs daily, so anything past ~26h means it stopped firing. */
  syncOverdue: boolean
  pending: PendingScan[]
  awards24h: number
  recentAwards: RecentAward[]
  /** No scan has ever been recorded — the QR path is still unproven. */
  neverScanned: boolean
}

const DAY = 86_400_000
const SYNC_OVERDUE_MS = 26 * 3_600_000

/**
 * Operational snapshot for the admin dashboard.
 *
 * Exists because the sync died silently for five days and nothing on any
 * screen said so — attendance simply stopped earning coins. The three things
 * that can break the earning path without any visible error are: the cron not
 * running, a scan never being confirmed by Arbox, and no scans arriving at
 * all. All three are surfaced here.
 */
export async function getOps(): Promise<Ops> {
  const empty: Ops = {
    lastSyncAt: null, lastSyncAgeMs: null, lastSyncErrors: null, syncOverdue: true,
    pending: [], awards24h: 0, recentAwards: [], neverScanned: true,
  }

  try {
    const db = createServiceClient()
    const since = new Date(Date.now() - DAY).toISOString()

    const [syncRes, pendingRes, awardsRes, scanCountRes] = await Promise.all([
      db.from('sync_log').select('synced_at, errors').order('synced_at', { ascending: false }).limit(1),
      db.from('checkins')
        .select('id, created_at, member_id, members(name)')
        .eq('status', 'pending').is('arbox_checkin_id', null)
        .order('created_at', { ascending: false }).limit(40),
      db.from('point_ledger')
        .select('created_at, points, metadata, members(name)')
        .eq('reason', 'class_attended').gte('created_at', since)
        .order('created_at', { ascending: false }).limit(20),
      db.from('checkins').select('*', { count: 'exact', head: true }),
    ])

    const sync = (syncRes.data ?? [])[0] as { synced_at: string; errors: string | null } | undefined
    const lastSyncAt = sync?.synced_at ?? null
    const lastSyncAgeMs = lastSyncAt ? Date.now() - new Date(lastSyncAt).getTime() : null

    const pending: PendingScan[] = ((pendingRes.data ?? []) as any[]).map((r) => {
      const ageMs = Date.now() - new Date(r.created_at).getTime()
      return {
        id: r.id,
        name: r.members?.name ?? '—',
        createdAt: r.created_at,
        ageMs,
        stale: ageMs > STALE_PENDING_MS,
      }
    })

    const recentAwards: RecentAward[] = ((awardsRes.data ?? []) as any[]).map((r) => ({
      name: r.members?.name ?? '—',
      className: typeof r.metadata?.class_name === 'string' ? r.metadata.class_name : null,
      createdAt: r.created_at,
      points: r.points,
    }))

    return {
      lastSyncAt,
      lastSyncAgeMs,
      lastSyncErrors: sync?.errors ?? null,
      syncOverdue: lastSyncAgeMs === null || lastSyncAgeMs > SYNC_OVERDUE_MS,
      pending,
      awards24h: recentAwards.length,
      recentAwards: recentAwards.slice(0, 6),
      neverScanned: (scanCountRes.count ?? 0) === 0,
    }
  } catch {
    return empty
  }
}

export function agoLabel(ms: number): string {
  const m = Math.floor(ms / 60000)
  if (m < 1) return 'הרגע'
  if (m < 60) return `לפני ${m} דק׳`
  const h = Math.floor(m / 60)
  if (h < 24) return `לפני ${h} שע׳`
  return `לפני ${Math.floor(h / 24)} ימים`
}
