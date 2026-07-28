import { useEffect, useRef, useState } from 'react'
import { gsap } from '../lib/gsapSetup'
import { reduced } from '../lib/prefs'
import { useReveal } from '../lib/reveal'

interface Props {
  src: string
  srcSet?: string
  alt: string
  q: string
  who: string
  aside: string
  variant: 'moon' | 'sun'
}

/* full-bleed photograph with three-speed parallax:
   image drifts, scrim holds, caption rises,
   and a colour grade breathes in at mid-scene */
export default function PhotoInterlude({ src, srcSet, alt, q, who, aside, variant }: Props) {
  const root = useRef<HTMLDivElement>(null)
  const img = useRef<HTMLImageElement>(null)
  const cap = useRef<HTMLDivElement>(null)
  const grade = useRef<HTMLDivElement>(null)
  const [broken, setBroken] = useState(false)
  useReveal(cap)

  useEffect(() => {
    if (reduced || broken) return
    const g = grade.current
    if (!g) return
    // one scrubbed timeline, three speeds sharing one trigger
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true,
        // grade swells at the heart of the scene, gone at either edge
        onUpdate: self => {
          g.style.setProperty('--gr', (Math.sin(Math.PI * self.progress) * 0.7).toFixed(3))
        },
      },
    })
    tl.fromTo(img.current, { yPercent: -9 }, { yPercent: 9 }, 0)
      .fromTo(cap.current, { yPercent: 26 }, { yPercent: -26 }, 0)
    return () => { tl.scrollTrigger?.kill(); tl.kill() }
  }, [broken])

  return (
    <div ref={root} className={'photo ' + variant + (broken ? ' noimg' : '')}>
      <div className={'art ' + (variant === 'moon' ? 'moonart' : 'sunart')} aria-hidden="true"><div className="disc" /></div>
      {!broken && (
        <img
          ref={img} src={src} srcSet={srcSet} sizes="100vw" alt={alt}
          loading="lazy" decoding="async"
          onError={() => setBroken(true)}
        />
      )}
      <div className="scrim" aria-hidden="true" />
      <div className="grade" aria-hidden="true" ref={grade} />
      <div ref={cap} className="cap" style={{ visibility: 'hidden' }}>
        <div className="q" dangerouslySetInnerHTML={{ __html: q }} />
        <div className="who">{who}</div>
        <div className="aside" dangerouslySetInnerHTML={{ __html: aside }} />
      </div>
    </div>
  )
}
