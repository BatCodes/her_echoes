import { useEffect, useRef, useState } from 'react'
import { DECREE, HEADS } from '../content'
import SectionHead from './SectionHead'
import { ScrollTrigger } from '../lib/gsapSetup'
import { vibrate } from '../lib/prefs'
import { goldDust, goldDebris } from '../lib/fx'

/* The decree hides under painted wax. She rubs it away with her thumb. */
export default function Seal() {
  const decree = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const [cleared, setCleared] = useState(false)
  const [fading, setFading] = useState(false)
  const painted = useRef(false)
  const rubbing = useRef(false)
  const lastFleck = useRef(0)
  const lastBuzz = useRef(0)

  useEffect(() => {
    const el = decree.current
    if (!el) return

    const paint = () => {
      const c = canvas.current
      if (!c || painted.current) return
      painted.current = true
      const r = el.getBoundingClientRect()
      const dpr = Math.min(devicePixelRatio || 1, 2)
      c.width = r.width * dpr
      c.height = r.height * dpr
      const ctx = c.getContext('2d')
      if (!ctx) return
      ctx.scale(dpr, dpr)
      const grd = ctx.createLinearGradient(0, 0, r.width, r.height)
      grd.addColorStop(0, '#2E2560'); grd.addColorStop(1, '#221B44')
      ctx.fillStyle = grd
      ctx.fillRect(0, 0, r.width, r.height)
      const cx = r.width / 2, cy = r.height / 2
      ctx.beginPath(); ctx.arc(cx, cy, 46, 0, 7); ctx.fillStyle = '#EEC07A'; ctx.fill()
      ctx.beginPath(); ctx.arc(cx, cy, 38, 0, 7); ctx.strokeStyle = '#B98B4E'; ctx.lineWidth = 2; ctx.stroke()
      ctx.fillStyle = '#8A5A2B'
      ctx.font = 'italic 600 26px "Cormorant Garamond", Georgia, serif'
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText('H♥H', cx, cy + 1)
      ctx.fillStyle = '#e9ddc8'
      ctx.font = '300 11px Poppins, sans-serif'
      ctx.fillText(DECREE.sealLabel, cx, cy + 72)
    }

    const st = ScrollTrigger.create({
      trigger: el, start: 'top 78%', once: true,
      onEnter: () => { document.fonts.ready.then(paint).catch(paint) },
    })
    return () => st.kill()
  }, [])

  const scratch = (e: PointerEvent | React.PointerEvent) => {
    const c = canvas.current
    if (!c || cleared) return
    const r = c.getBoundingClientRect()
    const x = e.clientX - r.left
    const y = e.clientY - r.top
    const ctx = c.getContext('2d')
    if (!ctx) return
    const dpr = Math.min(devicePixelRatio || 1, 2)
    ctx.save()
    ctx.scale(dpr, dpr)
    ctx.globalCompositeOperation = 'destination-out'
    ctx.beginPath(); ctx.arc(x, y, 26, 0, 7); ctx.fill()
    ctx.restore()

    /* wax crumbs fall off as she rubs · a small hum under her thumb */
    const now = performance.now()
    if (now - lastFleck.current > 45) {
      lastFleck.current = now
      goldDebris(e.clientX, e.clientY, 3)
    }
    if (now - lastBuzz.current > 180) {
      lastBuzz.current = now
      vibrate(3)
    }

    if (Math.random() < 0.12) {
      const d = ctx.getImageData(0, 0, c.width, c.height).data
      let empty = 0
      const step = 4 * 97
      for (let i = 3; i < d.length; i += step) if (d[i] === 0) empty++
      if (empty / (d.length / step) > 0.5) {
        setCleared(true)
        setFading(true)
        vibrate([14, 30, 14])
        /* the wax exhales as it breaks */
        const mx = r.left + r.width / 2
        const my = r.top + r.height / 2
        goldDust(mx, my, 22, 180)
        goldDust(mx, my - 70, 10)
        setTimeout(() => setFading(false), 900)
      }
    }
  }

  useEffect(() => {
    const move = (e: PointerEvent) => { if (rubbing.current) scratch(e) }
    const up = () => {
      rubbing.current = false
      if (canvas.current) canvas.current.style.cursor = ''
    }
    addEventListener('pointermove', move)
    addEventListener('pointerup', up)
    addEventListener('pointercancel', up)
    return () => {
      removeEventListener('pointermove', move)
      removeEventListener('pointerup', up)
      removeEventListener('pointercancel', up)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cleared])

  return (
    <section className="sealwrap">
      <SectionHead copy={HEADS.decree} />
      <div ref={decree} className="decree">
        <div className="dk">{DECREE.kicker}</div>
        <h3>{DECREE.heading}</h3>
        <p dangerouslySetInnerHTML={{ __html: DECREE.p1 }} />
        <p dangerouslySetInnerHTML={{ __html: DECREE.p2 }} />
        <div className="dsign">{DECREE.sign}</div>
        <div className="dwit">{DECREE.witness}</div>
        {(!cleared || fading) && (
          <canvas
            ref={canvas}
            className="sealcanvas"
            style={fading ? { transition: 'opacity .8s', opacity: 0 } : undefined}
            onPointerDown={(e) => {
              rubbing.current = true
              e.currentTarget.style.cursor = 'grabbing'
              scratch(e)
            }}
            aria-label="Rub to break the seal"
          />
        )}
      </div>
      <div className="sealhint">
        {cleared ? 'seal broken · decree in effect ♥' : 'rub the golden seal to break it'}
      </div>
    </section>
  )
}
