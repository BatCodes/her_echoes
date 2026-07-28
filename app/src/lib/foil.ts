/* ═══════════════════════════════════════════════════════════════
   gold leaf — the marquee lines catch real light.
   One rAF loop writes --lx/--ly onto the root from the gyro
   (slow sine drift when there is no gyro), and a delegated
   animationend listener gilds each marquee line only AFTER its
   enchanted ink has finished writing — foil never fights the pen.
   ═══════════════════════════════════════════════════════════════ */
import { reduced, tier } from './prefs'
import { tilt } from './gyro'

/* the lines that deserve leaf — same family as the ink's marquee */
const MARQ = '.shead h2, .dsign, .psworn, .photo .q, .shead .fl'

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

  if (tier === 'lite') return /* static leaf only — no live light */

  let raf = 0
  let running = false
  let drift = 0
  const loop = () => {
    if (!running) { raf = 0; return }
    let lx: number, ly: number
    if (tilt.on) { lx = tilt.x; ly = tilt.y }
    else {
      /* no gyro (or not yet granted): lamplight sways on its own */
      drift += 0.004
      lx = Math.sin(drift) * 0.6
      ly = Math.cos(drift * 0.7) * 0.4
    }
    root.style.setProperty('--lx', lx.toFixed(3))
    root.style.setProperty('--ly', ly.toFixed(3))
    raf = requestAnimationFrame(loop)
  }
  const start = () => { if (!running) { running = true; if (!raf) raf = requestAnimationFrame(loop) } }
  const stop = () => { running = false }
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()))
  start()
}
