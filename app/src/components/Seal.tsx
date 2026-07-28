import { useEffect, useRef, useState } from 'react'
import { DECREE, HEADS } from '../content'
import SectionHead from './SectionHead'
import { ScrollTrigger } from '../lib/gsapSetup'
import { vibrate } from '../lib/prefs'
import { burst, sparklePoint } from '../lib/fx'

/* The decree hides under painted wax. She rubs it away with her thumb. */
export default function Seal() {
  const decree = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const [cleared, setCleared] = useState(false)
  const [fading, setFading] = useState(false)
  const painted = useRef(false)
  const rubbing = useRef(false)
  const lastFleck = useRef(0)

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
      ctx.fillStyle = '#C3BCE0'
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

    /* gold flecks fall off the wax as she rubs */
    const now = performance.now()
    if (now - lastFleck.current > 90) {
      lastFleck.current = now
      sparklePoint(e.clientX, e.clientY)
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
        burst(18)
        setTimeout(() => setFading(false), 900)
      }
    }
  }

  useEffect(() => {
    const move = (e: PointerEvent) => { if (rubbing.current) scratch(e) }
    const up = () => { rubbing.current = false }
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
            onPointerDown={(e) => { rubbing.current = true; scratch(e) }}
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
