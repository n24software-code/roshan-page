import ProjectLogo from './ProjectLogo.jsx'

/**
 * SECTION 2 — the project logo rail.
 *
 * Desktop: one equal column per project so each lockup sits centred above its
 * media column in SECTION 3, exactly as in the reference.
 * Narrow screens: the same row becomes a swipeable, snap-scrolling rail
 * instead of shrinking the lockups into illegibility.
 */
export default function ProjectNavigation({ projects, activeId, onSelect }) {
  return (
    <nav
      aria-label="ROSHN projects"
      className="rail-scroll shrink-0 overflow-x-auto overflow-y-hidden px-[3.5vw] pt-[2vh] pb-[1.4vh] sm:px-[2vw] lg:px-0"
    >
      <ul className="mx-auto flex w-max min-w-full list-none justify-start gap-[4vw] p-0 sm:gap-[3vw] lg:grid lg:w-full lg:grid-cols-7 lg:justify-items-center lg:gap-0">
        {projects.map((project) => (
          <li key={project.id} className="flex justify-center">
            <ProjectLogo
              project={project}
              isActive={project.id === activeId}
              onSelect={onSelect}
            />
          </li>
        ))}
      </ul>
    </nav>
  )
}
