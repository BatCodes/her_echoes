import { useState } from 'react'
import { CONFESSIONS, HEADS } from '../content'
import SectionHead from './SectionHead'
import { sparkleAt } from '../lib/fx'

export default function Confessions() {
  const [open, setOpen] = useState<Set<number>>(new Set())

  const openEnv = (i: number, e: React.MouseEvent) => {
    if (open.has(i)) return
    const ns = new Set(open); ns.add(i)
    setOpen(ns)
    sparkleAt((e.currentTarget as HTMLElement).getBoundingClientRect())
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
            onClick={(e) => openEnv(i, e)}
          >
            <div className="flap">
              <span className="wax">{i + 1}</span>
              <span className="flaplbl">{open.has(i) ? 'unsealed' : 'sealed · tap to open'}</span>
            </div>
            <div className="notewrap">
              <div className="note"><div dangerouslySetInnerHTML={{ __html: c }} /></div>
            </div>
          </button>
        ))}
      </div>
      <div className="hintl">all of them are true. especially the embarrassing ones.</div>
    </section>
  )
}
