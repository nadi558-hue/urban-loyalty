import Link from 'next/link'
import { COACH_NAMES, type CoachView } from '@/lib/coach'
import { Flash, Setting2 } from 'iconsax-reactjs'

/**
 * The coach standing beside a speech bubble, on the home screen.
 *
 * The figure is bottom-aligned at a fixed height, so poses with raised
 * arms (celebrate) simply occupy more of the frame rather than being scaled
 * down — the sliced PNGs already share a baseline, so this reads as one
 * character moving rather than several images of different sizes.
 */
export default function CoachCard({ view }: { view: CoachView }) {
  const { image, message, pose, streak, coach, isMilestone } = view

  return (
    <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'flex-end', gap: 2, padding: '0 16px' }}>

      {/* Speech bubble */}
      <div style={{ flex: 1, paddingBottom: 26 }}>
        <div className="clay-sm" style={{ padding: '12px 14px', position: 'relative' }}>
          {(streak > 0 || isMilestone) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 5 }}>
              <Flash size={14} variant="Bulk" color="#C0906F" />
              <span style={{
                fontFamily: 'var(--font-frank,serif)', fontSize: 12, fontWeight: 700,
                color: '#A66B43', letterSpacing: '0.02em',
              }}>
                {streak} ימים ברצף
              </span>
            </div>
          )}
          <p style={{
            fontFamily: 'var(--font-assistant,sans-serif)', fontSize: 13, lineHeight: 1.5,
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
          fontSize: 11, color: '#9C8B7F', textDecoration: 'none',
          fontFamily: 'var(--font-assistant,sans-serif)',
        }}>
          <Setting2 size={12} variant="Linear" color="#9C8B7F" />
          {COACH_NAMES[coach]} · החלפת מאמן
        </Link>
      </div>

      {/* The coach */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image} alt={`${COACH_NAMES[coach]} — ${pose}`}
        style={{
          height: 190, width: 'auto', objectFit: 'contain', objectPosition: 'bottom',
          flexShrink: 0, filter: 'drop-shadow(0 8px 14px rgba(59,46,39,0.22))',
        }} />
    </div>
  )
}
