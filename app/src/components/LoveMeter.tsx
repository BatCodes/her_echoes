import { useEffect, useRef, useState } from 'react'
import { METER, HEADS } from '../content'
import SectionHead from './SectionHead'
import { gsap } from '../lib/gsapSetup'
import { reduced, vibrate } from '../lib/prefs'
import { goldDust } from '../lib/fx'
import { EASE, DUR } from '../lib/motion'

export default function LoveMeter() {
  const needle = useRef<SVGLineElement>(null)
  const gauge = useRef<HTMLDivElement>(null)
  const glow = useRef<HTMLDivElement>(null)
  const tl = useRef<ReturnType<typeof gsap.timeline> | null>(null)
  const timers = useRef<number[]>([])
  const [phase, setPhase] = useState<'idle' | 'measuring' | 'broken'>('idle')

  useEffect(() => () => {
    tl.current?.kill()
    timers.current.forEach(clearTimeout)
    timers.current.length = 0
  }, [])

  const measure = () => {
    if (phase !== 'idle') return
    setPhase('measuring')
    const n = needle.current
    if (!n || reduced) {
      /* reduced motion: the meter quietly gives up, no theatrics */
      timers.current.push(window.setTimeout(() => setPhase('broken'), reduced ? 120 : 2200))
      return
    }
    n.classList.remove('idlewobble')
    const slam = () => {
      /* the needle blows through the end of the dial — the whole room flinches */
      glow.current?.classList.add('on')
      vibrate([40, 70, 40])
      const g = gauge.current
      if (g) {
        const r = g.getBoundingClientRect()
        goldDust(r.left + r.width / 2, r.top + r.height / 2)
      }
      setPhase('broken')
      /* let the css fade breathe out on its own */
      timers.current.push(window.setTimeout(() => glow.current?.classList.remove('on'), 200))
    }
    tl.current = gsap.timeline()
      .set(n, { svgOrigin: '100 92' })
      /* a small breath backwards before the swing */
      .to(n, { rotation: -72, duration: 0.25, ease: EASE.move })
      /* the hard sweep */
      .to(n, { rotation: 118, duration: 1.15, ease: 'power3.in' })
      /* overshoot — too much to read */
      .to(n, { rotation: 127, duration: DUR.micro, ease: EASE.spring })
      /* tremble against the stop */
      .to(n, { rotation: 124.5, duration: 0.06, yoyo: true, repeat: 7, onStart: () => vibrate(8) })
      /* and then through it */
      .to(n, { rotation: 141, duration: 0.18, ease: 'power4.in', onComplete: slam })
  }

  const label = phase === 'idle' ? 'measure how loved I am'
    : phase === 'measuring' ? 'measuring…'
    : 'meter broken. typical.'

  return (
    <section className="meterwrap">
      <div ref={glow} className="edgeglow" aria-hidden="true" />
      <SectionHead copy={HEADS.meter} />
      <div ref={gauge} className={'gauge' + (phase === 'broken' ? ' broken' : '')}>
        <svg viewBox="0 0 200 110">
          <path d="M18 92 A82 82 0 0 1 182 92" fill="none" stroke="#332A63" strokeWidth="12" strokeLinecap="round" />
          <path d="M18 92 A82 82 0 0 1 182 92" fill="none" stroke="url(#gg)" strokeWidth="12" strokeLinecap="round" strokeDasharray="258" strokeDashoffset="60" />
          <defs>
            <linearGradient id="gg" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#EEC07A" /><stop offset="1" stopColor="#E77E93" />
            </linearGradient>
          </defs>
          <text x="18" y="108" fontSize="9" fill="#948DBA" fontFamily="Poppins">0%</text>
          <text x="168" y="108" fontSize="9" fill="#948DBA" fontFamily="Poppins">100%</text>
          <line ref={needle} id="needle" className="idlewobble" x1="100" y1="92" x2="100" y2="26" stroke="#F7E3BF" strokeWidth="3" strokeLinecap="round" />
          <circle cx="100" cy="92" r="6" fill="#F7E3BF" />
        </svg>
      </div>
      <div className={'err' + (phase === 'broken' ? ' show' : '')}>{METER.err}</div>
      <div className={'errsub' + (phase === 'broken' ? ' show' : '')} dangerouslySetInnerHTML={{ __html: METER.sub }} />
      <button className="goldbtn" onClick={measure} disabled={phase !== 'idle'}>{label}</button>
    </section>
  )
}
