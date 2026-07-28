import { reduced, tier } from './prefs'

/* ═════════════════════════════════════════════════════════
   the polish layer — none of these are noticed individually
   · desktop: a faint star trailing the cursor
   · gold buttons: magnetic pull within reach
   both pointer:fine only, both skipped on reduced/lite
   ═════════════════════════════════════════════════════════ */

const fine = () =>
  typeof matchMedia !== 'undefined' && matchMedia('(pointer: fine)').matches

let cursorInstalled = false
let magneticsInstalled = false

/* ── trailing cursor star ── */
export function installCursor() {
  if (cursorInstalled || reduced || tier === 'lite' || !fine()) return
  cursorInstalled = true
  const wrap = document.createElement('div')
  wrap.className = 'curwrap'
  wrap.setAttribute('aria-hidden', 'true')
  const star = document.createElement('span')
  star.className = 'curstar'
  star.textContent = '✦'
  wrap.appendChild(star)
  const dots: HTMLSpanElement[] = []
  for (let i = 0; i < 3; i++) {
    const d = document.createElement('span')
    d.className = 'curdot'
    wrap.appendChild(d)
    dots.push(d)
  }
  document.body.appendChild(wrap)

  let tx = -100, ty = -100
  const pos = [
    { x: -100, y: -100 }, { x: -100, y: -100 },
    { x: -100, y: -100 }, { x: -100, y: -100 },
  ]
  let idle: ReturnType<typeof setTimeout> | null = null
  let visible = false

  addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return
    tx = e.clientX; ty = e.clientY
    if (!visible) { visible = true; wrap.classList.add('on') }
    if (idle) clearTimeout(idle)
    idle = setTimeout(() => { visible = false; wrap.classList.remove('on') }, 2600)
  }, { passive: true })

  let rot = 0
  const loop = () => {
    /* star chases fastest, dots trail behind at falling speeds */
    const speeds = [0.30, 0.16, 0.10, 0.06]
    let px = tx, py = ty
    for (let i = 0; i < 4; i++) {
      const p = pos[i]
      p.x += (px - p.x) * speeds[i]
      p.y += (py - p.y) * speeds[i]
      px = p.x; py = p.y
    }
    rot += 0.4
    star.style.transform = `translate3d(${pos[0].x + 9}px, ${pos[0].y + 12}px, 0) rotate(${rot}deg)`
    for (let i = 0; i < 3; i++) {
      const p = pos[i + 1]
      dots[i].style.transform = `translate3d(${p.x + 12}px, ${p.y + 16}px, 0)`
      dots[i].style.opacity = String(0.5 - i * 0.14)
    }
    requestAnimationFrame(loop)
  }
  requestAnimationFrame(loop)
}

/* ── magnetic pull on gold buttons ── */
const MAG_SEL = '.goldbtn, .begin, .pbtn, .evb, .nextb, .jarbtn, .os-disc, .os-playbtn'

export function installMagnetics() {
  if (magneticsInstalled || reduced || !fine()) return
  magneticsInstalled = true
  let active: HTMLElement | null = null
  let raf = 0

  document.addEventListener('pointerover', (e) => {
    const t = (e.target as HTMLElement | null)?.closest<HTMLElement>(MAG_SEL)
    if (t) active = t
  })
  document.addEventListener('pointerout', (e) => {
    if (!active) return
    const to = e.relatedTarget as HTMLElement | null
    if (!to || !active.contains(to)) {
      active.style.setProperty('--mgx', '0px')
      active.style.setProperty('--mgy', '0px')
      active = null
    }
  })
  document.addEventListener('pointermove', (e) => {
    if (!active || raf) return
    const el = active
    raf = requestAnimationFrame(() => {
      raf = 0
      const r = el.getBoundingClientRect()
      const dx = e.clientX - (r.left + r.width / 2)
      const dy = e.clientY - (r.top + r.height / 2)
      const clamp = (v: number) => Math.max(-7, Math.min(7, v))
      el.style.setProperty('--mgx', clamp(dx * 0.22) + 'px')
      el.style.setProperty('--mgy', clamp(dy * 0.22) + 'px')
    })
  }, { passive: true })
}
