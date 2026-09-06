import RoshnLogo from './RoshnLogo.jsx'

/**
 * SECTION 1 — ROSHN GROUP logo, upper-left, matching the reference placement.
 */
export default function RoshnHeader() {
  return (
    <header className="shrink-0 px-[3.5vw] pt-[2.6vh] sm:pt-[3vh]">
      <RoshnLogo className="w-[clamp(96px,10.8vw,210px)]" />
    </header>
  )
}
