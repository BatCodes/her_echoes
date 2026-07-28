import { useState } from 'react'
import { CONFESSIONS, HEADS } from '../content'
import SectionHead from './SectionHead'
import { sparkleAt, goldDust } from '../lib/fx'
import { vibrate } from '../lib/prefs'

export default function Confessions() {
  const [open, setOpen] = useState<Set<number>>(new Set())

  const openEnv = (i: number, e: React.MouseEvent) => {
    // a confession cannot be unsaid — opened stays opened
    if (open.has(i)) return
    const ns = new Set(open); ns.add(i)
    setOpen(ns)
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
    sparkleAt(r)
    vibrate(6)
    // a few motes lift off the flap's edge
    goldDust(r.left + r.width / 2, r.top, 6, 60)
  }

  return (
    <section>
      <SectionHead copy={HEADS.confessions} />
      <div className="envgrid">
        {CONFESSIONS.map((c, i) => (
          <button
            key={i}
            className={'env' + (open.has(i) ? ' open' : '')}
            aria-label={'Open confession ' + (i + 1)}
            aria-expanded={open.has(i)}
            aria-disabled={open.has(i)}
            onClick={(e) => openEnv(i, e)}
          >
            <div className="flap">
              <span className="wax">{i + 1}</span>
              <span className="flaplbl">{open.has(i) ? 'unsealed' : 'sealed · tap to open'}</span>
            </div>
            <div className="note"><span dangerouslySetInnerHTML={{ __html: c }} /></div>
          </button>
        ))}
      </div>
      <div className="hintl">all of them are true. especially the embarrassing ones.</div>
    </section>
  )
}
