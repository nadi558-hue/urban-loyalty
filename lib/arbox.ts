// ─── Arbox API client ──────────────────────────────────────────────────────
// Verified against the live API + OpenAPI spec (arboxserver.arboxapp.com/docs/api):
//   • Base URL : https://arboxserver.arboxapp.com/api/public
//   • Auth     : header `api-key: <key>`
//   • Envelope : { statusCode, data, extra }
//   • Reports  : GET /v3/reports/{reportName}?fromDate=&toDate=&limit=&page=
//   • Attendance = bookingsReport rows where check_in === "Yes"
//   • Late cancels = lateCancellationReport
// Studio is in Israel (UTC+3 / IDT in summer) — class times are local.

const ARBOX_API_URL = process.env.ARBOX_API_URL || 'https://arboxserver.arboxapp.com/api/public'
const IL_OFFSET = '+03:00' // IDT (summer). TODO: handle winter (+02:00) if needed.

// True only when a real key is present — until then the check-in flow stays in
// immediate-award mode so the live QR feature keeps working.
export function arboxConfigured(): boolean {
  const k = process.env.ARBOX_API_KEY
  return !!k && k !== 'your_arbox_api_key' && k.length > 8
}

async function arboxFetch<T = unknown>(path: string, params?: Record<string, string>): Promise<T[]> {
  const url = new URL(`${ARBOX_API_URL}${path}`)
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))

  const res = await fetch(url.toString(), {
    headers: { 'api-key': process.env.ARBOX_API_KEY ?? '', 'Content-Type': 'application/json' },
  })
  const body = await res.json().catch(() => null)
  if (!res.ok || !body || (typeof body === 'object' && 'error' in body && body.error)) {
    throw new Error(`Arbox API error ${res.status}: ${JSON.stringify(body)?.slice(0, 300)}`)
  }
  const data = (body as { data?: T[] }).data
  return Array.isArray(data) ? data : []
}

function ymd(d: Date): string {
  return d.toISOString().slice(0, 10)
}

// A member attendance/late-cancel event, normalized for cross-verification.
export type ArboxEvent = {
  arbox_checkin_id: string   // stable unique id for idempotency
  arbox_user_id: string      // maps to members.arbox_id
  class_name: string | null
  branch: string | null
  start: string              // ISO datetime of class start
}

// Raw shapes (only the fields we use)
type BookingRow = {
  user_id: number
  date: string        // "2026-07-21"
  time: string        // "07:30"
  class_name: string | null
  location_name: string | null
  schedule_location: string | null
  check_in: 'Yes' | 'No' | string
}
type LateCancelRow = {
  booking_id: number
  membership_user_id: number
  session_name: string | null
  start_time: string  // "2026-07-16 19:00:00"
  location_name: string | null
}

// Attended check-ins in the window (bookings with check_in === "Yes").
export async function getAttendedCheckIns(fromDate: string, toDate: string): Promise<ArboxEvent[]> {
  const rows = await arboxFetch<BookingRow>('/v3/reports/bookingsReport', {
    fromDate, toDate, limit: '500',
  })
  return rows
    .filter((r) => String(r.check_in).toLowerCase() === 'yes')
    .map((r) => ({
      // No booking id in this report → synthesize a stable one per member+session
      arbox_checkin_id: `bk-${r.user_id}-${r.date}-${r.time}`,
      arbox_user_id: String(r.user_id),
      class_name: r.class_name,
      branch: r.location_name ?? r.schedule_location,
      start: `${r.date}T${r.time}:00${IL_OFFSET}`,
    }))
}

// Late cancellations in the window (break the member's streak, no coins).
export async function getLateCancellations(fromDate: string, toDate: string): Promise<ArboxEvent[]> {
  const rows = await arboxFetch<LateCancelRow>('/v3/reports/lateCancellationReport', {
    fromDate, toDate, limit: '500',
  })
  return rows.map((r) => ({
    arbox_checkin_id: `lc-${r.booking_id}`,
    arbox_user_id: String(r.membership_user_id),
    class_name: r.session_name,
    branch: r.location_name,
    start: `${(r.start_time || '').replace(' ', 'T')}${IL_OFFSET}`,
  }))
}

// Convenience: window as YYYY-MM-DD strings, clamped to Arbox's limits.
export function reportWindow(since: string): { fromDate: string; toDate: string } {
  const from = new Date(since)
  const to = new Date()
  const maxSpan = 30 * 86_400_000 // reports allow a wider window than /schedule
  if (to.getTime() - from.getTime() > maxSpan) from.setTime(to.getTime() - maxSpan)
  return { fromDate: ymd(from), toDate: ymd(to) }
}
