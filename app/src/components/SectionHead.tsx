import { useEffect, useRef } from 'react'
import type { SectionCopy } from '../content'
import { ScrollTrigger } from '../lib/gsapSetup'
import { reduced } from '../lib/prefs'
import { tick } from '../lib/haptics'

/* section heading: script flourish, title, soft body —
   the enchanted ink (lib/ink.ts) writes every letter of these
   as they scroll into view, exactly like the original tale.
   Each one is also a page-turn detent: crossing it mid-screen
   gives one faint tick and a glint — eight small arrivals that
   turn the scroll into a journey. */
export default function SectionHead({ copy }: { copy: SectionCopy }) {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = root.current
    if (!el || reduced) return
    let last = 0
    const detent = () => {
      const now = performance.now()
      if (now - last < 1500) return
      last = now
      tick()
      const h = el.querySelector('h2')
      if (h) {
        h.classList.remove('glint')
        void (h as HTMLElement).offsetWidth
        h.classList.add('glint')
      }
    }
    const st = ScrollTrigger.create({
      trigger: el, start: 'top 55%', end: 'top 45%',
      onEnter: detent, onEnterBack: detent,
    })
    return () => st.kill()
  }, [])

  return (
    <div className="shead" ref={root}>
      <span className="fl">{copy.fl}</span>
      <h2 dangerouslySetInnerHTML={{ __html: copy.h2 }} />
      <p dangerouslySetInnerHTML={{ __html: copy.p }} />
    </div>
  )
}
