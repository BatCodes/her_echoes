import { reduced } from './prefs'

/* ═══════════════════════════════════════════════════════════════
   the enchanted ink — every letter conjured onto the page,
   ported letter-for-letter from the beloved single-file original.

   · each glyph is wrapped in a timed span (char or word mode)
   · its Cinderella glow is a painted-once ::after ghost that fades
     on the compositor — full white-hot flash, zero per-frame repaints
   · writing triggers when a reveal class lands on an ancestor
     (.ftv from the observer here, or React's own .open/.on/.show)
   · a quill-spark travels the marquee lines as they write

   Skips anything whose text React re-renders (counters, live hints) —
   those must stay plain or React and the ink would fight.
   ═══════════════════════════════════════════════════════════════ */

let installed = false
let fio: IntersectionObserver | null = null

function letterize(el: Element | null, mode: 'char' | 'word', step: number, start: number, rich = false): number {
  if (!el || el.classList.contains('ftlz')) return start
  let t = start
  const walk = (node: Node) => {
    const kids = Array.from(node.childNodes)
    for (const n of kids) {
      if (n.nodeType === 3) {
        const parts = mode === 'word' ? (n.nodeValue || '').split(/(\s+)/) : Array.from(n.nodeValue || '')
        const frag = document.createDocumentFragment()
        for (const ch of parts) {
          if (!ch) continue
          if (/^\s+$/.test(ch)) { frag.appendChild(document.createTextNode(ch)); continue }
          const s = document.createElement('span')
          s.className = (Math.random() < 0.15 ? 'ftl ftg' : 'ftl') + (rich ? ' rich' : '')
          s.textContent = ch
          s.dataset.c = ch
          s.style.setProperty('--d', t + 'ms')
          s.style.setProperty('--r', (Math.random() * 12 - 6).toFixed(1) + 'deg')
          t += step
          frag.appendChild(s)
        }
        node.replaceChild(frag, n)
      } else if (n.nodeType === 1 && n.nodeName !== 'BR') walk(n)
    }
  }
  walk(el)
  el.classList.add('ftlz')
  return t
}

function observe(el: Element | null) {
  if (!el) return
  if (fio) fio.observe(el)
  else el.classList.add('ftv')
}

export type InkPlan = [string, 'char' | 'word', number, number?, boolean?][]

/** letterize a dynamic container (e.g. the finale letter at reveal). returns the clock in ms */
export function inkScan(root: Element | null, plan: InkPlan, start = 90, trigger = false): number {
  if (!root || reduced) return start
  let t = start
  for (const [sel, mode, step, gap, rich] of plan) {
    const el = sel === '.' ? root : root.querySelector(sel)
    if (!el) continue
    t = letterize(el, mode, step, t, rich) + (gap ?? 140)
  }
  if (trigger) root.classList.add('ftv')
  return t
}

