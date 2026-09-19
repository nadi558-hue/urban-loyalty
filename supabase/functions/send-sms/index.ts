// Supabase "Send SMS" auth hook.
//
// Supabase still owns everything that matters — generating the code, its
// expiry, rate limiting, and verifying it on the way back. This function only
// carries the message to a gateway Supabase cannot talk to natively.
//
// It never runs for a number on the Test OTP list: Supabase checks that list
// first and returns the fixed code without calling any provider. So the trial
// keeps working exactly as it does today, at no cost, even after this is live.

import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0'
import { getProvider, toLocalIsraeli } from './providers.ts'

type Payload = {
  user: { phone: string }
  sms: { otp: string }
}

// Hebrew SMS is UCS-2: 70 characters per segment, and each segment is charged
// separately. This body is well inside one segment — keep it that way.
const message = (otp: string) => `הקוד שלך למועדון Urban: ${otp}`

function fail(status: number, msg: string) {
  return new Response(
    JSON.stringify({ error: { http_code: status, message: msg } }),
    { status, headers: { 'Content-Type': 'application/json' } },
  )
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return fail(405, 'Method not allowed')

  // Without this, anyone who learns the URL can make the studio pay to send
  // SMS to any number they like. Supabase signs every call; we verify it.
  const secret = Deno.env.get('SEND_SMS_HOOK_SECRET')
  if (!secret) return fail(500, 'SEND_SMS_HOOK_SECRET not configured')

  const raw = await req.text()
  let payload: Payload
  try {
    const headers = Object.fromEntries(req.headers)
    // The dashboard shows the secret as "v1,whsec_…"; the library wants the
    // base64 part alone.
    const wh = new Webhook(secret.replace(/^v1,\s*/, ''))
    payload = wh.verify(raw, headers) as Payload
  } catch (e) {
    console.error('[send-sms] signature verification failed', e)
    return fail(401, 'Invalid signature')
  }

  const phone = payload?.user?.phone
  const otp = payload?.sms?.otp
  if (!phone || !otp) return fail(400, 'Missing phone or otp')

  const provider = getProvider()
  const to = toLocalIsraeli(phone)

  let result
  try {
    result = await provider.send(to, message(otp))
  } catch (e) {
    console.error('[send-sms] provider threw', provider.name, e)
    return fail(502, 'SMS provider unreachable')
  }

  if (!result.ok) {
    // Logged with the provider's own words, because the member is about to see
    // a generic Hebrew failure and this is the only place the real reason is
    // recorded. The phone is logged, the code never is.
    console.error('[send-sms] send failed', provider.name, to, result.error)
    return fail(502, 'SMS provider rejected the message')
  }

  // Supabase treats any 200 as success; no body is expected.
  return new Response(null, { status: 200 })
})
