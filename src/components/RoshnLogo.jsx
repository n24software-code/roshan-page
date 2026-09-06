/**
 * SECTION 1 artwork — the real ROSHN GROUP asset (public/roshn-logo.svg).
 * The source file is drawn in brand green (#026551); the reference shows it
 * white, so it is masked rather than recoloured, which preserves the exact
 * original geometry and aspect ratio.
 */
export default function RoshnLogo({ className = '' }) {
  return (
    <span
      role="img"
      aria-label="ROSHN Group"
      className={`block aspect-[190/130] bg-white ${className}`}
      style={{
        WebkitMaskImage: 'url(/roshn-logo.svg)',
        maskImage: 'url(/roshn-logo.svg)',
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
        WebkitMaskPosition: 'center',
        maskPosition: 'center',
      }}
    />
  )
}
