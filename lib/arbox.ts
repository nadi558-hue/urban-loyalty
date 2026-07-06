const ARBOX_API_URL = process.env.ARBOX_API_URL || 'https://api.arbox.me/api/v1'
const ARBOX_API_KEY = process.env.ARBOX_API_KEY!

async function arboxFetch(path: string, params?: Record<string, string>) {
  const url = new URL(`${ARBOX_API_URL}${path}`)
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  }
  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${ARBOX_API_KEY}`,
      'Content-Type': 'application/json',
    },
  })
  if (!res.ok) {
    throw new Error(`Arbox API error ${res.status}: ${await res.text()}`)
  }
  return res.json()
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

export async function getCheckInsSince(since: string): Promise<ArboxCheckIn[]> {
  const data = await arboxFetch('/checkins', { from: since, limit: '500' })
  return data.data ?? data
}

export async function getCustomer(arboxId: string): Promise<ArboxCustomer> {
  const data = await arboxFetch(`/customers/${arboxId}`)
  return data.data ?? data
}

export async function getAllActiveMembers(): Promise<ArboxCustomer[]> {
  const data = await arboxFetch('/customers', { membership_status: 'active', limit: '1000' })
  return data.data ?? data
}
