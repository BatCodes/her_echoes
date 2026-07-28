import { reduced } from './prefs'

const SYMS = ['♥', '✦', '★', '❀']

export function sparkleAt(rect?: DOMRect | null, n = 6) {
  if (reduced || !rect) return
  for (let i = 0; i < n; i++) {
    const s = document.createElement('span')
    s.className = 'spark'
    s.textContent = '✦'
    s.style.left = rect.left + rect.width * Math.random() + 'px'
    s.style.top = rect.top + rect.height * Math.random() + 'px'
    s.style.color = Math.random() < 0.5 ? '#F2A9B4' : '#EEC07A'
    s.style.setProperty('--dx', Math.random() * 60 - 30 + 'px')
    s.style.setProperty('--dy', -30 - Math.random() * 40 + 'px')
    document.body.appendChild(s)
    setTimeout(() => s.remove(), 900)
  }
}

export function sparklePoint(x: number, y: number) {
  if (reduced) return
  const s = document.createElement('span')
  s.className = 'spark'
  s.textContent = '✦'
  s.style.left = x + 'px'
  s.style.top = y + 'px'
  s.style.color = Math.random() < 0.5 ? '#F2A9B4' : '#EEC07A'
  s.style.setProperty('--dx', Math.random() * 44 - 22 + 'px')
  s.style.setProperty('--dy', -26 - Math.random() * 30 + 'px')
  document.body.appendChild(s)
  setTimeout(() => s.remove(), 900)
}

export function burst(n: number) {
  if (reduced) return
  for (let i = 0; i < n; i++) {
    const s = document.createElement('span')
    s.className = 'floater'
    s.textContent = SYMS[i % 4]
    s.style.left = 5 + Math.random() * 90 + 'vw'
    s.style.color = Math.random() < 0.5 ? '#F2A9B4' : '#EEC07A'
    s.style.fontSize = 13 + Math.random() * 14 + 'px'
    s.style.animationDuration = 4 + Math.random() * 4 + 's'
    document.body.appendChild(s)
    setTimeout(() => s.remove(), 8600)
  }
}

/* ── gold dust · the finale's exhale, the name's afterglow ──
   soft rising particles, not confetti spam */
export function goldDust(x: number, y: number, n = 16, spread = 130) {
  if (reduced) return
  for (let i = 0; i < n; i++) {
    const s = document.createElement('span')
    s.className = 'dustp'
    const size = 3 + Math.random() * 4
    s.style.width = s.style.height = size + 'px'
    s.style.left = x + (Math.random() - 0.5) * spread * 0.6 + 'px'
    s.style.top = y + (Math.random() - 0.5) * 26 + 'px'
    s.style.setProperty('--dx', (Math.random() - 0.5) * spread + 'px')
    s.style.setProperty('--dy', -(46 + Math.random() * 130) + 'px')
    s.style.setProperty('--dd', (1.4 + Math.random() * 1.2).toFixed(2) + 's')
    document.body.appendChild(s)
    setTimeout(() => s.remove(), 2800)
  }
}

/* ── falling debris · wax crumbling off the royal seal ── */
export function goldDebris(x: number, y: number, n = 5) {
  if (reduced) return
  for (let i = 0; i < n; i++) {
    const s = document.createElement('span')
    s.className = 'dustp fall'
    const size = 2.5 + Math.random() * 4
    s.style.width = s.style.height = size + 'px'
    s.style.left = x + (Math.random() - 0.5) * 30 + 'px'
    s.style.top = y + (Math.random() - 0.5) * 12 + 'px'
    s.style.setProperty('--dx', (Math.random() - 0.5) * 46 + 'px')
    s.style.setProperty('--dy', 60 + Math.random() * 110 + 'px')
    s.style.setProperty('--dd', (0.8 + Math.random() * 0.6).toFixed(2) + 's')
    document.body.appendChild(s)
    setTimeout(() => s.remove(), 1600)
  }
}

/** ambient tap-sparkle, ignoring surfaces with their own gestures */
export function installTapSparkles() {
  if (reduced) return
  addEventListener('pointerdown', (e) => {
    const t = e.target as HTMLElement | null
    if (t?.closest('.holdwrap, .jarstage, .mirror, .sealcanvas, #ourSongs')) return
    sparklePoint(e.clientX, e.clientY)
  })
}
