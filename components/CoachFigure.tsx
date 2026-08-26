'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * The coach figure, holding its animation until it is actually on screen.
 *
 * An animated WebP starts playing the moment the browser paints it, and the
 * greeting poses (wave, celebrate) are encoded to play once. On the home
 * screen the coach sits just below the fold, so the wave was over and frozen
 * on its last frame by the time anyone scrolled down to it — the animation
 * played to an empty room.
 *
 * So the element is mounted with the static pose, and the animated file is
 * only swapped in once the figure is 60% visible. It replays if the user
 * scrolls it fully off screen and back.
 */
export default function CoachFigure({
  src, poster, alt, className, style,
}: {
  /** The animated .webp, or the static image when no animation exists yet. */
  src: string
  /** The static pose. Holds the layout and stands in until the clip starts. */
  poster: string
  alt: string
  className?: string
  style?: React.CSSProperties
}) {
  const wrap = useRef<HTMLDivElement>(null)
  // 0 = not started; each increment remounts the <img>, restarting the clip.
  const [play, setPlay] = useState(0)

  useEffect(() => {
    if (src === poster) return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

    // Warm the cache while the figure is still below the fold so the swap is
    // instant. fetch, not `new Image()`: decoding an animated WebP would start
    // its clock before anyone can see it, which is the bug this component fixes.
    const ac = new AbortController()
    fetch(src, { signal: ac.signal, cache: 'force-cache' }).catch(() => {})

    const el = wrap.current
    if (!el) return

    // Two thresholds rather than one: "gone" means fully off screen, so a
    // small scroll wobble around the trigger point can't restart the clip.
    let away = true
    const io = new IntersectionObserver(([e]) => {
      if (e.intersectionRatio === 0) away = true
      else if (away && e.intersectionRatio >= 0.6) {
        away = false
        setPlay(n => n + 1)
      }
    }, { threshold: [0, 0.6] })
    io.observe(el)

    return () => { ac.abort(); io.disconnect() }
  }, [src, poster])

  const playing = play > 0

  return (
    // inline-block, so the wrapper hugs the poster: the clip is centred on the
    // figure below it, not on whatever width a block element would inherit.
    <div ref={wrap} style={{ position: 'relative', display: 'inline-block', lineHeight: 0 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className={className}
        src={poster}
        alt={alt}
        style={{
          ...style,
          // Kept in the flow so the row never reflows on the swap, and faded
          // rather than removed so nothing can show through behind the clip.
          opacity: playing ? 0 : 1,
          transition: 'opacity 120ms linear',
        }}
      />
      {playing && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={play}
          src={src}
          alt=""
          aria-hidden
          style={{
            ...style,
            position: 'absolute', bottom: 0, left: '50%',
            transform: 'translateX(-50%)',
          }}
        />
      )}
    </div>
  )
}
