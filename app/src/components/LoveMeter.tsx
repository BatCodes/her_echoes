import { useRef, useState } from 'react'
import { METER, HEADS } from '../content'
import SectionHead from './SectionHead'
import { gsap } from '../lib/gsapSetup'
import { reduced, vibrate } from '../lib/prefs'
import { burst } from '../lib/fx'

export default function LoveMeter() {
  const needle = useRef<SVGLineElement>(null)
  const gauge = useRef<HTMLDivElement>(null)
  const [phase, setPhase] = useState<'idle' | 'measuring' | 'broken'>('idle')

  const measure = () => {
    if (phase !== 'idle') return
    setPhase('measuring')
    const n = needle.current
    const breakIt = () => {
      setPhase('broken')
      burst(16)
      vibrate([30, 40, 30])
    }
    if (!n || reduced) { setTimeout(breakIt, reduced ? 120 : 2200); return }
    n.classList.remove('idlewobble')
    gsap.fromTo(n, { rotation: -64, svgOrigin: '100 92' }, {
      rotation: 128, svgOrigin: '100 92', duration: 2.2, ease: 'power2.in',
      onComplete: () => {
        /* the needle trembles against the stop before the meter gives up */
        gsap.to(n, { rotation: 124, duration: 0.07, yoyo: true, repeat: 5, svgOrigin: '100 92', onComplete: breakIt })
      },
    })
  }

  const label = phase === 'idle' ? 'measure how loved I am'
    : phase === 'measuring' ? 'measuring…'
    : 'meter broken. typical.'

  return (
    <section className="meterwrap">
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
