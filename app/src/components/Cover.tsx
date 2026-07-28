import { useEffect, useMemo, useRef } from 'react'
import { COVER } from '../content'
import { gsap } from '../lib/gsapSetup'
import { reduced, tier } from '../lib/prefs'
import { markSkyOpen } from '../lib/skyState'
import { EASE, DUR, STAG } from '../lib/motion'

/* ═══════════════════════════════════════════════════════════════
   The storybook cover — a directed sequence, not a static card.
   Stars condense out of the WebGL sky behind a translucent veil,
   the text arrives as masked line wipes, and touching it pushes
   the camera through the starfield into the hero. Fast: the whole
   open is under a second — she is never made to wait.
   ═══════════════════════════════════════════════════════════════ */

const Crown = () => (
  <svg className="ftcrown" viewBox="0 0 110 64" aria-hidden="true">
    <path d="M8 52 L14 20 L34 40 L55 8 L76 40 L96 20 L102 52 Z" fill="none" stroke="#EEC07A" strokeWidth="2.5" strokeLinejoin="round" />
    <rect x="8" y="52" width="94" height="6" rx="3" fill="#EEC07A" />
    <circle cx="55" cy="8" r="4" fill="#F2A9B4" /><circle cx="14" cy="20" r="3" fill="#F2A9B4" /><circle cx="96" cy="20" r="3" fill="#F2A9B4" />
  </svg>
)

/* split authored <br/> copy into masked line wipes */
function Lines({ html, className }: { html: string; className: string }) {
  const lines = useMemo(() => html.split(/<br\s*\/?>/i), [html])
  return (
    <span className={className} style={{ display: 'block' }}>
      {lines.map((l, i) => (
        <span key={i} className="lwrap">
          <span className="lline" dangerouslySetInnerHTML={{ __html: l }} />
        </span>
      ))}
    </span>
  )
}

export default function Cover({ onOpen }: { onOpen: () => void }) {
  const root = useRef<HTMLButtonElement>(null)
  const opening = useRef(false)
  const intro = useRef<gsap.core.Timeline | null>(null)

  /* lite tier gets its own gentle CSS stars behind the veil */
  const stars = useMemo(() =>
    tier === 'lite'
      ? Array.from({ length: 26 }, (_, i) => ({
          id: i, left: Math.random() * 100, top: Math.random() * 100,
          size: 8 + Math.random() * 9, delay: Math.random() * 3,
        }))
      : [], [])

  /* entrance: crown draws, lines wipe in */
  useEffect(() => {
    const el = root.current
    if (!el) return
    const seq = el.querySelectorAll<HTMLElement>('[data-cs]')
    const lines = el.querySelectorAll<HTMLElement>('.lline')
    if (reduced) {
      gsap.set([seq, lines], { autoAlpha: 1, yPercent: 0 })
      return
    }
    gsap.set(seq, { autoAlpha: 0 })
    gsap.set(lines, { yPercent: 115 })
    const tl = gsap.timeline({ delay: 0.25 })
    tl.to(seq, { autoAlpha: 1, y: 0, duration: DUR.ui, stagger: 0.1, ease: EASE.enter }, 0)
      .to(lines, { yPercent: 0, duration: DUR.ui, stagger: STAG.lines, ease: EASE.enter }, 0.15)
    intro.current = tl
    return () => { tl.kill(); intro.current = null }
  }, [])

  const open = () => {
    if (opening.current) return
    opening.current = true
    const el = root.current
    if (!el || reduced) { markSkyOpen(); onOpen(); return }

    markSkyOpen() /* camera starts pushing through the stars now */
    intro.current?.kill() /* an early tap must not fight the entrance */
    const card = el.querySelector('.ftcard')
    const lines = el.querySelectorAll<HTMLElement>('.lline')
    gsap.timeline({ onComplete: onOpen })
      .to(el.querySelector('.ftcta'), { autoAlpha: 0, duration: 0.22 }, 0)
      .to(lines, { yPercent: -120, duration: 0.4, stagger: STAG.tight, ease: 'power2.in' }, 0)
      .to(card, { scale: 1.12, autoAlpha: 0, filter: 'blur(10px)', duration: 0.55, ease: 'power2.in' }, 0.08)
      .to(el, { autoAlpha: 0, duration: 0.6, ease: EASE.move }, 0.22)
  }

  return (
    <button ref={root} className="ftcover" aria-label="Open the storybook" onClick={open}>
      {tier === 'lite' && (
        <div className="ftstars" aria-hidden="true">
          {stars.map((s) => (
            <span key={s.id} style={{ left: s.left + '%', top: s.top + '%', fontSize: s.size, animationDelay: s.delay + 's' }}>✦</span>
          ))}
        </div>
      )}
      <span className="ftcard" style={{ display: 'block' }}>
        <span data-cs style={{ display: 'block' }}><Crown /></span>
        <span className="fteye" data-cs style={{ display: 'block' }}>{COVER.eyebrow}</span>
        <Lines html={COVER.title} className="fttitle" />
        <svg className="swash" data-cs viewBox="0 0 130 14" aria-hidden="true">
          <path d="M4 8 C 30 12, 46 4, 65 8 C 84 12, 100 4, 126 8" fill="none" stroke="#EEC07A" strokeWidth="1.4" opacity=".8" />
          <circle cx="65" cy="8" r="2" fill="#F2A9B4" />
        </svg>
        <Lines html={COVER.sub} className="ftsub" />
        <span className="ftcta" data-cs style={{ display: 'block' }}>{COVER.cta}</span>
      </span>
    </button>
  )
}
