import { createHmac, timingSafeEqual } from 'crypto'

// Rotating check-in token ("uc1.<step>.<sig>") — TOTP-style HMAC.
// The kiosk tablet shows the current token as a QR; a member scan is only
// accepted while the token is fresh, proving physical presence in the studio.

const STEP_SECONDS = 30          // token rotates every 30s
const ALLOWED_DRIFT_STEPS = 2    // accept current + 2 previous steps (~90s window)

function secret(): string {
  const s = process.env.CHECKIN_SECRET
  if (!s || s.length < 16) throw new Error('CHECKIN_SECRET is not configured')
  return s
}

function sign(step: number): string {
  return createHmac('sha256', secret()).update(`urban-checkin:${step}`).digest('hex').slice(0, 24)
}

export function currentStep(): number {
  return Math.floor(Date.now() / 1000 / STEP_SECONDS)
}

// Seconds until the current token rotates (for the kiosk countdown)
export function secondsToRotation(): number {
  return STEP_SECONDS - (Math.floor(Date.now() / 1000) % STEP_SECONDS)
}

export function generateToken(): string {
  const step = currentStep()
  return `uc1.${step}.${sign(step)}`
}

export function verifyToken(token: string): boolean {
  const parts = token.split('.')
  if (parts.length !== 3 || parts[0] !== 'uc1') return false
  const step = Number(parts[1])
  if (!Number.isInteger(step)) return false
  const now = currentStep()
  if (step > now || now - step > ALLOWED_DRIFT_STEPS) return false
  const expected = Buffer.from(sign(step))
  const given = Buffer.from(parts[2])
  return expected.length === given.length && timingSafeEqual(expected, given)
}
