import { agoLabel, type Ops } from '@/lib/ops'

const CARD = 'bg-white rounded-2xl p-5 border border-[#E7DBD1] mb-6'

function Banner({ tone, title, body }: { tone: 'bad' | 'warn' | 'ok' | 'info'; title: string; body: string }) {
  const c = {
    bad:  { bg: '#FBEAEA', bd: '#E4B4B4', fg: '#8E2F2F' },
    warn: { bg: '#FDF3E3', bd: '#E8D2A6', fg: '#8A6320' },
    ok:   { bg: '#EAF6EE', bd: '#B4DCC2', fg: '#2E6B44' },
    info: { bg: '#F3E4D4', bd: '#DFC3A5', fg: '#7A4A2F' },
  }[tone]
  return (
    <div style={{
      background: c.bg, border: `1px solid ${c.bd}`, borderRadius: 14,
      padding: '11px 14px', marginBottom: 10,
    }}>
      <p style={{ fontSize: 14, fontWeight: 800, color: c.fg, marginBottom: 2 }}>{title}</p>
      <p style={{ fontSize: 13, color: c.fg, opacity: 0.9, lineHeight: 1.5 }}>{body}</p>
    </div>
  )
}

/**
 * Health of the earning path, on the dashboard.
 *
 * The failure modes here are all silent: the cron can stop, Arbox can never
 * confirm a scan, and members can attend without scanning at all. None of
 * those raise an error anywhere a person would look, which is how the sync
 * managed to stay dead for five days.
 */
export default function OpsPanel({ ops }: { ops: Ops }) {
  const stale = ops.pending.filter(p => p.stale)

  return (
    <div className={CARD}>
      <h2 className="font-bold mb-4" style={{ color: 'var(--urban-dark)' }}>מצב המערכת</h2>

      {ops.syncOverdue ? (
        <Banner
          tone="bad"
          title="הסנכרון לא רץ"
          body={
            ops.lastSyncAt
              ? `הריצה האחרונה ${agoLabel(ops.lastSyncAgeMs!)}. כל עוד זה המצב, נוכחות בשיעורים לא מזכה במטבעות.`
              : 'אין אף ריצה מתועדת. נוכחות בשיעורים לא מזכה במטבעות.'
          }
        />
      ) : (
        <Banner
          tone="ok"
          title="הסנכרון תקין"
          body={`רץ ${agoLabel(ops.lastSyncAgeMs!)}${ops.awards24h > 0 ? ` · ${ops.awards24h} שיעורים זוכו ביממה האחרונה` : ''}.`}
        />
      )}

      {ops.lastSyncErrors && (
        <Banner tone="warn" title="הסנכרון דיווח שגיאה" body={ops.lastSyncErrors.slice(0, 220)} />
      )}

      {ops.neverScanned && (
        <Banner
          tone="info"
          title="עדיין אין אף סריקת QR"
          body="אף אחת לא סרקה עדיין את הקוד בכניסה. עד שתתבצע סריקה ראשונה, מסלול הזיכוי על שיעור לא נבדק בפועל."
        />
      )}

      {stale.length > 0 && (
        <Banner
          tone="warn"
          title={`${stale.length} סריקות תקועות`}
          body="נסרקו לפני יותר מ-20 שעות ועדיין לא אושרו בארבוקס — כנראה שהמדריכה לא סימנה נוכחות. הן לא יזוכו עד שזה יטופל."
        />
      )}

      {/* Pending scans */}
      <p className="text-sm font-bold mt-5 mb-2" style={{ color: 'var(--urban-dark)' }}>
        סריקות ממתינות לאישור ({ops.pending.length})
      </p>
      {ops.pending.length === 0 ? (
        <p style={{ fontSize: 13, color: '#9C8B7F' }}>אין סריקות ממתינות.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {ops.pending.slice(0, 12).map(p => (
            <div key={p.id} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px', borderRadius: 12,
              background: p.stale ? '#FDF3E3' : '#FBF6F2',
              border: `1px solid ${p.stale ? '#E8D2A6' : '#EFE3D8'}`,
            }}>
              <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: '#3B2E27' }}>{p.name}</span>
              <span style={{ fontSize: 12.5, color: p.stale ? '#8A6320' : '#9C8B7F' }}>
                {agoLabel(p.ageMs)}{p.stale ? ' · תקוע' : ''}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Proof the path actually completes */}
      <p className="text-sm font-bold mt-5 mb-2" style={{ color: 'var(--urban-dark)' }}>
        זיכויים אחרונים על שיעורים
      </p>
      {ops.recentAwards.length === 0 ? (
        <p style={{ fontSize: 13, color: '#9C8B7F' }}>לא זוכו שיעורים ביממה האחרונה.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {ops.recentAwards.map((a, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px', borderRadius: 12, background: '#EAF6EE', border: '1px solid #CFE7D8',
            }}>
              <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: '#3B2E27' }}>
                {a.name}
                {a.className && <span style={{ fontWeight: 400, color: '#7A6B60' }}> · {a.className}</span>}
              </span>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: '#2E6B44' }}>+{a.points}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
