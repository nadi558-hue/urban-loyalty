// ─── Arbox API client ──────────────────────────────────────────────────────
// Verified by live probing (2026-07-16):
//   • Base URL : https://api.arboxapp.com/index.php/api/v2
//   • Auth     : header `apiKey: <key>`  (Bearer is rejected: 401 NO API KEY)
//   • Envelope : { statusCode, error, data }
//   • /schedule: GET, params from/to, max 7-day window
// ⚠️ The exact attendance/check-in endpoint + field mapping still need the
//    Arbox API docs to finalize before enabling cross-check in production.

const ARBOX_API_URL = process.env.ARBOX_API_URL || 'https://api.arboxapp.com/index.php/api/v2'

// True only when a real key is present — until then the check-in flow stays in
// immediate-award mode so the live QR feature keeps working.
export function arboxConfigured(): boolean {
  const k = process.env.ARBOX_API_KEY
  return !!k && k !== 'your_arbox_api_key' && k.length > 8
}

type ArboxEnvelope<T> = { statusCode: number; error: unknown; data: T }

async function arboxFetch<T = unknown>(
  path: string,
  params?: Record<string, string>,
): Promise<T> {
  const url = new URL(`${ARBOX_API_URL}${path}`)
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))

  const res = await fetch(url.toString(), {
    headers: {
      apiKey: process.env.ARBOX_API_KEY ?? '',
      'Content-Type': 'application/json',
    },
  })
  const body = await res.json().catch(() => null)
  if (!res.ok || (body && typeof body === 'object' && 'errorCode' in body)) {
    throw new Error(`Arbox API error ${res.status}: ${JSON.stringify(body)}`)
  }
  // Unwrap the { statusCode, error, data } envelope when present
  if (body && typeof body === 'object' && 'data' in body) {
    const env = body as ArboxEnvelope<T>
    if (env.statusCode && env.statusCode >= 400) {
      throw new Error(`Arbox API error: ${JSON.stringify(env.error)}`)
    }
    return env.data
  }
  return body as T
}

export type ArboxCheckIn = {
  id: string
  customer_id: string
  class_id: string
  class_name: string
  start_time: string
  branch_id: string
  branch_name: string
  status: 'attended' | 'cancelled' | 'late_cancel'
}

export type ArboxCustomer = {
  id: string
  first_name: string
  last_name: string
  phone: string
  email: string
  birth_date: string
  membership_status: string
  membership_type: string
}

// Format a Date as YYYY-MM-DD for Arbox's from/to params
function ymd(d: Date): string {
  return d.toISOString().slice(0, 10)
}

// Pulls attendance for the given ISO window. Clamps to Arbox's 7-day limit.
// NOTE: endpoint/field mapping to be confirmed against the Arbox docs.
export async function getCheckInsSince(since: string): Promise<ArboxCheckIn[]> {
  const from = new Date(since)
  const to = new Date()
  const maxSpan = 7 * 86_400_000
  if (to.getTime() - from.getTime() > maxSpan) from.setTime(to.getTime() - maxSpan)

  const data = await arboxFetch<ArboxCheckIn[] | { data: ArboxCheckIn[] }>('/schedule', {
    from: ymd(from),
    to: ymd(to),
  })
  return Array.isArray(data) ? data : data?.data ?? []
}
