import { useEffect, type RefObject } from 'react'
import { gsap } from './gsapSetup'
import { reduced } from './prefs'

/** soft rise-and-unblur reveal on scroll for a block element */
export function useReveal(ref: RefObject<HTMLElement | null>, opts?: { y?: number; delay?: number }) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (reduced) { gsap.set(el, { autoAlpha: 1 }); return }
    const tw = gsap.fromTo(el,
      { autoAlpha: 0, y: opts?.y ?? 26, filter: 'blur(8px)' },
      {
        autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 1.05, delay: opts?.delay ?? 0,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 82%', once: true },
      })
    return () => { tw.scrollTrigger?.kill(); tw.kill() }
  }, [ref, opts?.y, opts?.delay])
}
