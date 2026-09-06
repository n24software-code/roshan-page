import { memo } from 'react'
import ProjectMark from './marks/ProjectMark.jsx'

/**
 * SECTION 2 item — one clickable project lockup.
 *
 * Three states, kept restrained on purpose:
 *   normal  white artwork at ~72% opacity, hairline border
 *   hover   subtle scale-up + brightening, smooth transition
 *   active  full-strength artwork, solid border, soft glow
 */
function ProjectLogo({ project, isActive, onSelect }) {
  const showSubline = project.subline !== false

  return (
    <button
      type="button"
      onClick={() => onSelect(project.id)}
      aria-pressed={isActive}
      aria-label={`Play ${project.name}${project.label ? ` ${project.label}` : ''} film`}
      className="group flex shrink-0 snap-center cursor-pointer flex-col items-center gap-[0.9vh] bg-transparent p-0 text-center outline-none"
    >
      <span
        className={[
          // Width is driven by viewport width, but capped against viewport height so
        // short landscape phones do not push the media band off-screen.
        'relative flex w-[max(72px,min(clamp(80px,6.9vw,148px),19vh))] flex-col items-center justify-between',
          'aspect-[136/222] px-[7%] py-[7%]',
          'border transition-[transform,opacity,border-color,box-shadow,filter] duration-500 ease-out',
          'will-change-transform motion-reduce:transform-none',
          'group-focus-visible:ring-2 group-focus-visible:ring-white/70 group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-black/40',
          isActive
            ? 'scale-[1.05] border-white text-white opacity-100 shadow-[0_0_28px_-6px_rgba(255,255,255,0.55)]'
            : 'border-white/35 text-white opacity-70 group-hover:scale-[1.04] group-hover:border-white/70 group-hover:opacity-100',
        ].join(' ')}
      >
        {project.logo ? (
          <img
            src={project.logo}
            alt=""
            aria-hidden="true"
            className="my-auto w-full object-contain"
          />
        ) : (
          <>
            <ProjectMark
              mark={project.mark}
              className="mt-[4%] w-[74%] shrink-0"
            />

            <span className="flex w-full flex-col items-center gap-[2%] pb-[2%]">
              <span
                dir="rtl"
                lang="ar"
                className="font-[var(--font-arabic)] text-[clamp(13px,1.16vw,25px)] leading-[1.15] font-semibold"
              >
                {project.nameAr}
              </span>
              <span className="text-[clamp(7px,0.62vw,13px)] leading-tight font-medium tracking-[0.24em] whitespace-pre-line">
                {project.name.replace(' ', '\n')}
              </span>

              {showSubline && (
                <span className="mt-[6%] flex w-full items-center gap-[4%]">
                  <span className="h-px flex-1 bg-current opacity-80" />
                  <span
                    dir="rtl"
                    lang="ar"
                    className="font-[var(--font-arabic)] text-[clamp(5px,0.4vw,9px)] leading-none whitespace-nowrap"
                  >
                    من مجموعة روشن
                  </span>
                  <span className="h-px flex-1 bg-current opacity-80" />
                </span>
              )}
            </span>
          </>
        )}
      </span>

      {/* Status label ("Progress") sits under the lockup, as in the reference. */}
      <span
        aria-hidden={!project.label}
        className={[
          'text-[clamp(9px,0.78vw,17px)] leading-none font-bold tracking-wide transition-opacity duration-500',
          project.label ? (isActive ? 'opacity-100' : 'opacity-80') : 'opacity-0',
        ].join(' ')}
      >
        {project.label ?? ' '}
      </span>
    </button>
  )
}

export default memo(ProjectLogo)
