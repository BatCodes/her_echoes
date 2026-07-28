import { useEffect, useRef, useState } from 'react'
import { FIRSTS, HEADS } from '../content'
import SectionHead from './SectionHead'
import { sparkleAt } from '../lib/fx'
import { gsap } from '../lib/gsapSetup'
import { reduced } from '../lib/prefs'

export default function Firsts() {
  const [open, setOpen] = useState<Set<number>>(new Set())
  const list = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = list.current
    if (!el || reduced) return
    const items = el.querySelectorAll('.fitem')
    const tw = gsap.from(items, {
      autoAlpha: 0, x: -14, duration: 0.7, stagger: 0.12, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 80%', once: true },
    })
    return () => { tw.scrollTrigger?.kill(); tw.kill() }
  }, [])

  const toggle = (i: number, e: React.MouseEvent) => {
    const ns = new Set(open)
    if (ns.has(i)) ns.delete(i)
    else {
      ns.add(i)
      sparkleAt((e.currentTarget as HTMLElement).getBoundingClientRect())
    }
    setOpen(ns)
  }

  return (
    <section>
      <SectionHead copy={HEADS.firsts} />
      <div ref={list}>
        {FIRSTS.map((f, i) => (
          <div key={i} className={'fitem' + (open.has(i) ? ' open' : '')}>
            <span className="fstar" aria-hidden="true">✦</span>
            <button className="fhead" aria-expanded={open.has(i)} onClick={(e) => toggle(i, e)}>
              <div className="fdate">{f.date}</div>
              <div className="ftitle" dangerouslySetInnerHTML={{ __html: f.title }} />
            </button>
            <div className="fbodywrap">
              <div className="fbody"><div dangerouslySetInnerHTML={{ __html: f.body }} /></div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
