/** Instant placeholder for the admin screens — see (member)/loading.tsx. */
export default function AdminLoading() {
  return (
    <main className="max-w-2xl mx-auto px-4 pt-8" dir="rtl" aria-busy="true">
      <span className="sr-only">טוען…</span>
      <div className="skeleton" style={{ height: 30, width: '45%', marginBottom: 24 }} />
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="skeleton" style={{ height: 96, borderRadius: 16 }} />
        <div className="skeleton" style={{ height: 96, borderRadius: 16 }} />
      </div>
      <div className="skeleton" style={{ height: 170, borderRadius: 16, marginBottom: 16 }} />
      <div className="skeleton" style={{ height: 56, borderRadius: 16 }} />
    </main>
  )
}
