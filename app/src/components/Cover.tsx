import { useMemo, useRef } from 'react'
import { COVER } from '../content'
import { gsap } from '../lib/gsapSetup'
import { reduced } from '../lib/prefs'

const Crown = () => (
  <svg className="ftcrown" viewBox="0 0 110 64" aria-hidden="true">
    <path d="M8 52 L14 20 L34 40 L55 8 L76 40 L96 20 L102 52 Z" fill="none" stroke="#EEC07A" strokeWidth="2.5" strokeLinejoin="round" />
    <rect x="8" y="52" width="94" height="6" rx="3" fill="#EEC07A" />
    <circle cx="55" cy="8" r="4" fill="#F2A9B4" /><circle cx="14" cy="20" r="3" fill="#F2A9B4" /><circle cx="96" cy="20" r="3" fill="#F2A9B4" />
  </svg>
)

export default function Cover({ onOpen }: { onOpen: () => void }) {
  const root = useRef<HTMLButtonElement>(null)
  const opening = useRef(false)
  const stars = useMemo(() =>
    Array.from({ length: 26 }, (_, i) => ({
      id: i, left: Math.random() * 100, top: Math.random() * 100,
      size: 8 + Math.random() * 9, delay: Math.random() * 3,
    })), [])

  const open = () => {
    if (opening.current) return
    opening.current = true
    const el = root.current
    if (!el || reduced) { onOpen(); return }
    const card = el.querySelector('.ftcard')
    gsap.timeline({ onComplete: onOpen })
      .to(card, { scale: 1.12, autoAlpha: 0, filter: 'blur(10px)', duration: 0.7, ease: 'power2.in' }, 0)
      .to(el, { autoAlpha: 0, scale: 1.06, duration: 0.85, ease: 'power2.inOut' }, 0.15)
  }

  return (
    <button
      ref={root} className="ftcover" aria-label="Open the storybook"
      onClick={open}
    >
      <div className="ftstars" aria-hidden="true">
        {stars.map((s) => (
          <span key={s.id} style={{ left: s.left + '%', top: s.top + '%', fontSize: s.size, animationDelay: s.delay + 's' }}>✦</span>
        ))}
      </div>
      <span className="ftcard" style={{ display: 'block' }}>
        <Crown />
        <span className="fteye" style={{ display: 'block' }}>{COVER.eyebrow}</span>
        <span className="fttitle" style={{ display: 'block' }} dangerouslySetInnerHTML={{ __html: COVER.title }} />
        <svg className="swash" viewBox="0 0 130 14" aria-hidden="true">
          <path d="M4 8 C 30 12, 46 4, 65 8 C 84 12, 100 4, 126 8" fill="none" stroke="#EEC07A" strokeWidth="1.4" opacity=".8" />
          <circle cx="65" cy="8" r="2" fill="#F2A9B4" />
        </svg>
        <span className="ftsub" style={{ display: 'block' }} dangerouslySetInnerHTML={{ __html: COVER.sub }} />
        <span className="ftcta" style={{ display: 'block' }}>{COVER.cta}</span>
      </span>
    </button>
  )
}
