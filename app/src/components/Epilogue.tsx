import { useEffect, useRef, useState } from 'react'
import { EPILOGUE, WHISPERS, WHISPER_INTRO } from '../content'
import { keepsake } from '../lib/keepsake'
import { dayOfForever } from '../lib/almanac'
import { ScrollTrigger } from '../lib/gsapSetup'
import { skyState } from '../lib/skyState'
import { scrollToEl } from '../lib/scroll'
import { useReveal } from '../lib/reveal'
import { goldDust } from '../lib/fx'
import { crack } from '../lib/audio'
import { seal as sealBuzz } from '../lib/haptics'

/* ═══════════════════════════════════════════════════════════════
   the epilogue — the census of this night, one whisper for this
   visit only, and two stars igniting side by side, permanent.
   The return line sails her back to the beginning as the camera
   pulls all the way back out — the story repeats forever.
   ═══════════════════════════════════════════════════════════════ */

export default function Epilogue() {
  const root = useRef<HTMLElement>(null)
  const census = useRef<HTMLDivElement>(null)
  useReveal(census)
  const [c, setC] = useState<{ truths: number; stars: number; seals: number; day: number } | null>(null)
  const [whisper, setWhisper] = useState<{ open: boolean; text: string }>(() => {
    const k = keepsake()
    return { open: false, text: WHISPERS[(Math.max(1, k.visits) - 1) % WHISPERS.length] }
  })

  useEffect(() => {
    const el = root.current
    if (!el) return
    const st = ScrollTrigger.create({
      trigger: el, start: 'top 75%', once: true,
      onEnter: () => {
        skyState.epilogue = true /* the two stars ignite */
        const k = keepsake()
        setC({
          truths: k.truths.length,
          stars: k.freedStars,
          seals: k.confessions.length + (k.sealBroken ? 1 : 0),
          day: dayOfForever(),
        })
      },
    })
    return () => st.kill()
  }, [])

  const openWhisper = (e: React.MouseEvent) => {
    if (whisper.open) return
    setWhisper((w) => ({ ...w, open: true }))
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
    goldDust(r.left + r.width / 2, r.top + 10, 10, 80)
    crack(0.1)
    sealBuzz(e.currentTarget as HTMLElement)
  }

  const returnHome = () => {
    skyState.zTarget = 14
    scrollToEl('.hero', 0)
  }

  return (
    <section ref={root} className="epilogue">
      <div ref={census} className="census" style={{ visibility: 'hidden' }}>
        <div className="k">{EPILOGUE.kicker}</div>
        <h3>{EPILOGUE.heading}</h3>
        <div className="cline"><span>{EPILOGUE.truths}</span><b>{c ? `${c.truths} of 8` : '·'}</b></div>
        <div className="cline"><span>{EPILOGUE.stars}</span><b>{c ? c.stars : '·'}</b></div>
        <div className="cline"><span>{EPILOGUE.seals}</span><b>{c ? c.seals : '·'}</b></div>
        <div className="cline"><span>{EPILOGUE.day}</span><b>{c ? c.day : '·'}</b></div>
        <p className="twostars" dangerouslySetInnerHTML={{ __html: EPILOGUE.twoStars }} />

        <button className={'whisperslip' + (whisper.open ? ' open' : '')} onClick={openWhisper}>
          {!whisper.open && <span className="wsx" dangerouslySetInnerHTML={{ __html: WHISPER_INTRO }} />}
          {whisper.open && <span className="wst" dangerouslySetInnerHTML={{ __html: whisper.text }} />}
          {!whisper.open && <span className="wsseal" aria-hidden="true">✦</span>}
        </button>

        <button className="goldbtn" onClick={returnHome}>{EPILOGUE.returnCta}</button>
        <div className="retnote">{EPILOGUE.returnNote}</div>
      </div>
    </section>
  )
}
