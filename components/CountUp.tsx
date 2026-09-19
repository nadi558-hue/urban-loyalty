'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Counts from 0 to `value` in step with the gauge arc sweeping in.
 *
 * Server-rendered as the final value, so anyone without JS (and the first
 * paint before hydration) sees the real number rather than a 0 — the count-up
 * only replaces it once it can actually animate. Duration matches the arc's
 * CSS transition so the two arrive together.
 */
export default function CountUp({ value, duration = 900 }: { value: number; duration?: number }) {
  const [shown, setShown] = useState(value)
  const raf = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (value <= 0) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // Deliberate: matchMedia is browser-only. On first render `shown` already
    // equals `value`, so this only fires when `value` itself changes and the
    // user has asked for no motion — jump to the number, skip the animation.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (reduce) { setShown(value); return }

    const t0 = performance.now()
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration)
      // Same ease-out family as the arc's cubic-bezier — fast start, soft landing.
      const eased = 1 - Math.pow(1 - p, 3)
      setShown(Math.round(eased * value))
      if (p < 1) raf.current = requestAnimationFrame(tick)
    }
    setShown(0)
    raf.current = requestAnimationFrame(tick)
    return () => { if (raf.current) cancelAnimationFrame(raf.current) }
  }, [value, duration])

  return <>{shown}</>
}
