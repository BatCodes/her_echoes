import { useEffect, useRef, useState } from 'react'
import { DECREE, HEADS } from '../content'
import SectionHead from './SectionHead'
import { ScrollTrigger } from '../lib/gsapSetup'
import { seal as sealBuzz, tick } from '../lib/haptics'
import { goldDust, goldDebris } from '../lib/fx'
import { keepsake, patch } from '../lib/keepsake'
import { herClock } from '../lib/almanac'
import { waxRasp, waxQuiet, crack } from '../lib/audio'
import { exhaleAt } from '../lib/skyState'

/* The decree hides under painted wax. She rubs it away with her thumb.
   The wax is embossed and stippled like the real thing, it rasps under
   speed, a crack races across it near the end — and once broken it
   STAYS broken, across every future visit. */
export default function Seal() {
  const decree = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const [cleared, setCleared] = useState(() => !!keepsake().sealBroken)
  const [fading, setFading] = useState(false)
  const painted = useRef(false)
  const rubbing = useRef(false)
  const lastFleck = useRef(0)
  const lastBuzz = useRef(0)
  const lastPt = useRef({ x: 0, y: 0, t: 0 })
  const brokenOn = keepsake().sealBroken

  useEffect(() => {
    if (cleared) return
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
      /* wax with a soul: stippled grain across the slab */
      ctx.fillStyle = 'rgba(255,255,255,0.025)'
      for (let i = 0; i < 260; i++) {
        ctx.fillRect(Math.random() * r.width, Math.random() * r.height, 1.2, 1.2)
      }
      const cx = r.width / 2, cy = r.height / 2
      /* the medallion — embossed, lit from the upper left */
      ctx.beginPath(); ctx.arc(cx, cy, 46, 0, 7); ctx.fillStyle = '#EEC07A'; ctx.fill()
      const hi = ctx.createRadialGradient(cx - 16, cy - 18, 4, cx, cy, 52)
      hi.addColorStop(0, 'rgba(255,246,224,.55)')
      hi.addColorStop(0.5, 'rgba(255,246,224,0)')
      hi.addColorStop(1, 'rgba(90,53,80,.25)')
      ctx.beginPath(); ctx.arc(cx, cy, 46, 0, 7); ctx.fillStyle = hi; ctx.fill()
      ctx.beginPath(); ctx.arc(cx, cy, 38, 0, 7); ctx.strokeStyle = '#B98B4E'; ctx.lineWidth = 2; ctx.stroke()
      ctx.beginPath(); ctx.arc(cx, cy, 44, 0, 7); ctx.strokeStyle = 'rgba(138,90,43,.5)'; ctx.lineWidth = 1; ctx.stroke()
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
  }, [cleared])

  const breakOpen = (ctx: CanvasRenderingContext2D, w: number, h: number, fx: number, fy: number) => {
    /* the crack races from her thumb to the nearest edge, then the wax gives */
    ctx.save()
    ctx.globalCompositeOperation = 'destination-out'
    ctx.lineWidth = 14
    ctx.lineCap = 'round'
    const toRight = fx > w / 2
    const endX = toRight ? w + 20 : -20
    ctx.beginPath()
    ctx.moveTo(fx, fy)
    const segs = 7
    for (let i = 1; i <= segs; i++) {
      const t = i / segs
      ctx.lineTo(fx + (endX - fx) * t, fy + (Math.random() - 0.5) * 46)
    }
    ctx.stroke()
    ctx.restore()
    setCleared(true)
    setFading(true)
    waxQuiet()
    crack(0.16)
    sealBuzz()
    const c = herClock()
    patch({ sealBroken: `${String(c.d).padStart(2, '0')}.${String(c.m).padStart(2, '0')}.${c.y}` })
    const r = canvas.current!.getBoundingClientRect()
    const mx = r.left + r.width / 2
    const my = r.top + r.height / 2
    goldDust(mx, my, 22, 180)
    goldDust(mx, my - 70, 10)
    exhaleAt(mx, my)
    setTimeout(() => setFading(false), 900)
  }

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

    /* velvet scratch — the material answers her speed */
    const now = performance.now()
    const lp = lastPt.current
    const dt = now - lp.t
    if (dt > 0 && dt < 200) {
      const speed = Math.min(1, Math.hypot(x - lp.x, y - lp.y) / dt / 1.4)
      waxRasp(speed)
      if (now - lastFleck.current > Math.max(28, 70 - speed * 45)) {
        lastFleck.current = now
        goldDebris(e.clientX, e.clientY, 2 + Math.round(speed * 4))
      }
      if (now - lastBuzz.current > Math.max(90, 200 - speed * 110)) {
        lastBuzz.current = now
        tick()
      }
    }
    lastPt.current = { x, y, t: now }

    if (Math.random() < 0.12) {
      const d = ctx.getImageData(0, 0, c.width, c.height).data
      let empty = 0
      const step = 4 * 97
      for (let i = 3; i < d.length; i += step) if (d[i] === 0) empty++
      /* at ~40% cleared the wax fails all at once — a crack, then daylight */
      if (empty / (d.length / step) > 0.4) breakOpen(ctx, r.width, r.height, x, y)
    }
    ctx.restore()
  }

  useEffect(() => {
    const move = (e: PointerEvent) => { if (rubbing.current) scratch(e) }
    const up = () => {
      rubbing.current = false
      waxQuiet()
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
              lastPt.current = { x: 0, y: 0, t: 0 }
              e.currentTarget.style.cursor = 'grabbing'
              scratch(e)
            }}
            aria-label="Rub to break the seal"
          />
        )}
      </div>
      <div className="sealhint">
        {cleared
          ? (brokenOn ? `seal broken · unsealed by Her Highness on ${brokenOn} ♥` : 'seal broken · decree in effect ♥')
          : 'rub the golden seal to break it'}
      </div>
    </section>
  )
}
