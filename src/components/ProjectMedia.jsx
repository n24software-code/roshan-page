import { memo, useEffect, useState } from 'react'
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

/**
 * SECTION 3 (gallery state) — the full-width band of one media column per
 * project, mirroring the bottom half of the reference.
 *
 * The active project's column is deliberately transparent: the fullscreen
 * video layer sits directly behind it, so the live film shows through that
 * slot without mounting a second <video>. Every other column renders its
 * poster (when supplied) or the branded placeholder.
 */
function ProjectMedia({ projects, activeId, onSelect }) {
  // Below `md` the seven-slice mosaic would collapse into unreadable slivers,
  // so the media band becomes a single full-bleed panel for the active project.
  const isCompact = useMediaQuery('(max-width: 767px)')
  const columns = isCompact
    ? projects.filter((project) => project.id === activeId)
    : projects

  return (
    <div className="absolute inset-0 z-20 flex">
      {columns.map((project, index) => {
        const isActive = project.id === activeId

        return (
          <button
            key={project.id}
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            onClick={() => onSelect(project.id)}
            className="group relative min-w-0 flex-1 cursor-pointer overflow-hidden border-0 bg-transparent p-0 outline-none"
          >
            {!isActive && (
              <>
                {project.poster ? (
                  <img
                    src={project.poster}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover opacity-80"
                  />
                ) : (
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
        )
      })}
    </div>
  )
}

export default memo(ProjectMedia)
