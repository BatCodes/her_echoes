import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { TRUTHS, HEADS, type IconName } from '../content'
import SectionHead from './SectionHead'
import { gsap } from '../lib/gsapSetup'
import { reduced, vibrate } from '../lib/prefs'
import { burst } from '../lib/fx'
import { scrollToEl, startScroll, stopScroll } from '../lib/scroll'

/* the original's hand-drawn stroke icons, kept exactly */
const ICONS: Record<IconName, string> = {
  moon: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.2"/><circle cx="9.4" cy="9.6" r="1.5"/><circle cx="14.6" cy="13.8" r="1.1"/><circle cx="11" cy="15.6" r=".7"/></svg>',
  dove: '<svg viewBox="0 0 24 24"><path d="M4 15.5 C6.5 8.5 14 6.5 17.5 9 L21.5 7.5 19.5 11 C20.5 15.5 15 19.5 9 18.2 L5 20 6.5 16.6 C5.3 16.4 4.5 16 4 15.5 Z"/><path d="M13.5 9.5 C12 11 11.5 13 12 14.8"/><circle cx="16.6" cy="10.4" r=".55" fill="#EEC07A" stroke="none"/></svg>',
  home: '<svg viewBox="0 0 24 24"><path d="M4.5 11.5 L12 5 L19.5 11.5 V19 H4.5 Z"/><path d="M12 16.6 C10.2 15.4 9.6 14.2 10.2 13.2 C10.7 12.4 11.7 12.5 12 13.3 C12.3 12.5 13.3 12.4 13.8 13.2 C14.4 14.2 13.8 15.4 12 16.6 Z" fill="#F2A9B4" stroke="none"/></svg>',
  radar: '<svg viewBox="0 0 24 24"><path d="M4.5 15 a7.5 7.5 0 0 1 15 0"/><path d="M8 15 a4 4 0 0 1 8 0"/><circle cx="12" cy="15" r="1.2" fill="#EEC07A" stroke="none"/><path d="M12 15 L17.5 6.5"/><circle cx="18.2" cy="5.6" r="1" fill="#F2A9B4" stroke="none"/></svg>',
  hourglass: '<svg viewBox="0 0 24 24"><path d="M6.5 4 H17.5 M6.5 20 H17.5"/><path d="M7.8 4 C7.8 9 11 9.4 12 12 C13 9.4 16.2 9 16.2 4"/><path d="M7.8 20 C7.8 15 11 14.6 12 12 C13 14.6 16.2 15 16.2 20"/><circle cx="12" cy="17.4" r=".9" fill="#EEC07A" stroke="none"/></svg>',
  ring: '<svg viewBox="0 0 24 24"><circle cx="12" cy="14.2" r="6"/><path d="M12 3.6 L14.8 6.2 12 8.6 9.2 6.2 Z"/><path d="M5.8 5.2 l.9.9 M18.2 5.2 l-.9.9" opacity=".7"/></svg>',
  sunset: '<svg viewBox="0 0 24 24"><path d="M3.5 16 H20.5"/><path d="M7.2 16 a4.8 4.8 0 0 1 9.6 0"/><path d="M12 6.5 V9 M6.2 8.8 7.8 10.4 M17.8 8.8 16.2 10.4"/><path d="M6 19 h4 M14 19 h4" opacity=".55"/></svg>',
  wafa: '<svg viewBox="0 0 24 24"><path d="M12 3.4 L18.6 6 V11.6 C18.6 16.4 15.8 19.4 12 20.6 C8.2 19.4 5.4 16.4 5.4 11.6 V6 Z"/><path d="M12 14.6 C10 13.2 9.4 11.9 10 10.8 C10.6 9.9 11.7 10 12 10.9 C12.3 10 13.4 9.9 14 10.8 C14.6 11.9 14 13.2 12 14.6 Z" fill="#F2A9B4" stroke="none"/></svg>',
}

const N = TRUTHS.length
/* crown constellation: seven points, five gems */
const CROWN: [number, number][] = [[16, 132], [16, 58], [58, 96], [100, 34], [142, 96], [184, 58], [184, 132]]
const STAR_POS: [number, number][] = [
  [16, 58], [58, 96], [100, 34], [142, 96], [184, 58], [16, 132], [184, 132], [100, 96],
]

function Constellation({ lit, complete }: { lit: Set<number>; complete: boolean }) {
  const pathRef = useRef<SVGPathElement>(null)
  useEffect(() => {
    const p = pathRef.current
    if (!p || !complete) return
    const len = p.getTotalLength()
    if (reduced) { p.classList.add('done'); return }
    p.classList.add('done')
    gsap.fromTo(p, { strokeDasharray: len, strokeDashoffset: len },
      { strokeDashoffset: 0, duration: 2.2, ease: 'power2.inOut' })
  }, [complete])
  const d = 'M' + CROWN.map((pt) => pt.join(' ')).join(' L') + ' Z'
  return (
    <div className="constbox" aria-hidden="true">
      <svg viewBox="0 0 200 150">
        <path ref={pathRef} className="crownpath" d={d} />
        <g>
          {STAR_POS.map((p, i) => (
            <circle key={i} className={'cstar' + (lit.has(i) ? ' lit' : '')} cx={p[0]} cy={p[1]} r="3.4" />
          ))}
        </g>
        <g>
          {CROWN.filter((_, i) => i % 2 === 1 || i === 3).map((p, i) => (
            <circle key={i} className={'gem2' + (complete ? '' : '')} cx={p[0]} cy={p[1] - 6} r="2.2" data-gem />
          ))}
        </g>
      </svg>
    </div>
  )
}

