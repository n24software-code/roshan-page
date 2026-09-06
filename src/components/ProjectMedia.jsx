import { memo, useEffect, useRef, useState } from 'react'
import ProjectMark from './marks/ProjectMark.jsx'

function useMediaQuery(query) {
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches,
  )

  useEffect(() => {
    const list = window.matchMedia(query)
    const onChange = (event) => setMatches(event.matches)
    setMatches(list.matches)
    list.addEventListener('change', onChange)
    return () => list.removeEventListener('change', onChange)
  }, [query])

  return matches
}

// Seven films starting at the same instant is a thundering herd: they compete
// for bandwidth, none reaches a first frame quickly, and the renderer stalls.
// Each column waits this much longer than the one to its left, which serialises
// the cold start without changing the end state — all seven playing at once.
const START_STAGGER_MS = 450

/**
 * One column's film. Always muted and looping — this is the ambient preview
 * band, not the film experience, so the page still carries no audio UI.
 *
 * `preload="none"` keeps the element inert until its turn comes; the first
 * play() is what starts the fetch. `paused` suspends it while the fullscreen
 * overlay is open, so the column films are not decoding behind a layer that
 * completely covers them. The source is released on unmount.
 */
function ColumnVideo({ src, poster, paused, startDelay }) {
  const ref = useRef(null)
  const startedRef = useRef(false)
  const pausedRef = useRef(paused)
  pausedRef.current = paused

  // The source is owned imperatively rather than through JSX. Releasing it on
  // cleanup means removing the attribute, and React would not re-apply a `src`
  // prop it considers unchanged — so under StrictMode's mount/unmount/mount the
  // element would come back permanently sourceless.
  useEffect(() => {
    const el = ref.current
    if (!el || !src) return

    el.muted = true
    el.src = src
    startedRef.current = false

    const timer = setTimeout(() => {
      startedRef.current = true
      if (!pausedRef.current) el.play().catch(() => {})
    }, startDelay)

    return () => {
      clearTimeout(timer)
      el.pause()
      el.removeAttribute('src')
      el.load()
    }
  }, [src, startDelay])

  // Suspend while the fullscreen overlay covers the band, resume on close.
  useEffect(() => {
    const el = ref.current
    if (!el || !startedRef.current) return
    if (paused) el.pause()
    else {
      el.muted = true
      el.play().catch(() => {})
    }
  }, [paused])

  return (
    <video
      ref={ref}
      poster={poster ?? undefined}
      className="absolute inset-0 h-full w-full object-cover"
      playsInline
      disablePictureInPicture
      loop
      muted
      preload="none"
      aria-hidden="true"
    />
  )
}

/**
 * SECTION 3 — the full-width band of one media column per project, mirroring
 * the bottom half of the reference.
 *
 * Every project plays its own film in its own column, directly beneath that
 * project's lockup in SECTION 2. A project without a film keeps its poster or
 * the branded placeholder, so a missing video never breaks the band.
 */
function ProjectMedia({ projects, activeId, paused, onSelect }) {
  // Below `md` the seven-slice mosaic would collapse into unreadable slivers,
  // so the media band becomes a single full-bleed panel for the active project.
  const isCompact = useMediaQuery('(max-width: 767px)')
  const columns = isCompact
    ? projects.filter((project) => project.id === activeId)
    : projects

  return (
    <div className="absolute inset-0 z-20 flex">
      {columns.map((project, index) => (
        <button
          key={project.id}
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          onClick={() => onSelect(project.id)}
          className="group relative min-w-0 flex-1 cursor-pointer overflow-hidden border-0 bg-transparent p-0 outline-none"
        >
          {/* Base layer: what the column shows while its film loads, and what
              stands in permanently for a project that has no film yet. */}
          <span
            className="absolute inset-0"
            style={{
              backgroundImage:
                'linear-gradient(184deg, #000000 0%, #04120e 46%, #061c17 82%, #08231c 100%)',
              // A touch of per-column variance so the placeholder band
              // reads like footage rather than a repeated swatch.
              filter: `brightness(${0.82 + ((index % 3) * 0.12)})`,
            }}
          />

          {project.video ? (
            <ColumnVideo
              src={project.video}
              poster={project.poster}
              paused={paused}
              startDelay={index * START_STAGGER_MS}
            />
          ) : (
            <>
              {project.poster && (
                <img
                  src={project.poster}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover opacity-80"
                />
              )}

              <ProjectMark
                mark={project.mark}
                className="absolute top-1/2 left-1/2 w-[34%] max-w-[110px] -translate-x-1/2 -translate-y-1/2 text-white opacity-[0.06] transition-opacity duration-500 group-hover:opacity-[0.16]"
              />
            </>
          )}

          {/* Black roll-off at the top of every column, as in the reference. */}
          <span
            className="pointer-events-none absolute inset-x-0 top-0 h-[26%]"
            style={{
              backgroundImage:
                'linear-gradient(to bottom, #000000 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0) 100%)',
            }}
          />

          {/* Hairline seam between columns. */}
          <span className="pointer-events-none absolute inset-y-0 right-0 w-px bg-white/[0.06]" />
        </button>
      ))}
    </div>
  )
}

export default memo(ProjectMedia)
