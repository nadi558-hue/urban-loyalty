import { NextRequest, NextResponse } from 'next/server'

export const REFERRAL_COOKIE = 'urban_ref'
const NINETY_DAYS = 60 * 60 * 24 * 90

/**
 * Referral landing: /join?ref=CODE
 *
 * Members are imported from Arbox rather than signing up in the app, so there
 * is no registration step to capture the code at. Instead we park it in a
 * cookie and attach it on the friend's first authenticated load (see
 * lib/referrals.ts), which is the first moment we know who they are.
 */
export function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('ref')?.trim().toUpperCase()
  const res = NextResponse.redirect(new URL('/login', req.url))

  // Codes are `upper(substr(md5(...), 1, 6))` in the schema; keep it strict so
  // a junk query string can't write an arbitrary cookie value.
  if (code && /^[A-Z0-9]{4,12}$/.test(code)) {
    res.cookies.set(REFERRAL_COOKIE, code, {
      maxAge: NINETY_DAYS,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    })
  }
  return res
}
