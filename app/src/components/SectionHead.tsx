import { useEffect, useRef } from 'react'
import type { SectionCopy } from '../content'
import { gsap, SplitText } from '../lib/gsapSetup'
import { reduced } from '../lib/prefs'

/* section heading: script flourish, ink-stroked title, soft body */
export default function SectionHead({ copy }: { copy: SectionCopy }) {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = root.current
    if (!el) return
    const h2 = el.querySelector('h2')
    const rest = el.querySelectorAll('.fl, p')
    if (reduced || !h2) { gsap.set(el, { autoAlpha: 1 }); return }
    gsap.set(el, { autoAlpha: 1 })
    const split = new SplitText(h2, { type: 'chars' })
    const tl = gsap.timeline({
      scrollTrigger: { trigger: el, start: 'top 80%', once: true },
    })
    tl.from(rest, { autoAlpha: 0, y: 14, duration: 0.8, stagger: 0.12, ease: 'power2.out' }, 0)
      .from(split.chars, {
        autoAlpha: 0, y: 16, rotateX: -50, filter: 'blur(5px)',
        duration: 0.7, stagger: 0.028, ease: 'power3.out',
      }, 0.12)
    return () => { tl.scrollTrigger?.kill(); tl.kill(); split.revert() }
  }, [])

  return (
    <div ref={root} className="shead" style={{ visibility: 'hidden' }}>
      <span className="fl">{copy.fl}</span>
      <h2 dangerouslySetInnerHTML={{ __html: copy.h2 }} />
      <p dangerouslySetInnerHTML={{ __html: copy.p }} />
    </div>
  )
}
