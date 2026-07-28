import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import {
  FOOTNOTE, MOON_CREDIT, PHOTO_MOON, PHOTO_SUNSET,
  GATES, BREATHS, SEVEN02, LATE_NIGHT, OCCASIONS, MONTHLY_26, VISIT_STAR_NOTE,
} from './content'
import { gsap, ScrollTrigger } from './lib/gsapSetup'
import { reduced, tier } from './lib/prefs'
import { initSmoothScroll } from './lib/scroll'
import { installTapSparkles } from './lib/fx'
import { installCursor, installMagnetics } from './lib/interact'
import { installInk, markTale } from './lib/ink'
import { armGyroOnGesture } from './lib/gyro'
import { installFoil } from './lib/foil'
import { keepsake, openVisit, onceToday } from './lib/keepsake'
import { herClock, isHerLateNight, isSevenOhTwo, occasion, isMonthly26 } from './lib/almanac'
import { unlock, bloom } from './lib/audio'
import { skyState, meteorShower } from './lib/skyState'

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
import ChapterGate, { Breath } from './components/ChapterGate'
import WayfarerThread from './components/WayfarerThread'
import Epilogue from './components/Epilogue'

const Sky = lazy(() => import('./components/Sky'))

export default function App() {
  const [opened, setOpened] = useState(false)
  const [slip, setSlip] = useState<string | null>(null)
  const deepen = useRef<HTMLDivElement>(null)
  const slipTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  /* the page is a book: locked shut until she opens the cover */
  useEffect(() => {
    document.documentElement.classList.toggle('locked', !opened)
  }, [opened])

  const showSlip = (html: string, ms: number) => {
    if (slipTimer.current) clearTimeout(slipTimer.current)
    setSlip(html)
    slipTimer.current = setTimeout(() => setSlip(null), ms)
  }

  useEffect(() => {
    openVisit() /* the kingdom notes she came home */
    document.documentElement.dataset.tier = tier
    if (isHerLateNight()) document.documentElement.dataset.lateNight = 'true'
    installTapSparkles()
    installMagnetics()
    installCursor()
    installFoil()
    /* letterize the tale once everything has mounted (behind the cover, unseen) */
    const inkTimer = setTimeout(installInk, 80)
    /* the 7:02 minute — the minute she said Yes, in her timezone */
    const minuteWatch = setInterval(() => {
      if (isSevenOhTwo() && onceToday('702', herClock().ymd)) {
        showSlip(SEVEN02, 60000)
        meteorShower(2500)
      }
    }, 20000)
    if (tier !== 'lite') {
      const arm = () => armGyroOnGesture()
      addEventListener('pointerdown', arm, { once: true })
      return () => {
        removeEventListener('pointerdown', arm)
        clearTimeout(inkTimer); clearInterval(minuteWatch)
      }
    }
    return () => { clearTimeout(inkTimer); clearInterval(minuteWatch) }
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
    /* landfall — the camera reaches its closest point just before the letter */
    const land = ScrollTrigger.create({
      trigger: '#finale', start: 'top 70%',
      onEnter: () => { skyState.zTarget = 6 },
      onLeaveBack: () => { skyState.zTarget = GATES.four.z },
    })
    return () => { tw.scrollTrigger?.kill(); tw.kill(); land.kill() }
  }, [opened])

  const onOpen = () => {
    unlock() /* her cover tap is the gesture that gives the world sound */
    bloom()
    setOpened(true)
    markTale() /* the hero's ink may flow */
    initSmoothScroll()
    requestAnimationFrame(() => ScrollTrigger.refresh())
    /* the almanac speaks once, quietly, after the camera lands */
    setTimeout(() => {
      const occ = occasion()
      if (isHerLateNight()) showSlip(LATE_NIGHT, 14000)
      else if (occ && OCCASIONS[occ]) showSlip(OCCASIONS[occ], 12000)
      else if (isMonthly26()) showSlip(MONTHLY_26, 9000)
      else if (keepsake().visits > 2 && keepsake().visits % 5 === 0)
        showSlip(VISIT_STAR_NOTE(Math.min(keepsake().visits, 40)), 9000)
    }, 2600)
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
      {opened && !reduced && <WayfarerThread />}

      <div className="wrap">
        <Hero opened={opened} />
        <Truths />
        <Divider />
        <Mirror />
      </div>

      <ChapterGate gate={GATES.two} prevZ={14} prevWeather="#eec07a" />

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

      <ChapterGate gate={GATES.three} prevZ={GATES.two.z} prevWeather={GATES.two.weather} />

      <PhotoInterlude
        src={PHOTO_SUNSET.src} srcSet={PHOTO_SUNSET.srcSet} alt={PHOTO_SUNSET.alt}
        q={PHOTO_SUNSET.q} who={PHOTO_SUNSET.who} aside={PHOTO_SUNSET.aside} variant="sun"
      />

      <div className="wrap">
        <Divider />
        <Replays />
        <Breath line={BREATHS[0]} />
        <Confessions />
        <Divider />
        <Promises />
        <Divider />
        <Protocol />
        <Divider />
        <LoveMeter />
        <Breath line={BREATHS[1]} />
        <Seal />
        <Divider />
        <Panda />
      </div>

      <ChapterGate gate={GATES.four} prevZ={GATES.three.z} prevWeather={GATES.three.weather} />

      <Finale />

      <div className="wrap"><Epilogue /></div>

      <div className="footnote">{FOOTNOTE}</div>
      <div className="credit">{MOON_CREDIT}</div>

      <div className={'slip' + (slip ? ' show' : '')} aria-live="polite">
        {slip && <span dangerouslySetInnerHTML={{ __html: slip }} />}
      </div>

      <SongsPlayer />
    </>
  )
}
