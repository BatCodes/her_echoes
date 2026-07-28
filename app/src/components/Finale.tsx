import { useEffect, useRef, useState } from 'react'
import { LETTER, FINALE_BG } from '../content'
import { gsap } from '../lib/gsapSetup'
import { reduced } from '../lib/prefs'
import { goldDust } from '../lib/fx'
import { inkScan } from '../lib/ink'
import { scrollToEl } from '../lib/scroll'

export default function Finale() {
  const heart = useRef<HTMLButtonElement>(null)
  const clip = useRef<SVGRectElement>(null)
  const letter = useRef<HTMLDivElement>(null)
  const [done, setDone] = useState(false)
  const [broken, setBroken] = useState(false)
  const prog = useRef(0)
  const raf = useRef(0)
  const foldRaf = useRef(0)
  const holding = useRef(false)
  const calls = useRef<gsap.core.Tween[]>([])

  // schedule + remember, so unmount can take it all back
  const later = (t: number, fn: () => void) => {
    calls.current.push(gsap.delayedCall(t, fn))
  }

  const setFill = (p: number) => {
    const c = clip.current
    if (!c) return
    c.setAttribute('y', String(33 - 33 * p))
    c.setAttribute('height', String(33 * p))
  }

  const reveal = () => {
    setDone(true)
    later(0.42, () => { if (letter.current) scrollToEl(letter.current, -40) })
    const el = letter.current
    if (!el || reduced) return
    // act one — the paper folds flat, then remembers how to open
    foldRaf.current = requestAnimationFrame(() => {
      el.classList.add('pre')
      void el.offsetWidth
      el.classList.remove('pre')
      el.classList.add('unfold')
    })
    // act two — the enchanted ink writes her letter, word by word, letter by letter
    const end = inkScan(el, [
      ['.to', 'word', 160, 180, true],
      ['p:nth-of-type(1)', 'char', 13, 220],
      ['p:nth-of-type(2)', 'char', 13, 220],
      ['p:nth-of-type(3)', 'char', 13, 220],
      ['.sig', 'word', 170, 140, true],
      ['.ps', 'char', 22, 0],
    ], 450)
    // act three — one gold exhale as the ink dries, two slow waves
    later(end / 1000 + 0.4, () => {
      const r = el.getBoundingClientRect()
      const cx = r.left + r.width / 2
      goldDust(cx, r.top, 18)
      later(0.35, () => goldDust(cx, r.top, 12))
    })
  }

  const step = () => {
    prog.current = Math.min(1, prog.current + (reduced ? 0.06 : 0.014))
    setFill(prog.current)
    if (prog.current >= 1) { holding.current = false; reveal(); return }
    raf.current = requestAnimationFrame(step)
  }
  const decay = () => {
    prog.current = Math.max(0, prog.current - 0.04)
    setFill(prog.current)
    if (prog.current > 0 && !holding.current) raf.current = requestAnimationFrame(decay)
  }
  const press = (e: React.PointerEvent | React.KeyboardEvent) => {
    if (done) return
    e.preventDefault()
    holding.current = true
    cancelAnimationFrame(raf.current)
    raf.current = requestAnimationFrame(step)
  }
  const release = () => {
    if (done || !holding.current) return
    holding.current = false
    cancelAnimationFrame(raf.current)
    raf.current = requestAnimationFrame(decay)
  }

  useEffect(() => {
    addEventListener('pointerup', release)
    addEventListener('pointercancel', release)
    return () => {
      removeEventListener('pointerup', release)
      removeEventListener('pointercancel', release)
      cancelAnimationFrame(raf.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done])

  // unmount only — the [done] effect must not kill mid-flight choreography
  useEffect(() => {
    return () => {
      cancelAnimationFrame(foldRaf.current)
      calls.current.forEach((c) => c.kill())
      calls.current.length = 0
    }
  }, [])

  return (
    <section className={'finale' + (broken ? ' noimg' : '')} id="finale">
      <div className="bgph" aria-hidden="true">
        {!broken && (
          <img
            src={FINALE_BG.src} srcSet={FINALE_BG.srcSet} sizes="100vw" alt=""
            loading="lazy" decoding="async" onError={() => setBroken(true)}
          />
        )}
      </div>
      <div className="inf" aria-hidden="true">∞</div>
      <span className="k" style={{ marginBottom: 8, display: 'inline-block' }}>the last secret</span>
      <button
        ref={heart}
        className={'holdwrap' + (done ? '' : ' beat')}
        aria-label="Press and hold the heart"
        onPointerDown={press}
        onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') press(e) }}
        onKeyUp={release}
      >
        <svg viewBox="0 0 36 33">
          <defs>
            <clipPath id="fillClip">
              <rect ref={clip} x="0" y="33" width="36" height="33" />
            </clipPath>
          </defs>
          <path id="heartOutline" d="M18 30 C4 21 1 12 4.5 6.5 C8 1 15 2 18 8 C21 2 28 1 31.5 6.5 C35 12 32 21 18 30 Z" />
          <path id="heartFillShape" clipPath="url(#fillClip)" d="M18 30 C4 21 1 12 4.5 6.5 C8 1 15 2 18 8 C21 2 28 1 31.5 6.5 C35 12 32 21 18 30 Z" />
        </svg>
      </button>
      <div className="holdhint" aria-live="polite">
        {done ? '♥ a letter, for your eyes only' : "press & hold — don't let go"}
      </div>
      <div ref={letter} className={'letter' + (done ? ' show' : '')}>
        <div className="to">{LETTER.to}</div>
        <p dangerouslySetInnerHTML={{ __html: LETTER.p1 }} />
        <p dangerouslySetInnerHTML={{ __html: LETTER.p2 }} />
        <p dangerouslySetInnerHTML={{ __html: LETTER.p3 }} />
        <div className="sig">{LETTER.sig}</div>
        <div className="ps">{LETTER.ps}</div>
        <svg className="waxstamp" viewBox="0 0 84 84" aria-hidden="true">
          <circle cx="42" cy="42" r="38" fill="#B85C74" />
          <circle cx="42" cy="42" r="38" fill="none" stroke="#8A4A64" strokeWidth="2.5" />
          <circle cx="42" cy="42" r="30" fill="none" stroke="#D98CA0" strokeWidth="1" opacity=".8" />
          <text x="42" y="49" textAnchor="middle" fontFamily="Cormorant Garamond, Georgia, serif" fontStyle="italic" fontWeight="600" fontSize="21" fill="#FBE9EE">H♥H</text>
        </svg>
      </div>
    </section>
  )
}
