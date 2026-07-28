import { useEffect, useRef, useState } from 'react'
import { SCENES, HEADS, type Speaker } from '../content'
import SectionHead from './SectionHead'
import { ScrollTrigger } from '../lib/gsapSetup'
import { reduced } from '../lib/prefs'

interface Line { w: Speaker; text: string; time?: string }

export default function Replays() {
  const [sceneIdx, setSceneIdx] = useState(0)
  const [lines, setLines] = useState<Line[]>([])
  const [typing, setTyping] = useState<Speaker | null>(null)
  const token = useRef(0)
  const body = useRef<HTMLDivElement>(null)
  const phone = useRef<HTMLDivElement>(null)
  const started = useRef(false)

  const play = (i: number) => {
    const my = ++token.current
    const sc = SCENES[i]
    setSceneIdx(i)
    setLines([])
    setTyping(null)
    if (reduced) {
      setLines(sc.messages.map(([w, text, time]) => ({ w, text, time })))
      return
    }
    let k = 0
    const next = () => {
      if (my !== token.current) return
      if (k >= sc.messages.length) return
      const [w, text, time] = sc.messages[k++]
      if (w === 'sys') {
        setTimeout(() => {
          if (my !== token.current) return
          setLines((l) => [...l, { w, text }])
          setTimeout(next, 950)
        }, 350)
        return
      }
      setTyping(w)
      const wait = Math.min(1500, 420 + text.length * 18)
      setTimeout(() => {
        if (my !== token.current) return
        setTyping(null)
        setLines((l) => [...l, { w, text, time }])
        setTimeout(next, 520)
      }, wait)
    }
    next()
  }

  /* autoplay the first scene the moment the phone appears */
  useEffect(() => {
    const el = phone.current
    if (!el) return
    const st = ScrollTrigger.create({
      trigger: el, start: 'top 75%', once: true,
      onEnter: () => { if (!started.current) { started.current = true; play(0) } },
    })
    return () => st.kill()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const b = body.current
    if (b) b.scrollTop = b.scrollHeight
  }, [lines, typing])

  useEffect(() => () => { token.current++ }, [])

  return (
    <section className="theaterwrap">
      <SectionHead copy={HEADS.replays} />
      <div className="schips">
        {SCENES.map((sc, i) => (
          <button
            key={i}
            className={'schip' + (i === sceneIdx ? ' active' : '')}
            onClick={() => play(i)}
          >{sc.title}</button>
        ))}
      </div>
      <div ref={phone} className="phone">
        <div className="phead">
          <span className="pav" aria-hidden="true">✦</span>
          <span className="pname">H &amp; H <i>{SCENES[sceneIdx].date}</i></span>
          <button className="preplay" aria-label="Replay" onClick={() => play(sceneIdx)}>⟲</button>
        </div>
        <div ref={body} className="pbody">
          {lines.map((l, i) =>
            l.w === 'sys'
              ? <div key={i} className="b sys">{l.text}</div>
              : (
                <div key={i} className={'b ' + l.w}>
                  {l.text}
                  {l.time && <span className="bt">{l.time}</span>}
                </div>
              ),
          )}
          {typing && (
            <div className={'typing' + (typing === 'him' ? ' him' : '')}><i /><i /><i /></div>
          )}
        </div>
      </div>
      <div className="hintl" style={{ marginTop: 14 }}>these are real. every word, every timestamp.</div>
    </section>
  )
}
