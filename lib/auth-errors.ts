import type { AuthError } from '@supabase/supabase-js'

/**
 * Turn a Supabase auth failure into something a member can act on.
 *
 * The login screen used to print `error.message` verbatim, which meant a
 * broken Twilio credential reached a member as
 *   "Error sending confirmation OTP to provider: Authentication Error -
 *    invalid username More information: https://twilio.com/docs/errors/20003"
 * — English, technical, and indistinguishable from "the app is broken".
 *
 * Matching is on `code` first: Supabase added stable codes precisely so this
 * kind of mapping stops depending on provider prose, which changes without
 * warning. The message fallbacks exist because provider-relayed failures
 * (Twilio, in our case) still arrive with no code attached.
 */

const FALLBACK =
  'משהו השתבש. נסו שוב בעוד רגע, ואם זה חוזר — פנו לצוות הסטודיו.'

const SEND_FAILED =
  'יש תקלה זמנית בשליחת קוד האימות. נסו שוב בעוד כמה דקות, ואם זה ממשיך — פנו לצוות הסטודיו.'

const RATE_LIMITED =
  'נשלחו יותר מדי בקשות. המתינו כמה דקות ונסו שוב.'

const BAD_CODE =
  'הקוד שגוי או שפג תוקפו. בקשו קוד חדש ונסו שוב.'

const BAD_PHONE =
  'מספר הטלפון לא תקין. בדקו שהוא מוקלד נכון ונסו שוב.'

const NOT_ALLOWED =
  'לא ניתן להתחבר עם המספר הזה. פנו לצוות הסטודיו.'

const BY_CODE: Record<string, string> = {
  otp_expired: BAD_CODE,
  otp_disabled: NOT_ALLOWED,
  over_sms_send_rate_limit: RATE_LIMITED,
  over_request_rate_limit: RATE_LIMITED,
  over_email_send_rate_limit: RATE_LIMITED,
  sms_send_failed: SEND_FAILED,
  phone_provider_disabled: SEND_FAILED,
  provider_disabled: SEND_FAILED,
  signup_disabled: NOT_ALLOWED,
  user_banned: NOT_ALLOWED,
  validation_failed: BAD_PHONE,
}

export function authErrorMessage(error: AuthError | null | undefined): string {
  if (!error) return FALLBACK

  // The English original never reaches the member, but it is the only clue
  // when diagnosing later — a provider outage looks identical to a typo
  // once it has been through this function.
  if (typeof console !== 'undefined') {
    console.error('[auth]', error.code ?? '-', error.status ?? '-', error.message)
  }

  const byCode = error.code && BY_CODE[error.code]
  if (byCode) return byCode

  const m = (error.message ?? '').toLowerCase()

  // Anything the SMS provider rejected. Twilio's own text is relayed here, so
  // match on the wrapper Supabase adds rather than on Twilio's wording.
  if (m.includes('otp to provider') || (m.includes('sms') && m.includes('fail'))) return SEND_FAILED
  if (m.includes('rate limit') || m.includes('too many') || error.status === 429) return RATE_LIMITED
  if (m.includes('expired') || m.includes('invalid token') || m.includes('token has expired')) return BAD_CODE
  if (m.includes('invalid phone') || m.includes('phone number')) return BAD_PHONE
  if (m.includes('signups not allowed') || m.includes('not allowed')) return NOT_ALLOWED

  return FALLBACK
}
