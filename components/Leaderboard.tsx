import { Cup } from 'iconsax-reactjs'
import type { Leaderboard as Data, LeaderRow } from '@/lib/leaderboard'

const MEDAL = ['🥇', '🥈', '🥉']

function Row({ row, last }: { row: LeaderRow; last: boolean }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 11,
      padding: '11px 16px',
      borderBottom: last ? undefined : '1px solid #F3EAE3',
      background: row.isMe ? 'rgba(219,184,156,0.22)' : undefined,
    }}>
      <span style={{
        width: 26, textAlign: 'center', flexShrink: 0,
        fontSize: row.rank <= 3 ? 17 : 13,
        fontWeight: 700, color: '#96613F',
        fontFamily: 'var(--font-assistant,sans-serif)',
      }}>
        {row.rank <= 3 ? MEDAL[row.rank - 1] : row.rank}
      </span>
      <span style={{
        flex: 1, minWidth: 0, fontSize: 14,
        fontWeight: row.isMe ? 800 : 600,
        color: '#3B2E27', fontFamily: 'var(--font-assistant,sans-serif)',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {row.name}
      </span>
      <span style={{
        flexShrink: 0, fontSize: 13.5, fontWeight: 700, color: '#96613F',
        fontFamily: 'var(--font-assistant,sans-serif)',
      }}>
        {row.classes} שיעורים
      </span>
    </div>
  )
}

/**
 * Monthly attendance ranking.
 *
 * Names are shown as "שרה כ." — see lib/leaderboard.ts. Rendered only when at
 * least a few people have trained, because a board with one name on it reads
 * as an empty room rather than a competition.
 */
export default function Leaderboard({ data }: { data: Data }) {
  if (data.total < 3) return null

  return (
    <div style={{ padding: '20px 16px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <Cup size={15} variant="Bulk" color="#C0906F" />
        <p style={{
          fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase',
          color: '#9C8B7F', fontFamily: 'var(--font-assistant,sans-serif)',
        }}>
          המובילות החודש
        </p>
        <span style={{ fontSize: 12, color: '#B3A597', fontFamily: 'var(--font-assistant,sans-serif)' }}>
          · {data.monthLabel}
        </span>
      </div>

      <div className="clay-sm" style={{ overflow: 'hidden' }}>
        {data.top.map((r, i) => (
          <Row key={r.rank + r.name} row={r} last={!data.me && i === data.top.length - 1} />
        ))}

        {data.me && (
          <>
            <div style={{ textAlign: 'center', color: '#C6B6A8', fontSize: 12, padding: '2px 0' }}>···</div>
            <Row row={data.me} last />
          </>
        )}
      </div>

      <p style={{
        fontSize: 12, color: '#9C8B7F', marginTop: 8, textAlign: 'center',
        fontFamily: 'var(--font-assistant,sans-serif)',
      }}>
        מתאפס בתחילת כל חודש · {data.total} מתאמנות פעילות
      </p>
    </div>
  )
}
