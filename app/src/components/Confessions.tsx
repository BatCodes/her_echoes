import { useEffect, useRef, useState } from 'react'
import { CONFESSIONS, HEADS } from '../content'
import SectionHead from './SectionHead'
import { sparkleAt, goldDust } from '../lib/fx'
import { seal } from '../lib/haptics'
import { crack } from '../lib/audio'
import { keepsake, markIndex } from '../lib/keepsake'
import { ScrollTrigger } from '../lib/gsapSetup'
import { reduced } from '../lib/prefs'

export default function Confessions() {
  /* a confession cannot be unsaid — opened stays opened, across visits */
  const [open, setOpen] = useState<Set<number>>(() =>
    new Set(keepsake().confessions.filter((i) => i >= 0 && i < CONFESSIONS.length)))
  const grid = useRef<HTMLDivElement>(null)

  /* the first sealed envelope introduces itself: one small breath of the flap */
  useEffect(() => {
    const el = grid.current
    if (!el || reduced) return
    const st = ScrollTrigger.create({
      trigger: el, start: 'top 72%', once: true,
      onEnter: () => {
        const first = el.querySelector('.env:not(.open)')
        if (!first) return
        first.classList.add('peek')
        setTimeout(() => first.classList.remove('peek'), 1900)
      },
    })
    return () => st.kill()
  }, [])

  const openEnv = (i: number, e: React.MouseEvent) => {
    if (open.has(i)) return
    const ns = new Set(open); ns.add(i)
    setOpen(ns)
    markIndex('confessions', i)
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
    sparkleAt(r)
    seal(e.currentTarget as HTMLElement)
    crack(0.09) /* the wax gives way, audibly */
    // a few motes lift off the flap's edge
    goldDust(r.left + r.width / 2, r.top, 6, 60)
  }

  return (
    <section>
      <SectionHead copy={HEADS.confessions} />
      <div className="envgrid" ref={grid}>
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
