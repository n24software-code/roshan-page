/**
 * Vector reconstructions of the four ROSHN project marks that appear in
 * roshn-page-design.jpeg. No official SVG artwork shipped with this project,
 * so each mark is redrawn here as line art rather than faked with text.
 *
 * If the official artwork arrives, drop it in `public/logos/` and point the
 * project's `logo` field at it — ProjectLogo prefers `logo` over `mark`.
 */

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 3.4,
  strokeLinecap: 'square',
  strokeLinejoin: 'miter',
  vectorEffect: 'non-scaling-stroke',
}

function AlarousMark() {
  return (
    <g {...stroke}>
      <rect x="2.5" y="2.5" width="95" height="95" />
      {/* outer curtain wall */}
      <path d="M18 98 V20 H82 V98" />
      {/* inner keep */}
      <path d="M30 98 V31 H70 V98" />
      {/* central gateway arch */}
      <path d="M43 98 V54 a7 7 0 0 1 14 0 V98" />
      {/* flanking niches */}
      <path d="M13 78 V57 a5 5 0 0 1 10 0 V70" />
      <path d="M87 78 V57 a5 5 0 0 0 -10 0 V70" />
      {/* dune line */}
      <path d="M2.5 84 C 12 75, 21 72, 30 71.5" />
      <path d="M97.5 84 C 88 75, 79 72, 70 71.5" />
    </g>
  )
}

function AlmanarMark() {
  return (
    <g {...stroke}>
      <rect x="2.5" y="2.5" width="95" height="95" />
      {/* riwaq roof slab */}
      <path d="M2.5 34 H58 V42 H2.5" />
      {/* building body */}
      <path d="M13 42 V90" />
      <path d="M58 42 V90" />
      {/* lantern window */}
      <path d="M22 88 V58 a9 9 0 0 1 18 0 V88 Z" />
      <path d="M31 58 V49" />
      <path d="M22 74 H40" />
      <path d="M31 74 V88" />
      {/* minaret */}
      <path d="M64 90 V52 H82 V44 H66 V26 H80 V18 H68 V13" />
      <path d="M69 90 V52" />
      <path d="M69 44 V26" />
      <path d="M74 13 V8" />
      {/* dune line */}
      <path d="M46 92 C 60 78, 72 70, 84 68 L 97.5 68" />
    </g>
  )
}

function MarafyMark() {
  return (
    <g {...stroke}>
      <rect x="2.5" y="2.5" width="95" height="95" />
      {/* principal ogee arch */}
      <path d="M34 92 V44 C 34 26, 44 14, 56 12 C 68 14, 78 26, 78 44 V92" />
      {/* nested arch */}
      <path d="M44 92 V48 C 44 34, 50 26, 57 24" />
      {/* secondary arch, left */}
      <path d="M12 92 V60 C 12 48, 18 41, 26 40 C 30 41, 33 44, 34 48" />
      {/* small arch, right */}
      <path d="M62 92 V72 a7 7 0 0 1 14 0 V92" />
      {/* water / dune line */}
      <path d="M2.5 84 C 14 74, 24 71, 34 70.5" />
      <path d="M78 78 C 86 76, 92 76, 97.5 76" />
    </g>
  )
}

function AlarousResidenceMark() {
  return (
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="
        M0 0 H100 V100 H0 Z
        M23 23 H77 L81 100 H63 V50 a13 13 0 0 0 -26 0 V100 H19 Z
        M0 43 H16 V56 H0 Z
        M100 43 H84 V56 H100 Z
      "
    />
  )
}

const MARKS = {
  alarous: AlarousMark,
  almanar: AlmanarMark,
  marafy: MarafyMark,
  'alarous-residence': AlarousResidenceMark,
}

export default function ProjectMark({ mark, className }) {
  const Mark = MARKS[mark] ?? MARKS.alarous
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="xMidYMid meet"
    >
      <Mark />
    </svg>
  )
}
