import { useRef, useState } from 'react'
import { PANDA_STEPS, PANDA_DELIVERED, HEADS } from '../content'
import SectionHead from './SectionHead'
import { reduced } from '../lib/prefs'
import { burst } from '../lib/fx'

/* rider position along the quad curve M14 40 Q160 6 306 40 */
function riderPos(t: number): [number, number] {
  const x = (1 - t) * (1 - t) * 14 + 2 * (1 - t) * t * 160 + t * t * 306
  const y = (1 - t) * (1 - t) * 40 + 2 * (1 - t) * t * 6 + t * t * 40
  return [x, y]
}

export default function Panda() {
  const [step, setStep] = useState(0)
  const [phase, setPhase] = useState<'idle' | 'tracking' | 'done'>('idle')
  const rider = useRef<SVGGElement>(null)

  const track = () => {
    if (phase !== 'idle') return
    setPhase('tracking')
    let st = 0
    const tick = () => {
      if (st < PANDA_STEPS.length) {
        st++
        setStep(st)
        const p = riderPos((st - 1) / (PANDA_STEPS.length - 1))
        rider.current?.setAttribute('transform', `translate(${p[0]} ${p[1]})`)
        setTimeout(tick, reduced ? 60 : 1050)
      } else {
        setPhase('done')
        burst(14)
      }
    }
    tick()
  }

  const label = phase === 'idle' ? 'track the order'
    : phase === 'tracking' ? 'tracking…'
    : 'delivered · signature: 🥺 ✓'

  return (
    <section className="pandawrap">
      <SectionHead copy={HEADS.panda} />
      <div className="trackcard">
        <div className="route">
          <svg viewBox="0 0 320 64" aria-hidden="true">
            <path d="M14 40 Q160 6 306 40" fill="none" stroke="#EEC07A" strokeWidth="1.3" strokeDasharray="3 7" opacity=".55" />
            <circle cx="14" cy="40" r="3.5" fill="#EEC07A" />
            <circle cx="306" cy="40" r="3.5" fill="#F2A9B4" />
            <text x="14" y="58" className="rl" textAnchor="start">pallaresos park</text>
            <text x="306" y="58" className="rl" textAnchor="end">alhamd town</text>
            <g ref={rider} transform="translate(14 40)">
              <g transform="translate(-11 -24)">
                <svg width="22" height="22" viewBox="0 0 24 24">
                  <circle cx="6" cy="6" r="3.4" fill="#0E0B21" stroke="#EEC07A" strokeWidth="1" />
                  <circle cx="18" cy="6" r="3.4" fill="#0E0B21" stroke="#EEC07A" strokeWidth="1" />
                  <circle cx="12" cy="13" r="8.6" fill="#F7E3BF" stroke="#EEC07A" strokeWidth="1.1" />
                  <ellipse cx="8.6" cy="11.6" rx="2.5" ry="3.1" fill="#0E0B21" transform="rotate(-18 8.6 11.6)" />
                  <ellipse cx="15.4" cy="11.6" rx="2.5" ry="3.1" fill="#0E0B21" transform="rotate(18 15.4 11.6)" />
                  <circle cx="9.1" cy="12" r=".8" fill="#F7E3BF" /><circle cx="14.9" cy="12" r=".8" fill="#F7E3BF" />
                  <ellipse cx="12" cy="15.6" rx="1.5" ry="1.1" fill="#0E0B21" />
                  <path d="M10.6 17.6q1.4 1.1 2.8 0" fill="none" stroke="#0E0B21" strokeWidth=".9" strokeLinecap="round" />
                </svg>
              </g>
            </g>
          </svg>
        </div>
        <ol className="steps">
          {PANDA_STEPS.map((s, i) => (
            <li key={i} className={i < step ? 'on' : ''} dangerouslySetInnerHTML={{ __html: s }} />
          ))}
        </ol>
        <div className={'delivcard' + (phase === 'done' ? ' show' : '')}>
          <div className="dtick">✓ delivered</div>
          <p dangerouslySetInnerHTML={{ __html: PANDA_DELIVERED }} />
        </div>
        <button className="goldbtn" onClick={track} disabled={phase !== 'idle'}>{label}</button>
      </div>
    </section>
  )
}
