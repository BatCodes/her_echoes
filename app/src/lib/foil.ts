/* ═══════════════════════════════════════════════════════════════
   gold leaf — the marquee lines catch real light.

   HARD-LEARNED (iOS crash, v3.1): never drive root custom props
   from a rAF loop. Changing --lx on <html> every frame invalidates
   style across the ink system's thousands of glyph spans and WebKit
   kills the page. The leaf now updates at most 8×/second, only when
   the tilt actually changed, and only while a gyro is speaking.
   Without a gyro the leaf is simply static — still gold, never busy.
   ═══════════════════════════════════════════════════════════════ */
import { reduced, tier } from './prefs'
import { tilt } from './gyro'

/* only the true marquee lines get leaf — every extra selector here
   is another set of background-clip:text layers on a phone GPU */
const MARQ = '.shead h2, .dsign, .psworn'

let installed = false

export function installFoil() {
  if (installed || reduced || typeof document === 'undefined') return
  installed = true
  const root = document.documentElement
  root.classList.add('leaf')

  /* gild a line the moment its last visible letter has landed */
  document.addEventListener('animationend', (e) => {
    if (e.animationName !== 'ftInk') return
    const t = e.target as HTMLElement
    const m = t.closest?.(MARQ)
    if (m && !m.classList.contains('foil-on')) m.classList.add('foil-on')
  }, true)

  if (tier === 'lite') return /* static leaf only */

  /* slow lamplight: an 8Hz check that writes only on real change */
  let lastX = 99
  const beat = setInterval(() => {
    if (document.hidden || !tilt.on) return
    if (Math.abs(tilt.x - lastX) < 0.03) return
    lastX = tilt.x
    root.style.setProperty('--lx', tilt.x.toFixed(2))
  }, 125)
  addEventListener('pagehide', () => clearInterval(beat))
}
