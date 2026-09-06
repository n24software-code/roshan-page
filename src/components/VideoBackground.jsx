import { useEffect, useRef } from 'react'

const FADE_MS = 700

/**
 * SECTION 3 ambient layer — a fullscreen (100vw x 100vh) crossfading video
 * layer that shows through the active project's column on the main page.
 *
 * Always muted: this is the quiet preview behind the showcase, not the film
 * experience, so the page carries no audio UI at all.
 *
 * Two <video> elements are swapped imperatively: the incoming source loads into
 * the back layer, and only once it can actually paint do we crossfade. Nothing
 * here is React state, so switching projects never re-renders the page tree.
 *
 * Lifecycle guarantees:
 *   - only ever one source loading at a time (`preload="none"` by default)
 *   - the outgoing video is paused and its src released after the crossfade,
 *     so decoders and network buffers are not leaked
 *   - `paused` suspends playback entirely while the fullscreen overlay is open
 *   - everything is torn down on unmount
 */
export default function VideoBackground({ src, poster, paused }) {
  const layerRefs = [useRef(null), useRef(null)]
  const frontRef = useRef(0)
  const pausedRef = useRef(paused)
  pausedRef.current = paused

  // --- source swap + crossfade -------------------------------------------
  useEffect(() => {
    const layers = [layerRefs[0].current, layerRefs[1].current]
    if (!layers[0] || !layers[1]) return

    const front = layers[frontRef.current]
    const back = layers[1 - frontRef.current]

    const play = async (el) => {
      el.muted = true
      if (pausedRef.current) return
      try {
        await el.play()
      } catch {
        // Playback refused: nudge the element so it at least paints its first
        // frame instead of sitting as a black rectangle.
        try {
          el.currentTime = 0.05
        } catch {
          /* seeking before metadata is fine to ignore */
        }
      }
    }

    if (!src) {
      front.style.opacity = '0'
      const idle = setTimeout(() => {
        front.pause()
        front.removeAttribute('src')
        front.load()
        front.dataset.src = ''
      }, FADE_MS)
      return () => clearTimeout(idle)
    }

    // Same film already on screen: just make sure it is running.
    if (front.dataset.src === src) {
      play(front)
      return
    }

    let cancelled = false
    let releaseTimer

    back.dataset.src = src
    back.poster = poster ?? ''
    back.preload = 'auto'
    back.src = src
    back.load()

    const reveal = () => {
      if (cancelled) return
      back.removeEventListener('loadeddata', reveal)
      clearTimeout(safetyTimer)

      back.style.opacity = '1'
      front.style.opacity = '0'
      frontRef.current = 1 - frontRef.current
      play(back)

      // Stop and fully release the outgoing film once it is invisible.
      releaseTimer = setTimeout(() => {
        if (cancelled) return
        front.pause()
        front.removeAttribute('src')
        front.load()
        front.dataset.src = ''
      }, FADE_MS)
    }

    // If decoding stalls, reveal anyway rather than stranding the user.
    const safetyTimer = setTimeout(reveal, 2500)
    back.addEventListener('loadeddata', reveal)

    return () => {
      cancelled = true
      clearTimeout(safetyTimer)
      clearTimeout(releaseTimer)
      back.removeEventListener('loadeddata', reveal)
    }
  }, [src, poster])

  // --- suspend while the fullscreen overlay is open -----------------------
  useEffect(() => {
    const el = layerRefs[frontRef.current].current
    if (!el || !el.dataset.src) return
    if (paused) {
      el.pause()
    } else {
      el.muted = true
      el.play().catch(() => {})
    }
  }, [paused])

  // --- unmount cleanup ----------------------------------------------------
  useEffect(() => {
    const layers = layerRefs.map((ref) => ref.current)
    return () => {
      layers.forEach((el) => {
        if (!el) return
        el.pause()
        el.removeAttribute('src')
        el.load()
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-black" aria-hidden="true">
      {layerRefs.map((ref, index) => (
        <video
          key={index}
          ref={ref}
          className="absolute inset-0 h-full w-full object-cover"
          style={{
            opacity: index === 0 ? 1 : 0,
            transition: `opacity ${FADE_MS}ms ease-in-out`,
          }}
          playsInline
          disablePictureInPicture
          loop
          muted
          preload="none"
        />
      ))}
    </div>
  )
}
