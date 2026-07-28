import Lenis from 'lenis'
import { gsap, ScrollTrigger } from './gsapSetup'
import { reduced } from './prefs'

let lenis: Lenis | null = null

/** shared, normalized scroll progress (0..1) for the sky parallax */
export const scrollState = { y: 0, progress: 0 }

export function initSmoothScroll() {
  if (reduced || lenis) return
  lenis = new Lenis({ autoRaf: false, lerp: 0.11, smoothWheel: true })
  lenis.on('scroll', (e: { scroll: number; limit: number }) => {
    scrollState.y = e.scroll
    scrollState.progress = e.limit > 0 ? e.scroll / e.limit : 0
    ScrollTrigger.update()
  })
  gsap.ticker.add((time) => lenis?.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)
}

export function scrollToEl(el: Element | string, offset = 0) {
  if (lenis) lenis.scrollTo(el as HTMLElement | string, { offset, duration: 1.4 })
  else {
    const node = typeof el === 'string' ? document.querySelector(el) : el
    node?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
  }
}

export function stopScroll() { lenis?.stop() }
export function startScroll() { lenis?.start() }

if (typeof window !== 'undefined') {
  // keep scrollState honest when lenis is absent (reduced motion)
  addEventListener('scroll', () => {
    if (lenis) return
    const max = document.documentElement.scrollHeight - innerHeight
    scrollState.y = scrollY
    scrollState.progress = max > 0 ? scrollY / max : 0
  }, { passive: true })
}
