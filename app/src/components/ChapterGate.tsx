import { useEffect, useRef } from 'react'
import { ScrollTrigger } from '../lib/gsapSetup'
import { skyState, setWeather } from '../lib/skyState'
import { tick } from '../lib/haptics'
import type { Gate } from '../content'

/* ═══════════════════════════════════════════════════════════════
   a chapter gate — the journey's thresholds.
   A full-screen night pause where the next chapter announces
   itself in enchanted ink (it renders as a .shead, so lib/ink.ts
   letterizes it for free), the camera is called deeper into the
   starfield, and the dust changes weather. Crossing one should
   feel like arrival, never like scrolling.
   ═══════════════════════════════════════════════════════════════ */

export default function ChapterGate({ gate, prevZ, prevWeather }: {
  gate: Gate
  /** where the camera returns if she scrolls back up through the gate */
  prevZ: number
  prevWeather: string
}) {
  const root = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = root.current
    if (!el) return
    const st = ScrollTrigger.create({
      trigger: el, start: 'top 62%',
      onEnter: () => {
        skyState.zTarget = gate.z
        setWeather(gate.weather)
        tick(el)
      },
      onLeaveBack: () => {
        skyState.zTarget = prevZ
        setWeather(prevWeather)
      },
    })
    return () => st.kill()
  }, [gate, prevZ, prevWeather])

  return (
    <section ref={root} className="chgate">
      <div className="shead">
        <span className="fl">{gate.fl}</span>
        <h2 dangerouslySetInnerHTML={{ __html: gate.h2 }} />
        <p dangerouslySetInnerHTML={{ __html: gate.p }} />
      </div>
    </section>
  )
}

/* a whisper breath — a near-empty screen of drifting stars with
   one small line; the journey inhales between dense chapters.
   (renders as a bare .shead so the ink writes it too) */
export function Breath({ line }: { line: string }) {
  return (
    <section className="breath">
      <div className="shead">
        <p dangerouslySetInnerHTML={{ __html: line }} />
      </div>
    </section>
  )
}
