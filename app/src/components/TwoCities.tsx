import { useRef, useState } from 'react'
import { DELIVERIES, HEADS } from '../content'
import SectionHead from './SectionHead'
import { gsap, MotionPathPlugin } from '../lib/gsapSetup'
import { reduced } from '../lib/prefs'
import { sparkleAt } from '../lib/fx'

/* keep TS aware the plugin import is intentional (registered in gsapSetup) */
void MotionPathPlugin

export default function TwoCities() {
  const heart = useRef<SVGTextElement>(null)
  const arc = useRef<SVGPathElement>(null)
  const scene = useRef<HTMLDivElement>(null)
  const [di, setDi] = useState(-1)
  const [shown, setShown] = useState(false)
  const flying = useRef(false)

  const send = () => {
    if (flying.current) return
    flying.current = true
    setShown(false)
    const h = heart.current
    const done = () => {
      flying.current = false
      setDi((d) => (d + 1) % DELIVERIES.length)
      setShown(true)
      sparkleAt(scene.current?.getBoundingClientRect())
    }
    if (!h || !arc.current || reduced) { done(); return }
    gsap.set(h, { opacity: 1 })
    gsap.to(h, {
      motionPath: { path: arc.current, align: arc.current, alignOrigin: [0.5, 0.5] },
      duration: 2.4, ease: 'power1.inOut',
      onComplete: () => { gsap.set(h, { opacity: 0 }); done() },
    })
  }

  const text = di >= 0 ? DELIVERIES[di] : ''

  return (
    <section className="skywrap2">
      <SectionHead copy={HEADS.cities} />
      <div ref={scene} className="skyscene">
        <svg viewBox="0 0 440 200">
          <circle cx="220" cy="34" r="16" fill="#EEC07A" opacity=".9" />
          <circle cx="212" cy="30" r="15" fill="#171231" />
          <text x="243" y="30" fontSize="13" fill="#F7E3BF">★</text>
          <path ref={arc} d="M395 148 Q220 30 45 148" fill="none" stroke="#EEC07A" strokeWidth="1.4" strokeDasharray="4 7" opacity=".55" />
          {/* her city (left): dome + minarets */}
          <g fill="#2C2356" stroke="#5A5187" strokeWidth="1">
            <rect x="18" y="160" width="90" height="30" />
            <circle cx="63" cy="158" r="17" />
            <rect x="20" y="128" width="7" height="40" /><circle cx="23.5" cy="126" r="4" />
            <rect x="100" y="128" width="7" height="40" /><circle cx="103.5" cy="126" r="4" />
          </g>
          {/* his city (right): spires */}
          <g fill="#2C2356" stroke="#5A5187" strokeWidth="1">
            <rect x="330" y="160" width="92" height="30" />
            <path d="M344 160 l7 -34 l7 34 z" /><path d="M366 160 l8 -46 l8 46 z" /><path d="M392 160 l7 -30 l7 30 z" />
          </g>
          <text className="citylbl" x="63" y="185" textAnchor="middle">you · alhamd town</text>
          <text className="citylbl" x="376" y="185" textAnchor="middle">me · pallaresos park</text>
          <text ref={heart} fontSize="15" fill="#E77E93" opacity="0">♥</text>
        </svg>
      </div>
      <div className={'delivered' + (shown ? ' show' : '')} aria-live="polite" dangerouslySetInnerHTML={{ __html: text }} />
      <button className="goldbtn" onClick={send}>send ♥ home</button>
      <div className="skycap">distance on land: <b>~6,000 km</b> · distance in the sky: <b>zero</b></div>
    </section>
  )
}
