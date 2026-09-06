import { useCallback, useMemo, useState } from 'react'
import { projects, defaultProjectId, getProject } from '../data/projects.js'
import RoshnHeader from './RoshnHeader.jsx'
import ProjectNavigation from './ProjectNavigation.jsx'
import ProjectMedia from './ProjectMedia.jsx'
import VideoBackground from './VideoBackground.jsx'
import VideoOverlay from './VideoOverlay.jsx'
import Overlay from './Overlay.jsx'

/**
 * The three sections of roshn-page-design.jpeg, stacked in one fixed viewport:
 *
 *   SECTION 1  RoshnHeader        ROSHN GROUP logo, upper-left
 *   SECTION 2  ProjectNavigation  the seven clickable project lockups
 *   SECTION 3  ProjectMedia       the full-width media band, with the ambient
 *                                 VideoBackground showing through the active
 *                                 project's column
 *
 * Clicking a lockup opens that project's film in VideoOverlay — an opaque
 * fullscreen layer above everything else, playing silently. Closing it returns
 * here. Nothing navigates, nothing reloads, no route changes.
 */
export default function RoshnPage() {
  const [activeId, setActiveId] = useState(defaultProjectId)
  const [openId, setOpenId] = useState(null)

  const activeProject = useMemo(() => getProject(activeId), [activeId])
  const openProject = useMemo(() => (openId ? getProject(openId) : null), [openId])

  const handleSelect = useCallback((id) => {
    setActiveId(id)
    setOpenId(id)
  }, [])

  const handleClose = useCallback(() => setOpenId(null), [])

  return (
    <>
      <div className="fixed inset-0 flex h-[100svh] w-screen flex-col overflow-hidden bg-black">
        {/* ---- ambient film behind the media band ---- */}
        <VideoBackground
          src={activeProject?.video ?? null}
          poster={activeProject?.poster ?? null}
          paused={Boolean(openId)}
        />

        {/* ---- SECTION 1 + SECTION 2 ---- */}
        <div className="relative z-30 shrink-0">
          <div className="roshn-sky pointer-events-none absolute inset-0" />
          <div className="relative">
            <RoshnHeader />
            <ProjectNavigation
              projects={projects}
              activeId={activeId}
              onSelect={handleSelect}
            />
          </div>
        </div>

        {/* ---- SECTION 3 ---- */}
        <div className="relative z-20 min-h-0 flex-1">
          <ProjectMedia
            projects={projects}
            activeId={activeId}
            onSelect={handleSelect}
          />
          <Overlay />
        </div>
      </div>

      {/* ---- fullscreen film, above everything ---- */}
      <VideoOverlay project={openProject} onClose={handleClose} />
    </>
  )
}