function Tile({ i, seen, onOpen }: { i: number; seen: boolean; onOpen: (i: number) => void }) {
  const ref = useRef<HTMLButtonElement>(null)
  const t = TRUTHS[i]

  /* pointer-tracked tilt — the smoothness you can't articulate */
  const onMove = (e: React.PointerEvent) => {
    const el = ref.current
    if (!el || reduced || e.pointerType === 'touch') return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    el.style.transform = `perspective(600px) rotateY(${px * 9}deg) rotateX(${py * -9}deg)`
  }
  const onLeave = () => { if (ref.current) ref.current.style.transform = '' }

  return (
    <motion.button
      ref={ref}
      layoutId={'truth-' + i}
      className={'tile' + (seen ? ' seen' : '')}
      id={'tile' + i}
      onClick={() => onOpen(i)}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      whileTap={{ scale: 0.96 }}
      initial={reduced ? false : { opacity: 0, y: 22 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, delay: (i % 8) * 0.06, layout: { duration: 0.45, ease: [0.3, 0.8, 0.3, 1] } }}
    >
      <span className="em" dangerouslySetInnerHTML={{ __html: ICONS[t.icon] }} />
      <span className="cat">{t.category}</span>
      <span className="ans" dangerouslySetInnerHTML={{ __html: t.answer }} />
    </motion.button>
  )
}

export default function Truths() {
  const [open, setOpen] = useState<number | null>(null)
  const [stage, setStage] = useState<'surface' | 'evidence'>('surface')
  const [seen, setSeen] = useState<Set<number>>(new Set())
  const [toast, setToast] = useState(false)
  const lastFocus = useRef<HTMLElement | null>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const complete = seen.size === N

  const openCard = (i: number) => {
    lastFocus.current = document.activeElement as HTMLElement
    setStage('surface')
    setOpen(i)
    stopScroll()
  }
  const close = () => {
    setOpen(null)
    startScroll()
    lastFocus.current?.focus?.()
  }
  const next = () => {
    if (open === null) return
    if (complete) { close(); setTimeout(() => scrollToEl('#mirror', -innerHeight * 0.25), 60); return }
    let n = (open + 1) % N, guard = 0
    while (seen.has(n) && guard++ < N) n = (n + 1) % N
    setStage('surface')
    setOpen(n)
  }
  const showEvidence = () => {
    setStage('evidence')
    if (open === null || seen.has(open)) return
    const ns = new Set(seen); ns.add(open)
    setSeen(ns)
    vibrate(8)
    if (ns.size === N) {
      setTimeout(() => {
        setToast(true)
        burst(26)
        document.querySelectorAll('[data-gem]').forEach((g) => g.classList.add('on'))
      }, 1800)
    }
  }

  useEffect(() => {
    if (open === null) return
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const t = open !== null ? TRUTHS[open] : null

  return (
    <section id="cards">
      <SectionHead copy={HEADS.truths} />
      <Constellation lit={seen} complete={complete} />
      <div className="counter"><b>{seen.size}</b> / {N} truths uncovered</div>
      <div className="counterhint">find the evidence inside each card to light its star</div>
      <div className={'consttoast' + (toast ? ' show' : '')} aria-live="polite">
        👑 Coronation complete — as if it was ever in doubt.<br />Long live the Princess.
      </div>
      <div className="grid2">
        {TRUTHS.map((_, i) => (
          <Tile key={i} i={i} seen={seen.has(i)} onOpen={openCard} />
        ))}
      </div>

      <AnimatePresence>
        {t && open !== null && (
          <motion.div
            className="ovl" role="dialog" aria-modal="true" aria-label={t.category}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={(e) => { if (e.target === e.currentTarget) close() }}
          >
            <motion.div
              className="card" layoutId={'truth-' + open}
              transition={{ layout: { duration: 0.45, ease: [0.3, 0.8, 0.3, 1] } }}
            >
              <button ref={closeRef} className="close" aria-label="Close" onClick={close}>×</button>
              <span className="em" dangerouslySetInnerHTML={{ __html: ICONS[t.icon] }} />
              <div className="cat">if you were a {t.category.toLowerCase()}</div>
              <h3 dangerouslySetInnerHTML={{ __html: t.answer }} />
              <p className="surface" dangerouslySetInnerHTML={{ __html: t.surface }} />
              {stage === 'surface' && (
                <button className="evb" onClick={showEvidence}>✧ what gave you away</button>
              )}
              <AnimatePresence>
                {stage === 'evidence' && (
                  <motion.div
                    className="evidence"
                    initial={reduced ? false : { opacity: 0, filter: 'blur(8px)', y: 10 }}
                    animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                  >
                    <span className="ek">observed · never said</span>
                    <span dangerouslySetInnerHTML={{ __html: t.evidence }} />
                  </motion.div>
                )}
              </AnimatePresence>
              <div>
                <button className="nextb" onClick={next}>
                  {complete ? 'to the mirror ↓' : 'next one →'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
