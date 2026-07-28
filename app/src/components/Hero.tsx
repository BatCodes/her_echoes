import { useEffect, useRef, useState } from 'react'
import { HERO } from '../content'
import { NAME_W, NAME_H, NAME_SVG_INNER } from '../lib/namePath'
import { gsap } from '../lib/gsapSetup'
import { reduced } from '../lib/prefs'
import { burst } from '../lib/fx'
import { scrollToEl } from '../lib/scroll'

const Tiara = () => (
  <svg className="tiara" viewBox="0 0 110 64" aria-hidden="true">
    <path d="M8 52 L14 20 L34 40 L55 8 L76 40 L96 20 L102 52 Z" fill="none" stroke="#EEC07A" strokeWidth="2.5" strokeLinejoin="round" />
    <rect x="8" y="52" width="94" height="6" rx="3" fill="#EEC07A" />
    <circle className="gem" cx="55" cy="8" r="4" fill="#F2A9B4" />
    <circle className="gem" cx="14" cy="20" r="3" fill="#F2A9B4" />
    <circle className="gem" cx="96" cy="20" r="3" fill="#F2A9B4" />
  </svg>
)

export default function Hero({ opened }: { opened: boolean }) {
  const root = useRef<HTMLElement>(null)
  const nameRef = useRef<SVGSVGElement>(null)
  const [taps, setTaps] = useState(0)
  const whisper = HERO.whispers[Math.min(taps, HERO.whispers.length - 1)]

  /* the name signs itself once the book opens */
  useEffect(() => {
    if (!opened) return
    const el = root.current
    const name = nameRef.current
    if (!el) return
    const seq = el.querySelectorAll<HTMLElement>('[data-hs]')
    if (reduced) {
      gsap.set(seq, { autoAlpha: 1 })
      if (name) gsap.set(name.querySelectorAll('path'), { strokeDashoffset: 0, fillOpacity: 1 })
      return
    }
    const tl = gsap.timeline({ delay: 0.15 })
    tl.fromTo(seq, { autoAlpha: 0, y: 18, filter: 'blur(6px)' },
      { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.9, stagger: 0.14, ease: 'power3.out' }, 0)
    if (name) {
      const paths = name.querySelectorAll('path')
      gsap.set(paths, { strokeDasharray: 1, strokeDashoffset: 1, fillOpacity: 0 })
      tl.to(paths, { strokeDashoffset: 0, duration: 2.1, stagger: 0.28, ease: 'power1.inOut' }, 0.5)
        .to(paths, { fillOpacity: 1, duration: 1.1, ease: 'power2.out' }, '-=0.9')
        .to(paths, { strokeWidth: 0, duration: 0.8 }, '<')
    }
    return () => { tl.kill() }
  }, [opened])

  const tapName = () => {
    const n = Math.min(3, taps + 1)
    setTaps(n)
    if (n === 3) burst(10)
  }

  return (
    <section ref={root} className="hero" aria-label="Welcome">
      <div className="mooncorner" aria-hidden="true" data-hs>
        <div className="c" /><span className="s">✦</span>
        <div className="lbl" lang="ur-Latn">{HERO.moonCorner}</div>
      </div>
      <div data-hs><Tiara /></div>
      <div className="for" data-hs>{HERO.eyebrow}</div>
      <h1 className="visually-hidden">{HERO.name}</h1>
      <svg
        ref={nameRef} className="namescript" data-hs
        viewBox={`0 -40 ${NAME_W} ${NAME_H + 60}`}
        role="button" tabIndex={0} aria-label="Hajra — tap for a whisper"
        onClick={tapName}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tapName() } }}
        dangerouslySetInnerHTML={{ __html: NAME_SVG_INNER.replace(/<path /g, '<path pathLength="1" ') }}
      />
      <div className={'namewhisper' + (whisper ? ' on' : '')} aria-live="polite" data-hs>{whisper || '\u00a0'}</div>
      <div className="nast" lang="ur" dir="rtl" data-hs>{HERO.nastaliq}</div>
      <p className="crest" data-hs dangerouslySetInnerHTML={{ __html: HERO.crest }} />
      <p className="sub" data-hs dangerouslySetInnerHTML={{ __html: HERO.sub }} />
      <button className="begin" data-hs onClick={() => scrollToEl('#cards', -8)}>
        {HERO.begin}
        <span className="arr" aria-hidden="true">↓</span>
      </button>
    </section>
  )
}