export function installInk() {
  if (installed || reduced || typeof document === 'undefined') return
  installed = true
  const d = document
  d.documentElement.classList.add('ft')

  fio = 'IntersectionObserver' in window
    ? new IntersectionObserver((es) => {
        es.forEach((en) => {
          if (!en.isIntersecting) return
          en.target.classList.add('ftv')
          fio?.unobserve(en.target)
        })
      }, { threshold: 0.16, rootMargin: '0px 0px -6% 0px' })
    : null

  try {
    /* chapter headings: the script signs, the title writes, then the words */
    d.querySelectorAll('.shead').forEach((hd) => {
      let t = 120
      t = letterize(hd.querySelector('.fl'), 'word', 130, t, true) + 170
      t = letterize(hd.querySelector('h2'), 'char', 52, t, true) + 230
      letterize(hd.querySelector('p'), 'char', 13, t)
      observe(hd)
    })

    /* hero prose — the name keeps its own SVG handwriting; the words around it write */
    const hero = d.querySelector('.hero')
    if (hero) {
      let t = 350
      t = letterize(hero.querySelector('.mooncorner .lbl'), 'char', 28, t) + 120
      t = letterize(hero.querySelector('.for'), 'word', 150, Math.max(t, 600), true) + 2400 /* the signature draws here */
      t = letterize(hero.querySelector('.crest'), 'char', 22, t) + 160
      t = letterize(hero.querySelector('.sub'), 'char', 20, t) + 160
      letterize(hero.querySelector('.begin'), 'word', 130, t)
    }

    /* scroll-revealed blocks */
    d.querySelectorAll('.tile').forEach((tl, i) => {
      let t = 90 + i * 150
      t = letterize(tl.querySelector('.cat'), 'char', 34, t) + 120
      letterize(tl.querySelector('.ans'), 'char', 34, t)
      observe(tl)
    })
    d.querySelectorAll('.fitem').forEach((f, i) => {
      let t = 90 + i * 130
      t = letterize(f.querySelector('.fdate'), 'char', 22, t) + 110
      letterize(f.querySelector('.ftitle'), 'char', 22, t)
      observe(f)
      letterize(f.querySelector('.fbody'), 'char', 12, 90) /* writes when .open lands */
    })
    d.querySelectorAll('.steps li').forEach((li, i) => {
      letterize(li, 'char', 13, 90 + i * 260) /* writes when .on lands */
    })
    const decree = d.querySelector('.decree')
    if (decree) {
      let t = 90
      t = letterize(decree.querySelector('.dk'), 'char', 26, t) + 150
      t = letterize(decree.querySelector('h3'), 'char', 46, t, true) + 200
      t = letterize(decree.querySelector('p:nth-of-type(1)'), 'char', 12, t) + 180
      t = letterize(decree.querySelector('p:nth-of-type(2)'), 'char', 12, t) + 180
      t = letterize(decree.querySelector('.dsign'), 'word', 170, t, true) + 120
      letterize(decree.querySelector('.dwit'), 'char', 18, t)
      observe(decree)
    }
    d.querySelectorAll('.photo .cap').forEach((cap) => {
      let t = 90
      t = letterize(cap.querySelector('.q'), 'char', 40, t, true) + 170
      t = letterize(cap.querySelector('.who'), 'char', 22, t) + 210
      letterize(cap.querySelector('.aside'), 'char', 12, t)
      observe(cap)
    })

    /* interaction-revealed text — writes the moment it is uncovered */
    d.querySelectorAll('.env .note').forEach((n) => letterize(n, 'char', 13, 90))
    d.querySelectorAll('.promise').forEach((p) => letterize(p, 'char', 13, 90))
    letterize(d.querySelector('.psworn'), 'word', 150, 90, true)
    letterize(d.querySelector('.err'), 'char', 20, 90)
    letterize(d.querySelector('.errsub'), 'char', 12, 420)
    letterize(d.querySelector('.delivcard'), 'char', 13, 90)

    /* the small voices — static hints and buttons
       (dynamic ones — counters, gold buttons that change their label,
       live hints — stay plain so React can keep speaking) */
    ;['.counterhint', '.hintl', '.skycap', '.footnote', '.ptitle', '.pbtn', '.schip'].forEach((sel) => {
      d.querySelectorAll(sel).forEach((el) => {
        if (el.classList.contains('ftlz')) return
        letterize(el, 'char', 17, 90)
        observe(el)
      })
    })
  } catch { /* the tale must never fail to open */ }

  /* the quill — a spark that travels the marquee lines as they write */
  const MARQ = '.shead h2, .letter, .dsign, .psworn, .photo .q'
  const q = d.createElement('span')
  q.id = 'quill'
  q.textContent = '✦'
  q.setAttribute('aria-hidden', 'true')
  d.body.appendChild(q)
  let tx = -60, ty = -60, x = -60, y = -60, on = false, raf = 0
  let hide: ReturnType<typeof setTimeout> | null = null
  const loop = () => {
    x += (tx - x) * 0.32
    y += (ty - y) * 0.32
    q.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`
    if (on || Math.abs(tx - x) > 0.5) raf = requestAnimationFrame(loop)
    else raf = 0
  }
  d.addEventListener('animationstart', (e) => {
    if (e.animationName !== 'ftInk') return
    const t = e.target as HTMLElement
    if (!t.closest || !t.closest(MARQ)) return
    const r = t.getBoundingClientRect()
    tx = r.right - 2
    ty = r.top + r.height * 0.62
    if (!on) { x = tx - 18; y = ty - 14; on = true; q.classList.add('on') }
    if (!raf) raf = requestAnimationFrame(loop)
    if (hide) clearTimeout(hide)
    hide = setTimeout(() => { on = false; q.classList.remove('on') }, 520)
  }, true)
}

/** the tale opens — hero ink may flow (mirrors the original's html.tale) */
export function markTale() {
  document.documentElement.classList.add('tale')
}
