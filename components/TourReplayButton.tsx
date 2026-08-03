'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft2, InfoCircle } from 'iconsax-reactjs'
import { TOUR_KEY, TOUR_REPLAY_EVENT } from './TourGuide'

/**
 * Replays the first-run walkthrough.
 *
 * The tour points at things that only exist on the home screen, so this clears
 * the "seen" flag and sends the member there rather than trying to run it here.
 */
export default function TourReplayButton() {
  const router = useRouter()

  return (
    <button
      onClick={() => {
        try { localStorage.removeItem(TOUR_KEY) } catch { /* storage blocked */ }
        router.push('/home')
        // If we're already on /home the route won't remount, so nudge it too.
        setTimeout(() => window.dispatchEvent(new Event(TOUR_REPLAY_EVENT)), 60)
      }}
      style={{
        width: '100%', background: 'transparent', border: 'none', cursor: 'pointer',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 18px', textAlign: 'right',
      }}
    >
      <span style={{
        display: 'flex', alignItems: 'center', gap: 8,
        fontSize: 14, color: '#3B2E27', fontFamily: 'var(--font-assistant,sans-serif)',
      }}>
        <InfoCircle size={18} variant="Bulk" color="#96613F" />
        סיור מודרך באפליקציה
      </span>
      <ArrowLeft2 size={17} variant="Linear" color="#C0906F" />
    </button>
  )
}
