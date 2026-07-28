import { useEffect, useRef, useState } from 'react'
import { MEMORIES, HEADS } from '../content'
import SectionHead from './SectionHead'
import { reduced, tier, vibrate } from '../lib/prefs'
import { goldDust } from '../lib/fx'

type MatterNS = typeof import('matter-js')

interface StarVisual {
  el: HTMLSpanElement
  r: number
}

const STAGE_W = 220
const STAGE_H = 280
const STAR_COUNT = 13

/* jar glass, faithfully scaled from the original artwork (100×128 → 220×280) */
function JarGlass() {
  return (
    <svg className="jarglass" viewBox="0 0 100 128" aria-hidden="true" preserveAspectRatio="xMidYMax meet">
      <rect x="30" y="2" width="40" height="10" rx="4" fill="#B98B4E" />
      <path
        d="M26 14 h48 v8 c8 8 12 18 12 30 v54 c0 12 -10 20 -22 20 h-28 c-12 0 -22 -8 -22 -20 v-54 c0 -12 4 -22 12 -30 z"
        fill="rgba(46,37,96,.75)" stroke="#EEC07A" strokeWidth="2"
      />
    </svg>
  )
}

export default function StarJar() {
  const stage = useRef<HTMLDivElement>(null)
  const flyer = useRef<HTMLSpanElement>(null)
  const [memIdx, setMemIdx] = useState<number | null>(null)
  const [show, setShow] = useState(false)
  const busy = useRef(false)
  const order = useRef<number[]>([...MEMORIES.keys()])
  const oi = useRef(-1)

  /* physics world (full tier only) */
  const physics = useRef<{
    M: MatterNS
    engine: import('matter-js').Engine
    bodies: import('matter-js').Body[]
    visuals: StarVisual[]
    raf: number
    running: boolean
    freeIdx: number
    freeFaded: boolean
    freeTimer: number
    onMotion?: (e: DeviceMotionEvent) => void
  } | null>(null)

  useEffect(() => {
    if (tier !== 'full') return
    let disposed = false
    let obs: IntersectionObserver | null = null

    import('matter-js').then((M) => {
      const el = stage.current
      if (disposed || !el) return

      const engine = M.Engine.create()
      engine.gravity.y = 1

      /* invisible walls tracing the glass interior (stage coords, 220×280) */
      const wall = (x: number, y: number, w: number, h: number, angle = 0) =>
        M.Bodies.rectangle(x, y, w, h, { isStatic: true, angle, friction: 0.08 })
      const walls = [
        wall(110, 262, 150, 24),            // floor
        wall(36, 180, 22, 180),             // left glass
        wall(184, 180, 22, 180),            // right glass
        wall(52, 78, 60, 18, -0.62),        // left shoulder
        wall(168, 78, 60, 18, 0.62),        // right shoulder
      ]

      const bodies: import('matter-js').Body[] = []
      const visuals: StarVisual[] = []
      for (let i = 0; i < STAR_COUNT; i++) {
        const r = 6 + Math.random() * 5
        const b = M.Bodies.circle(75 + Math.random() * 70, 100 + Math.random() * 60, r, {
          restitution: 0.42, friction: 0.06, frictionAir: 0.012, density: 0.0018,
        })
        bodies.push(b)
        const s = document.createElement('span')
        s.className = 'starbit' + (Math.random() < 0.4 ? ' b' : '')
        s.textContent = Math.random() < 0.75 ? '✦' : '★'
        s.style.fontSize = r * 2 + 'px'
        el.appendChild(s)
        visuals.push({ el: s, r })
      }
      M.Composite.add(engine.world, [...walls, ...bodies])

      const state: NonNullable<typeof physics.current> =
        { M, engine, bodies, visuals, raf: 0, running: false, freeIdx: -1, freeFaded: false, freeTimer: 0 }
      physics.current = state

      let last = performance.now()
      const loop = (t: number) => {
        if (!state.running) return
        const dt = Math.min(32, t - last)
        last = t
        M.Engine.update(engine, dt)
        for (let i = 0; i < bodies.length; i++) {
          const b = bodies[i], v = visuals[i]
          v.el.style.transform =
            `translate3d(${(b.position.x - v.r).toFixed(1)}px, ${(b.position.y - v.r).toFixed(1)}px, 0) rotate(${(b.angle * 57.3).toFixed(1)}deg)`
        }
        /* the freed star clears the mouth — dissolve it into dust */
        if (state.freeIdx >= 0 && !state.freeFaded) {
          const fb = bodies[state.freeIdx]
          if (fb.position.y < 30) {
            state.freeFaded = true
            visuals[state.freeIdx].el.style.opacity = '0'
            const r = el.getBoundingClientRect()
            goldDust(r.left + fb.position.x, r.top + fb.position.y, 9, 60)
          }
        }
        state.raf = requestAnimationFrame(loop)
      }

      obs = new IntersectionObserver((es) => {
        es.forEach((e) => {
          state.running = e.isIntersecting
          if (e.isIntersecting) { last = performance.now(); state.raf = requestAnimationFrame(loop) }
          else cancelAnimationFrame(state.raf)
        })
      }, { threshold: 0.1 })
      obs.observe(el)

      /* a real shake tumbles the stars */
      let lastShake = 0
      const onMotion = (e: DeviceMotionEvent) => {
        const a = e.accelerationIncludingGravity
        if (!a) return
        const mag = Math.abs(a.x ?? 0) + Math.abs(a.y ?? 0) + Math.abs((a.z ?? 0) - 9.8)
        const now = Date.now()
        if (mag > 26 && now - lastShake > 300 && state.running) {
          lastShake = now
          bodies.forEach((b) => M.Body.applyForce(b, b.position, {
            x: (Math.random() - 0.5) * 0.004,
            y: -Math.random() * 0.005,
          }))
        }
      }
      addEventListener('devicemotion', onMotion)
      state.onMotion = onMotion
    })

    return () => {
      disposed = true
      obs?.disconnect()
      const p = physics.current
      if (p) {
        p.running = false
        cancelAnimationFrame(p.raf)
        clearTimeout(p.freeTimer)
        if (p.onMotion) removeEventListener('devicemotion', p.onMotion)
        p.visuals.forEach((v) => v.el.remove())
        p.M.Engine.clear(p.engine)
        physics.current = null
      }
    }
  }, [])

  const askMotionPermission = () => {
    try {
      const DME = (window as Window & { DeviceMotionEvent?: { requestPermission?: () => Promise<string> } }).DeviceMotionEvent
      DME?.requestPermission?.().catch(() => {})
    } catch { /* fine */ }
  }

  const pull = () => {
    if (busy.current) return
    busy.current = true
    askMotionPermission()
    vibrate(6)

    const p = physics.current
    if (p) {
      if (p.freeIdx < 0) {
        /* release the topmost star — up, out, through nothing at all */
        let idx = 0
        for (let i = 1; i < p.bodies.length; i++) {
          if (p.bodies[i].position.y < p.bodies[idx].position.y) idx = i
        }
        const top = p.bodies[idx]
        const savedFilter = top.collisionFilter
        p.freeIdx = idx
        p.freeFaded = false
        p.visuals[idx].el.classList.add('free')
        top.collisionFilter = { group: -1, category: 0, mask: 0 }
        p.M.Body.setVelocity(top, { x: (Math.random() - 0.5) * 2.5, y: -13 })
        p.M.Body.setAngularVelocity(top, (Math.random() - 0.5) * 0.3)
        /* the jar never runs dry — home the star while no one is looking */
        p.freeTimer = window.setTimeout(() => {
          const q = physics.current
          if (!q) return
          q.visuals[idx].el.style.opacity = ''
          q.visuals[idx].el.classList.remove('free')
          top.collisionFilter = savedFilter
          q.M.Body.setPosition(top, { x: 75 + Math.random() * 70, y: 120 })
          q.M.Body.setVelocity(top, { x: 0, y: 0 })
          q.M.Body.setAngularVelocity(top, 0)
          q.freeIdx = -1
        }, 900)
      }
    } else if (flyer.current) {
      const f = flyer.current
      f.classList.remove('go'); void f.offsetWidth; f.classList.add('go')
      const r = stage.current?.getBoundingClientRect()
      if (r) goldDust(r.left + r.width / 2, r.top + 30, 8, 50)
    }

    setShow(false)
    setTimeout(() => {
      oi.current++
      if (oi.current >= order.current.length) {
        order.current = [...MEMORIES.keys()].sort(() => Math.random() - 0.5)
        oi.current = 0
      }
      setMemIdx(order.current[oi.current])
      setShow(true)
      busy.current = false
    }, reduced ? 50 : 820)
  }

  const m = memIdx !== null ? MEMORIES[memIdx] : null

  return (
    <section id="jarSec">
      <SectionHead copy={HEADS.jar} />
      <div
        ref={stage} className="jarstage" role="button" tabIndex={0}
        aria-label="Tap the jar of memories"
        onClick={pull}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pull() } }}
      >
        <JarGlass />
        <span ref={flyer} className="jarflyer" style={{ left: '46%', top: '38%' }} aria-hidden="true">✦</span>
      </div>
      <div className="hintl">tap the jar{tier === 'full' ? ' · or shake your phone' : ''}</div>
      <div className={'mem' + (show ? ' show' : '')} aria-live="polite">
        {m && (
          <>
            <div className="mdate">{m.date}</div>
            <div className="mq" dangerouslySetInnerHTML={{ __html: m.quote }} />
            <div className="mwho" dangerouslySetInnerHTML={{ __html: m.who }} />
            <div className="maside" dangerouslySetInnerHTML={{ __html: m.aside }} />
          </>
        )}
      </div>
      {m && <button className="jarbtn" onClick={pull}>✦ another star</button>}
    </section>
  )
}
