/**
 * ============================================================================
 * ROSHN PROJECT CONFIGURATION — SINGLE SOURCE OF TRUTH
 * ============================================================================
 *
 * Every project / video / logo relationship lives here and nowhere else.
 *
 * TO ADD OR REPLACE A VIDEO:
 *   1. Drop the file into `public/videos/`
 *   2. Set `video` below to `/videos/<your-file>.mp4`
 *   3. (optional) Set `poster` to `/posters/<your-file>.jpg`
 *
 * `video: null` is fully supported — that tile stays interactive and shows the
 * branded placeholder instead of breaking the page.
 *
 * SOURCE FOLDER AUDIT (roshn-page/videos). Each file is copied into
 * `public/videos/` under an ASCII-safe name — the originals carry Arabic text
 * and trailing spaces, which do not survive a URL cleanly. Originals are left
 * untouched. Every mapping below is taken straight from the filename:
 *
 *   EN-ALAROUS _ العروس .mp4                  -> alarous.mp4               -> alarous
 *   ALMANAR_المنار .mp4                       -> almanar.mp4               -> almanar
 *   MARAFY_مرافئ .mp4                         -> marafy.mp4                -> marafy
 *   ALAROUS PROGRESS_مراحل تطوير العروس .mp4  -> alarous-progress.mp4      -> alarous-progress
 *   EN-ALAROUS RES. العروس رزيدنس .mp4        -> alarous-residence-en.mp4  -> alarous-residence
 *   AR-ALAROUS RES_العروس ريزيدنس  .mp4       -> alarous-residence-ar.mp4  -> (Arabic alternate)
 *   ALMANAR PROGRESS_مراحل تطوير المنار .mp4  -> almanar-progress.mp4      -> almanar-progress
 *
 * Nothing in the folder names a MARAFY *Progress* film, so that one tile keeps
 * `video: null` rather than being guessed at — drop the file in and set the
 * path when it arrives.
 *
 * `mark` selects the built-in vector reconstruction of the project lockup.
 * If you receive the official artwork, drop the SVG into `public/logos/` and
 * set `logo: '/logos/<file>.svg'` — the component prefers `logo` over `mark`.
 * ============================================================================
 */

export const projects = [
  {
    id: 'alarous',
    name: 'ALAROUS',
    nameAr: 'العروس',
    mark: 'alarous',
    logo: null,
    label: null,
    video: '/videos/alarous.mp4',
    poster: null,
  },
  {
    id: 'almanar',
    name: 'ALMANAR',
    nameAr: 'المنار',
    mark: 'almanar',
    logo: null,
    label: null,
    video: '/videos/almanar.mp4',
    poster: null,
  },
  {
    id: 'marafy',
    name: 'MARAFY',
    nameAr: 'مرافي',
    mark: 'marafy',
    logo: null,
    label: null,
    video: '/videos/marafy.mp4',
    poster: null,
  },
  {
    id: 'alarous-progress',
    name: 'ALAROUS',
    nameAr: 'العروس',
    mark: 'alarous',
    logo: null,
    label: 'Progress',
    video: '/videos/alarous-progress.mp4',
    poster: null,
  },
  {
    id: 'alarous-residence',
    name: 'ALAROUS RESIDENCE',
    nameAr: 'العروس ريزيدنس',
    mark: 'alarous-residence',
    logo: null,
    label: null,
    // The RESIDENCE lockup is the solid variant and drops the ROSHN endorsement line.
    subline: false,
    // Arabic cut also available: '/videos/alarous-residence-ar.mp4'
    video: '/videos/alarous-residence-en.mp4',
    poster: null,
  },
  {
    id: 'almanar-progress',
    name: 'ALMANAR',
    nameAr: 'المنار',
    mark: 'almanar',
    logo: null,
    label: 'Progress',
    // Matched by filename: "ALMANAR PROGRESS_مراحل تطوير المنار .mp4"
    video: '/videos/almanar-progress.mp4',
    poster: null,
  },
  {
    id: 'marafy-progress',
    name: 'MARAFY',
    nameAr: 'مرافي',
    mark: 'marafy',
    logo: null,
    label: 'Progress',
    video: null,
    poster: null,
  },
]

/**
 * Project highlighted on first paint. Defaults to the first project that
 * actually has media so the page never opens on an empty tile; change to a
 * fixed id (e.g. 'alarous') once every project has its video.
 */
export const defaultProjectId =
  (projects.find((project) => project.video) ?? projects[0]).id

export const getProject = (id) => projects.find((project) => project.id === id)
