import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { FOOTNOTE, MOON_CREDIT, PHOTO_MOON, PHOTO_SUNSET } from './content'
import { gsap, ScrollTrigger } from './lib/gsapSetup'
import { reduced, tier } from './lib/prefs'
import { initSmoothScroll } from './lib/scroll'
import { installTapSparkles } from './lib/fx'
import { installCursor, installMagnetics } from './lib/interact'
import { installInk, markTale } from './lib/ink'
import { armGyroOnGesture } from './lib/gyro'

import Cover from './components/Cover'
import Hero from './components/Hero'
import Truths from './components/Truths'
import Mirror from './components/Mirror'
import PhotoInterlude from './components/PhotoInterlude'
import StarJar from './components/StarJar'
import Firsts from './components/Firsts'
import TwoCities from './components/TwoCities'
import Replays from './components/Replays'
import Confessions from './components/Confessions'
import Promises from './components/Promises'
import Protocol from './components/Protocol'
import LoveMeter from './components/LoveMeter'
import Seal from './components/Seal'
import Panda from './components/Panda'
import Finale from './components/Finale'
import SongsPlayer from './components/SongsPlayer'
import Divider from './components/Divider'
import Grain from './components/Grain'
import Dust from './components/Dust'
import SkyLite from './components/SkyLite'

const Sky = lazy(() => import('./components/Sky'))

export default function App() {
  const [opened, setOpened] = useState(false)
  const deepen = useRef<HTMLDivElement>(null)

  /* the page is a book: locked shut until she opens the cover */
  useEffect(() => {
    document.documentElement.classList.toggle('locked', !opened)
  }, [opened])

  useEffect(() => {
    installTapSparkles()
    installMagnetics()
    installCursor()
    /* letterize the tale once everything has mounted (behind the cover, unseen) */
    const inkTimer = setTimeout(installInk, 80)
    if (tier !== 'lite') {
      const arm = () => armGyroOnGesture()
      addEventListener('pointerdown', arm, { once: true })
      return () => { removeEventListener('pointerdown', arm); clearTimeout(inkTimer) }
    }
    return () => clearTimeout(inkTimer)
  }, [])

  /* a gentle extra veil for content contrast as the night deepens
     (the WebGL sky does its own journey — this guards legibility) */
  useEffect(() => {
    if (!opened || reduced) return
    ScrollTrigger.refresh()
    const tw = gsap.to(deepen.current, {
      opacity: 1, ease: 'none',
      scrollTrigger: {
        trigger: document.body, start: 'top top',
        end: () => Math.max(1, document.documentElement.scrollHeight - innerHeight),
        scrub: true,
      },
    })
    return () => { tw.scrollTrigger?.kill(); tw.kill() }
  }, [opened])

  const onOpen = () => {
    setOpened(true)
    markTale() /* the hero's ink may flow */
    initSmoothScroll()
    requestAnimationFrame(() => ScrollTrigger.refresh())
  }

  return (
    <>
      {tier !== 'lite'
        ? <Suspense fallback={<SkyLite />}><Sky post={tier === 'full'} /></Suspense>
        : <SkyLite />}
      <div ref={deepen} className="deepen" aria-hidden="true" />
      {tier !== 'lite' && !reduced && <Dust />}
      <Grain />

      {!opened && <Cover onOpen={onOpen} />}

      <div className="wrap">
        <Hero opened={opened} />
        <Truths />
        <Divider />
        <Mirror />
      </div>

      <PhotoInterlude
        src={PHOTO_MOON.src} srcSet={PHOTO_MOON.srcSet} alt={PHOTO_MOON.alt}
        q={PHOTO_MOON.q} who={PHOTO_MOON.who} aside={PHOTO_MOON.aside} variant="moon"
      />

      <div className="wrap">
        <StarJar />
        <Divider />
        <Firsts />
        <Divider />
        <TwoCities />
      </div>

      <PhotoInterlude
        src={PHOTO_SUNSET.src} srcSet={PHOTO_SUNSET.srcSet} alt={PHOTO_SUNSET.alt}
        q={PHOTO_SUNSET.q} who={PHOTO_SUNSET.who} aside={PHOTO_SUNSET.aside} variant="sun"
      />

      <div className="wrap">
        <Divider />
        <Replays />
        <Confessions />
        <Divider />
        <Promises />
        <Divider />
        <Protocol />
        <Divider />
        <LoveMeter />
        <Divider />
        <Seal />
        <Divider />
        <Panda />
      </div>

      <Finale />

      <div className="footnote">{FOOTNOTE}</div>
      <div className="credit">{MOON_CREDIT}</div>

      <SongsPlayer />
    </>
  )
}
