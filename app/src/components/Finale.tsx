import { useEffect, useMemo, useRef, useState } from 'react'
import { LETTER, FINALE_BG } from '../content'
import { gsap } from '../lib/gsapSetup'
import { reduced } from '../lib/prefs'
import { goldDust } from '../lib/fx'
import { inkScan } from '../lib/ink'
import { scrollToEl } from '../lib/scroll'
import { thump, duck, unduck } from '../lib/audio'
import { confirm as confirmBuzz } from '../lib/haptics'
import { skyState, exhaleAt } from '../lib/skyState'
import { keepsake, patch } from '../lib/keepsake'

/* the press-and-hold is TIME-TRUE: dt-based, so it takes the same
   1.4 seconds on a 60Hz phone and a 120Hz one. While she holds,
   a heartbeat quickens under her thumb and the cosmic dust gathers
   toward it — the whole night holding its breath with her. */
const HOLD_MS = 1400
const HOLD_MS_REDUCED = 260
const DECAY_PER_MS = 0.0024

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
  const lastT = useRef(0)
  const lastThump = useRef(0)
  const calls = useRef<gsap.core.Tween[]>([])

  /* the illuminated versal — the letter opens like a manuscript */
  const [versal, restP1] = useMemo(() => {
    const m = LETTER.p1.match(/^[A-Za-z]/)
    return m ? [m[0], LETTER.p1.slice(1)] : ['', LETTER.p1]
  }, [])

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

  const heartCenter = () => {
    const r = heart.current?.getBoundingClientRect()
    return r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : { x: innerWidth / 2, y: innerHeight / 2 }
  }

  const reveal = () => {
    setDone(true)
    patch({ letterRead: true })
    duck() /* the music steps outside — this room is for her eyes only */
    const c = heartCenter()
    exhaleAt(c.x, c.y) /* the night lets its held breath go */
    later(0.42, () => { if (letter.current) scrollToEl(letter.current, -40) })
    const el = letter.current
    if (!el || reduced) { later(5, unduck); return }
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
    later(end / 1000 + 4, unduck)
  }

  const step = (now: number) => {
    const dt = Math.min(50, now - lastT.current)
    lastT.current = now
    prog.current = Math.min(1, prog.current + dt / (reduced ? HOLD_MS_REDUCED : HOLD_MS))
    setFill(prog.current)

    /* the heartbeat — slow at first, racing just before the letter */
    if (!reduced) {
      const interval = 900 - 520 * prog.current
      if (now - lastThump.current > interval) {
        lastThump.current = now
        thump(0.06 + prog.current * 0.16)
        confirmBuzz()
        const h = heart.current
        if (h) { h.classList.remove('pulse'); void h.offsetWidth; h.classList.add('pulse') }
      }
    }

    if (prog.current >= 1) {
      holding.current = false
      skyState.inhale.on = false
      reveal()
      return
    }
    raf.current = requestAnimationFrame(step)
  }

  const decay = (now: number) => {
    const dt = Math.min(50, now - lastT.current)
    lastT.current = now
    prog.current = Math.max(0, prog.current - dt * DECAY_PER_MS)
    setFill(prog.current)
    if (prog.current > 0 && !holding.current) raf.current = requestAnimationFrame(decay)
  }

  const press = (e: React.PointerEvent | React.KeyboardEvent) => {
    if (done) return
    e.preventDefault()
    holding.current = true
    /* the dust begins to gather toward her thumb */
    const c = heartCenter()
    skyState.inhale.x = c.x
    skyState.inhale.y = c.y
    skyState.inhale.on = true
    lastT.current = performance.now()
    lastThump.current = 0
    cancelAnimationFrame(raf.current)
    raf.current = requestAnimationFrame(step)
  }
  const release = () => {
    if (done || !holding.current) return
    holding.current = false
    skyState.inhale.on = false
    lastT.current = performance.now()
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
      skyState.inhale.on = false
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

  const returning = keepsake().letterRead && !done

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
        {done ? '♥ a letter, for your eyes only'
          : returning ? "press & hold — it remembers you read it. it wants to be read again."
          : "press & hold — don't let go"}
      </div>
      <div ref={letter} className={'letter' + (done ? ' show' : '')}>
        <div className="to">{LETTER.to}</div>
        <p>
          {versal && <span className="versal">{versal}</span>}
          <span dangerouslySetInnerHTML={{ __html: restP1 }} />
        </p>
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
