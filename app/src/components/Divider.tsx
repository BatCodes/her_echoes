import { useEffect, useRef } from 'react'
import { gsap } from '../lib/gsapSetup'
import { reduced } from '../lib/prefs'

export default function Divider() {
  const ref = useRef<SVGSVGElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || reduced) return
    const paths = el.querySelectorAll('path')
    gsap.set(paths, { strokeDasharray: 130, strokeDashoffset: 130 })
    /* draws itself as it passes — keyed to her scroll, not a timer */
    const tw = gsap.to(paths, {
      strokeDashoffset: 0, stagger: 0.08, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top 96%', end: 'top 62%', scrub: 0.6 },
    })
    return () => { tw.scrollTrigger?.kill(); tw.kill() }
  }, [])
  return (
    <svg ref={ref} className="divider" viewBox="0 0 220 20" aria-hidden="true">
      <path d="M6 10 C 44 10, 66 16, 96 10" fill="none" stroke="#EEC07A" strokeWidth="1" opacity=".55" />
      <path d="M214 10 C 176 10, 154 16, 124 10" fill="none" stroke="#EEC07A" strokeWidth="1" opacity=".55" />
      <path d="M110 3 l2.2 4.8 4.8 2.2 -4.8 2.2 -2.2 4.8 -2.2 -4.8 -4.8 -2.2 4.8 -2.2z" fill="#EEC07A" opacity=".9" />
      <circle cx="99" cy="10" r="1.4" fill="#F2A9B4" />
      <circle cx="121" cy="10" r="1.4" fill="#F2A9B4" />
      <circle cx="6" cy="10" r="1.2" fill="#EEC07A" opacity=".6" />
      <circle cx="214" cy="10" r="1.2" fill="#EEC07A" opacity=".6" />
    </svg>
  )
}
