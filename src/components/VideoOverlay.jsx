import { useEffect, useRef } from 'react'
import ProjectMark from './marks/ProjectMark.jsx'

/**
 * The fullscreen film overlay.
 *
 * Sits above every other layer on an opaque black backdrop, so nothing from
 * the showcase behind it is visible.
 *
 * The film plays WITH SOUND: the logo click is the user gesture that unlocks
 * audio, so the overlay opens with `muted = false` and `volume = 1`. If a
 * browser still refuses audible autoplay it falls back to a muted play — the
 * film keeps running and no audio UI is ever shown.
 *
 * The <video> is mounted only while the overlay is open and its source is
 * released on close, so no film keeps buffering in the background.
 */
export default function VideoOverlay({ project, onClose }) {
  const videoRef = useRef(null)
  const closeRef = useRef(null)
  const isOpen = Boolean(project)
  const src = project?.video ?? null

  // Load + autoplay the selected film; release it again on close.
  useEffect(() => {
    const el = videoRef.current
    if (!el || !src) return

    el.src = src
    el.load()

    const start = async () => {
      if (!el.paused) return
      // The click that opened this overlay is the activating gesture.
      el.muted = false
      el.volume = 1
      try {
        await el.play()
      } catch {
        // Audible autoplay refused — keep the film running silently rather
        // than surfacing a control the design does not have.
        el.muted = true
        try {
          await el.play()
        } catch {
          try {
            el.currentTime = 0.05
          } catch {
            /* seeking before metadata is fine to ignore */
          }
        }
      }
    }

    // Kick playback off immediately — the browser queues the request until
    // the first frames arrive — and keep `loadeddata` as a backstop in case a
    // browser rejects a play() issued before any media data exists.
    start()
    el.addEventListener('loadeddata', start)
    return () => {
      el.removeEventListener('loadeddata', start)
      el.pause()
      el.removeAttribute('src')
      el.load()
    }
  }, [src])

  // Esc closes, and focus lands on the close button so the overlay is
  // keyboard-operable the moment it opens.
  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    closeRef.current?.focus()
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-hidden={!isOpen}
      aria-label={project ? `${project.name} film` : undefined}
      className="fixed inset-0 z-50 h-[100svh] w-screen bg-black transition-opacity duration-500 ease-out"
      style={{
        opacity: isOpen ? 1 : 0,
        visibility: isOpen ? 'visible' : 'hidden',
        pointerEvents: isOpen ? 'auto' : 'none',
      }}
    >
      {isOpen && src && (
        <video
          ref={videoRef}
          key={src}
          className="absolute inset-0 h-full w-full object-cover"
          playsInline
          disablePictureInPicture
          loop
          preload="auto"
          poster={project.poster ?? undefined}
        />
      )}

      {/* Graceful stand-in for a project whose film is not mapped yet. */}
      {isOpen && !src && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-6"
          style={{
            backgroundImage:
              'linear-gradient(180deg, #00382d 0%, #011f19 45%, #000000 100%)',
          }}
        >
          <ProjectMark
            mark={project.mark}
            className="w-[clamp(90px,11vw,180px)] text-white/85"
          />
          <p className="m-0 text-[clamp(11px,0.9vw,16px)] tracking-[0.3em] text-white/60 uppercase">
            Film coming soon
          </p>
        </div>
      )}

      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label="Close film"
        className="absolute top-[max(3vh,18px)] right-[max(3vw,18px)] z-10 flex h-[clamp(44px,3.4vw,60px)] w-[clamp(44px,3.4vw,60px)] cursor-pointer items-center justify-center rounded-full border border-white/60 bg-black/45 text-white backdrop-blur-sm transition-[background-color,border-color,transform] duration-300 hover:scale-105 hover:border-white hover:bg-black/70 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-[46%] w-[46%]"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M5 5 L19 19 M19 5 L5 19" />
        </svg>
      </button>
    </div>
  )
}
