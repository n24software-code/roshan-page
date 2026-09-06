/**
 * The decorative treatment over SECTION 3: the ROSHN "x / dot" motif from the
 * reference, plus a soft vignette that settles the media band into the page.
 */

const PATTERN = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
     <g fill="none" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round">
       <path d="M18 18 L30 30 M30 18 L18 30"/>
       <path d="M66 66 L78 78 M78 66 L66 78"/>
     </g>
     <g fill="#ffffff">
       <circle cx="72" cy="24" r="1.7"/>
       <circle cx="24" cy="72" r="1.7"/>
     </g>
   </svg>`.replace(/\s+/g, ' '),
)

export function PatternLayer({ className = '' }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{
        backgroundImage: `url("data:image/svg+xml,${PATTERN}")`,
        backgroundRepeat: 'repeat',
        backgroundSize: 'clamp(72px, 6vw, 128px)',
        opacity: 0.09,
      }}
    />
  )
}

export default function Overlay() {
  return (
    <div className="pointer-events-none absolute inset-0 z-30" aria-hidden="true">
      <PatternLayer />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 70%, rgba(0,0,0,0.45) 100%)',
        }}
      />
    </div>
  )
}
