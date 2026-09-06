# ROSHN — Interactive Project Showcase

A fullscreen, single-page React showcase built to reproduce `roshn-page-design.jpeg`.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
```

## The three sections

| | Component | Notes |
|---|---|---|
| **1** | `RoshnHeader` → `RoshnLogo` | The real `roshn-logo.svg` asset, CSS-masked to white so the original geometry and aspect ratio are preserved. Upper-left, responsive. |
| **2** | `ProjectNavigation` → `ProjectLogo` | Seven clickable project lockups. ≥1024px they sit on a 7-column grid, each centred over its media column; below that they become a swipeable snap rail. |
| **3** | `ProjectMedia` + `VideoBackground` | The full-width media band. The active project's column is transparent, so the ambient film behind shows through that slot — no second `<video>` is mounted. |

Plus `VideoOverlay`: the opaque fullscreen film layer that opens on click.

## Interaction

1. The page loads showing the three-section layout: logo, seven lockups, media band.
2. The default project (`defaultProjectId`) is highlighted and its film plays **muted** as an ambient preview inside its media column — the only playback browsers allow before a gesture.
3. Clicking any of the seven lockups opens `VideoOverlay` **immediately**: an opaque black layer at `z-50` covering `100vw × 100vh`, with nothing from the page visible behind it.
4. The film starts on its own and plays **with sound** — the click is the gesture that unlocks audio, so the overlay sets `muted = false` and `volume = 1`. If a browser still refuses audible autoplay it falls back to a muted play; there are **no sound, mute or volume controls anywhere in the UI**.
5. A **×** button sits in the top-right of the overlay. Clicking it (or pressing `Esc`) stops the film, releases its source, and returns to the main page. The ambient preview resumes.

`object-fit: cover`, `playsInline`, `loop`, and no native controls throughout.

## Configuration — `src/data/projects.js`

Every project → video → logo relationship lives in this one file.

```js
{
  id: 'almanar-progress',
  name: 'ALMANAR',
  nameAr: 'المنار',
  mark: 'almanar',                          // built-in vector lockup
  logo: null,                               // '/logos/x.svg' overrides `mark`
  label: 'Progress',
  video: '/videos/almanar-progress.mp4',    // null is fine — see below
  poster: null,                             // '/posters/x.jpg'
}
```

**To add a film:** drop the file into `public/videos/` and set `video` to `/videos/<file>.mp4`. Nothing else changes.

`video: null` is a supported state: the tile stays clickable and shows a branded "Film coming soon" panel instead of breaking.

## Asset audit

`roshn-page/videos` holds seven films. Each is copied into `public/videos/`
under an ASCII-safe name — the originals carry Arabic text and trailing spaces,
which do not survive a URL cleanly. **The originals are left untouched.** Every
mapping comes straight from the filename:

| Source file | Copied to | Tile |
|---|---|---|
| `EN-ALAROUS _ العروس .mp4` | `alarous.mp4` | ALAROUS |
| `ALMANAR_المنار .mp4` | `almanar.mp4` | ALMANAR |
| `MARAFY_مرافئ .mp4` | `marafy.mp4` | MARAFY |
| `ALAROUS PROGRESS_مراحل تطوير العروس .mp4` | `alarous-progress.mp4` | ALAROUS · Progress |
| `EN-ALAROUS RES. العروس رزيدنس .mp4` | `alarous-residence-en.mp4` | ALAROUS RESIDENCE |
| `AR-ALAROUS RES_العروس ريزيدنس  .mp4` | `alarous-residence-ar.mp4` | *(Arabic alternate — one line in the config to switch)* |
| `ALMANAR PROGRESS_مراحل تطوير المنار .mp4` | `almanar-progress.mp4` | ALMANAR · Progress |
| `MARAFY PROGRESS_مراحل تطوير مرافئ.mp4` | `marafy-progress.mp4` | MARAFY · Progress |

All seven tiles are mapped. `video: null` remains a supported state — a tile
without a film stays clickable and shows the "Film coming soon" panel instead
of breaking.

`roshn-logo.svg` is the only logo asset that shipped. The four project marks
(ALAROUS, AL MANAR, MARAFY, ALAROUS RESIDENCE) are therefore **redrawn as line
art** in `src/components/marks/ProjectMark.jsx` rather than faked with text.
When the official artwork arrives, put the SVGs in `public/logos/` and point
each project's `logo` field at them — no component changes needed.

## `scripts/faststart.mjs`

Every supplied MP4 stored its `moov` atom **after** `mdat`, which forces a
browser to download the entire file before it can render one frame — MARAFY
took ~11s to start on localhost. The script relocates `moov` to the front and
shifts the `stco` / `co64` chunk-offset tables to match. Files are byte-for-byte
the same size; only the ordering changes.

After running it, every film starts in **under a second**.

```bash
node scripts/faststart.mjs public/videos   # run this after adding new videos
```

## Performance

* All films are faststart-encoded (see above), so playback begins in well under
  a second instead of after a full download.
* `preload="none"` on the ambient layer; only the active film is ever fetched.
* The ambient layer uses two `<video>` elements swapped imperatively — switching
  projects triggers no React re-render of the page tree — and is suspended
  entirely while the overlay is open.
* The overlay's `<video>` is mounted only while open, and its `src` is removed
  and `load()`ed on close so the decoder and network buffer are released
  (`networkState` returns to `NETWORK_EMPTY`).
* `ProjectMedia` and `ProjectLogo` are memoised; callbacks are stable.
