/** Shared platform detection for the "add to home screen" flows. */

export type Platform = 'ios-safari' | 'ios-other' | 'android' | 'desktop' | 'inapp'

/**
 * In-app browsers (WhatsApp / Instagram / Facebook / TikTok) cannot install a
 * PWA at all — the only route is opening the link in the real browser first.
 * Worth detecting separately because the studio shares this link over WhatsApp,
 * so it is the single most likely place a member opens it from.
 */
export function detectPlatform(ua = navigator.userAgent): Platform {
  if (/FBAN|FBAV|Instagram|Line\/|Twitter|WhatsApp|; wv\)|GSA\//i.test(ua)) return 'inapp'
  const isIos = /iphone|ipad|ipod/i.test(ua)
  if (isIos) {
    const isSafari = /safari/i.test(ua) && !/crios|fxios|edgios/i.test(ua)
    return isSafari ? 'ios-safari' : 'ios-other'
  }
  if (/android/i.test(ua)) return 'android'
  return 'desktop'
}

/** Already running as an installed app — nothing to offer. */
export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as { standalone?: boolean }).standalone === true
  )
}

/**
 * Step-by-step wording per platform.
 *
 * iOS never exposes a programmatic install prompt, so on Safari the manual
 * steps are the whole feature rather than a fallback.
 */
export function installSteps(p: Platform): { title: string; steps: string[]; note?: string } {
  switch (p) {
    case 'ios-safari':
      return {
        title: 'הוספה למסך הבית · אייפון',
        steps: [
          'הקישו על כפתור השיתוף ⬆️ בתחתית המסך',
          'גללו ובחרו "הוספה למסך הבית"',
          'הקישו "הוסף" — והאפליקציה תופיע כמו אפליקציה רגילה',
        ],
      }
    case 'ios-other':
      return {
        title: 'צריך את Safari',
        steps: [
          'העתיקו את הכתובת של האפליקציה',
          'פתחו אותה בדפדפן Safari',
          'שם: שיתוף ⬆️ → "הוספה למסך הבית"',
        ],
        note: 'באייפון רק Safari יודע להוסיף אפליקציה למסך הבית.',
      }
    case 'android':
      return {
        title: 'הוספה למסך הבית · אנדרואיד',
        steps: [
          'הקישו על תפריט שלוש הנקודות ⋮ בכרום',
          'בחרו "התקנת אפליקציה" או "הוספה למסך הבית"',
          'אשרו — והאפליקציה תותקן',
        ],
      }
    case 'inapp':
      return {
        title: 'פתחו בדפדפן תחילה',
        steps: [
          'הקישו על תפריט ⋮ למעלה',
          'בחרו "פתח בדפדפן" / "Open in browser"',
          'שם תוכלו להוסיף את האפליקציה למסך הבית',
        ],
        note: 'לא ניתן להתקין אפליקציה מתוך ווטסאפ או אינסטגרם.',
      }
    default:
      return {
        title: 'הוספה למסך הבית',
        steps: [
          'פתחו את האפליקציה בטלפון הנייד',
          'שם תוכלו להוסיף אותה למסך הבית',
        ],
        note: 'ההתקנה זמינה מהטלפון.',
      }
  }
}
