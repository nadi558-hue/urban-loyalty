// SMS providers for the Send SMS auth hook.
//
// Supabase natively supports only Twilio, MessageBird, Vonage and TextLocal.
// Israeli gateways are roughly twenty times cheaper per message and include a
// custom sender name at no cost, so the hook exists purely to reach them —
// see docs/SMS_READINESS.md for the comparison.
//
// Everything provider-specific lives in this file. Swapping gateways means
// writing one more `send` function, not touching the hook.

export type SendResult = { ok: true } | { ok: false; error: string }

export type Provider = {
  name: string
  /** `to` is local Israeli format (0XXXXXXXXX). */
  send(to: string, body: string): Promise<SendResult>
}

/**
 * Supabase hands us E.164 without the plus ("972522710381"). Israeli gateways
 * expect the local form, so 972-prefixed numbers are rewritten to a leading 0.
 * Anything else is passed through untouched rather than mangled.
 */
export function toLocalIsraeli(phone: string): string {
  const digits = phone.replace(/[^0-9]/g, '')
  if (digits.startsWith('972')) return '0' + digits.slice(3)
  return digits
}

// ── SMS4FREE ───────────────────────────────────────────────────────────────
// ⚠️ Endpoint and field names are from the public API page, which documents the
// three credential fields (user / pass / key) but not the full request shape.
// Confirm against the API page inside your account before enabling this — it is
// the only thing here that was not verified end to end.
function sms4free(): Provider {
  const key = Deno.env.get('SMS4FREE_KEY') ?? ''
  const user = Deno.env.get('SMS4FREE_USER') ?? ''
  const pass = Deno.env.get('SMS4FREE_PASS') ?? ''
  const sender = Deno.env.get('SMS_SENDER') ?? 'URBAN'

  return {
    name: 'sms4free',
    async send(to, body) {
      if (!key || !user || !pass) return { ok: false, error: 'SMS4FREE credentials missing' }

      const res = await fetch('https://api.sms4free.co.il/ApiSMS/v2/SendSMS', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, user, pass, sender, recipient: to, msg: body }),
      })

      const text = (await res.text()).trim()
      if (!res.ok) return { ok: false, error: `HTTP ${res.status}: ${text.slice(0, 200)}` }

      // Documented as a bare number: positive is the count actually sent,
      // zero or negative is a failure code.
      const n = Number(text)
      if (Number.isFinite(n) && n > 0) return { ok: true }
      return { ok: false, error: `provider returned ${text.slice(0, 200)}` }
    },
  }
}

// ── TextMe ─────────────────────────────────────────────────────────────────
// ⚠️ Same caveat: the request shape must be confirmed against the API docs in
// your TextMe account. Token auth and a JSON body are the shape assumed here.
function textme(): Provider {
  const token = Deno.env.get('TEXTME_TOKEN') ?? ''
  const sender = Deno.env.get('SMS_SENDER') ?? 'URBAN'

  return {
    name: 'textme',
    async send(to, body) {
      if (!token) return { ok: false, error: 'TEXTME_TOKEN missing' }

      const res = await fetch('https://api.textme.co.il/v1/sms/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ sender, recipient: to, message: body }),
      })

      const text = (await res.text()).trim()
      if (!res.ok) return { ok: false, error: `HTTP ${res.status}: ${text.slice(0, 200)}` }
      return { ok: true }
    },
  }
}

// ── Log-only ───────────────────────────────────────────────────────────────
// The default. Sends nothing and always succeeds, so the hook can be deployed
// and enabled before any account exists without a member ever being stranded
// waiting for a message that cannot arrive. The code is printed to the function
// logs, which is also how you test the whole path end to end for free.
function logOnly(): Provider {
  return {
    name: 'log',
    async send(to, body) {
      console.log(`[send-sms] would send to ${to}: ${body}`)
      return { ok: true }
    },
  }
}

export function getProvider(): Provider {
  switch ((Deno.env.get('SMS_PROVIDER') ?? 'log').toLowerCase()) {
    case 'sms4free': return sms4free()
    case 'textme': return textme()
    default: return logOnly()
  }
}
