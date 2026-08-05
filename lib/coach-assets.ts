import { existsSync } from 'node:fs'
import path from 'node:path'
import type { CoachView } from '@/lib/coach'

/**
 * Prefer an animated pose over the static one, where it exists.
 *
 * The animations arrive a few at a time (21 in total: 7 poses × 3 coaches), so
 * this has to tolerate a half-finished set — every pose keeps its PNG until
 * the matching .webp is dropped in, and nothing needs editing to switch over.
 *
 * Kept out of lib/coach.ts on purpose: that module is pure and safe to import
 * anywhere, and node:fs would make it server-only by accident. Import this one
 * only from server components.
 */

const PUBLIC_DIR = path.join(process.cwd(), 'public')

// existsSync per render would be a syscall on every home-screen load. The set
// of files can't change without a redeploy, so resolve each path once.
const cache = new Map<string, string>()

export function withAnimatedPose(view: CoachView): CoachView {
  const key = `${view.coach}/${view.pose}`

  let image = cache.get(key)
  if (image === undefined) {
    const webp = `/avatars/${view.coach}/${view.pose}.webp`
    image = existsSync(path.join(PUBLIC_DIR, webp)) ? webp : view.image
    cache.set(key, image)
  }

  return image === view.image ? view : { ...view, image }
}
