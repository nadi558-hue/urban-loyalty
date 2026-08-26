import Link from 'next/link'
import { COACH_NAMES, type CoachView } from '@/lib/coach'
import { Flash, Setting2 } from 'iconsax-reactjs'
import CoachFigure from '@/components/CoachFigure'

/**
 * The coach standing beside a speech bubble, on the home screen.
 *
 * The figure is bottom-aligned at a fixed height, so poses with raised
 * arms (celebrate) simply occupy more of the frame rather than being scaled
 * down — the sliced PNGs already share a baseline, so this reads as one
 * character moving rather than several images of different sizes.
 */
/** Three sparkles around the figure on a milestone, staggered so they read as a
 *  burst rather than one flash. Gold, small, and gone in under two seconds. */
const SPARKLES = [
  { at: { top: 6,  right: 2  }, size: 15, delay: 0   },
  { at: { top: 34, left: -4  }, size: 11, delay: 180 },
  { at: { top: 62, right: 12 }, size: 9,  delay: 340 },
] as const

export default function CoachCard({ view, poster }: { view: CoachView; poster: string }) {
  const { image, message, pose, streak, coach, isMilestone } = view

  // An animated pose already contains its own crown, sparkles and motion, so
  // the CSS celebration would play a second, offset one on top of it. Poses
  // that are still a static PNG keep the CSS version.
  const isAnimated = image.endsWith('.webp')

  return (
    <div className="coach-stage" style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'flex-end', gap: 2, padding: '0 16px' }}>

      {/* Speech bubble */}
      <div style={{ flex: 1, paddingBottom: 26 }}>
        <div className="clay-sm coach-bubble" style={{ padding: '12px 14px', position: 'relative' }}>
          {(streak > 0 || isMilestone) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 5 }}>
              <Flash size={14} variant="Bulk" color="#C0906F" />
              <span style={{
                fontFamily: 'var(--font-frank,serif)', fontSize: 13, fontWeight: 700,
                color: '#A66B43', letterSpacing: '0.02em',
              }}>
                {streak} שיעורים ברצף
              </span>
            </div>
          )}
          <p style={{
            fontFamily: 'var(--font-assistant,sans-serif)', fontSize: 14, lineHeight: 1.5,
            color: '#3B2E27',
          }}>
            {message}
          </p>

          {/* Tail, pointing right toward the coach (RTL layout) */}
          <span aria-hidden style={{
            position: 'absolute', bottom: 14, left: -7,
            width: 14, height: 14, transform: 'rotate(45deg)',
            background: 'var(--clay-face)',
            boxShadow: 'inset 2px -2px 4px -2px var(--clay-shade)',
            borderRadius: 3,
          }} />
        </div>

        <Link href="/coach" style={{
          display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 7, marginRight: 4,
          fontSize: 12.5, color: '#9C8B7F', textDecoration: 'none',
          fontFamily: 'var(--font-assistant,sans-serif)',
        }}>
          <Setting2 size={12} variant="Linear" color="#9C8B7F" />
          {COACH_NAMES[coach]} · החלפת מאמן
        </Link>
      </div>

      {/* The coach. The animation lives on this element alone so the entrance on
          the wrapper and the breathing loop here don't overwrite each other's
          transform. */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        {isMilestone && !isAnimated && SPARKLES.map((sp, i) => (
          <span key={i} aria-hidden className="coach-sparkle" style={{
            position: 'absolute', ...sp.at, fontSize: sp.size, lineHeight: 1, color: '#C0906F',
            animationDelay: `${sp.delay}ms`, pointerEvents: 'none',
          }}>✦</span>
        ))}
        <CoachFigure
          className={isAnimated ? undefined : `coach-figure${isMilestone ? ' is-milestone' : ''}`}
          src={image}
          poster={poster}
          alt={`${COACH_NAMES[coach]} — ${pose}`}
          style={{
            height: 190, width: 'auto', objectFit: 'contain', objectPosition: 'bottom',
            display: 'block', filter: 'drop-shadow(0 8px 14px rgba(59,46,39,0.22))',
          }}
        />
      </div>
    </div>
  )
}
