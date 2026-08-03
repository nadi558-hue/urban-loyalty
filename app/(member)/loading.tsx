/**
 * Shown the instant a member route is tapped.
 *
 * Every member screen is force-dynamic and most of them query Supabase (the
 * home screen also reconciles pending check-ins), so the server round-trip is
 * long enough that without this the app looked frozen after a tap. Next swaps
 * this in immediately and streams the real page in behind it.
 *
 * Deliberately generic — it stands in for home, rewards, history and profile
 * alike, so it mimics the shared shape (hero, overlapping card, list) rather
 * than any one screen.
 */
export default function MemberLoading() {
  return (
    <main className="max-w-md mx-auto" style={{ minHeight: '100dvh', background: '#F1E9E3' }} aria-busy="true">
      <span className="sr-only">טוען…</span>

      {/* Hero */}
      <div className="skeleton" style={{ height: 210, borderRadius: 0 }} />

      {/* Card overlapping the hero, as on the real screens */}
      <div className="clay" style={{
        position: 'relative', zIndex: 3, margin: '-42px 16px 0',
        padding: '18px', display: 'flex', gap: 12,
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div className="skeleton" style={{ height: 22, width: '62%' }} />
            <div className="skeleton" style={{ height: 10, width: '80%' }} />
          </div>
        ))}
      </div>

      {/* Body rows */}
      <div style={{ padding: '20px 16px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="skeleton" style={{ height: 86, borderRadius: 26 }} />
        <div className="skeleton" style={{ height: 64, borderRadius: 20 }} />
        <div className="skeleton" style={{ height: 64, borderRadius: 20 }} />
      </div>
    </main>
  )
}
